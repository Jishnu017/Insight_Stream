import logging

from fastapi import APIRouter, Depends, HTTPException, status
from app.security import get_current_org, UserIdentity
from app.models.chat import ChatRequest, ChatResponse
from app.services.cohere_service import generate_embeddings
from app.services.vector_service import search_similar_documents
from app.services.groq_service import generate_rag_response

router = APIRouter(prefix="/api", tags=["chat"])
logger = logging.getLogger(__name__)

@router.post("/chat", response_model=ChatResponse)
async def chat_completion(
    request: ChatRequest,
    identity: UserIdentity = Depends(get_current_org)
):
    try:
        if not request.messages:
            raise HTTPException(status_code=400, detail="Messages array cannot be empty.")

        last_message = request.messages[-1].content
        logger.info("Starting chat request: org_id=%s message_length=%s", identity.org_id, len(last_message))

        # Generate query vector with Cohere
        query_embeddings = await generate_embeddings([last_message], input_type="search_query")
        query_vector = query_embeddings[0]
        logger.info("Query embedding generated: dimensions=%s", len(query_vector))

        # Search MongoDB for matching document chunks for this organization
        matched_chunks = await search_similar_documents(
            query_vector=query_vector,
            org_id=identity.org_id,
            match_threshold=0.01,
            match_count=5
        )
        logger.info("Vector search completed: matched_chunks=%s", len(matched_chunks))

        context = "\n\n".join([doc["content"] for doc in matched_chunks]) if matched_chunks else "Empty context."

        # Generate LLM response using Groq
        ai_response = await generate_rag_response(context=context, user_message=last_message)
        logger.info("Chat response generated: org_id=%s", identity.org_id)

        return ChatResponse(text=ai_response)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Chat request failed: org_id=%s", identity.org_id)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
