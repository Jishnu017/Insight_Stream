import logging

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from app.security import require_admin_org, UserIdentity
from app.services.pdf_service import extract_chunks_from_pdf
from app.services.cohere_service import generate_embeddings
from app.database import get_documents_collection
from app.models.document import IngestResponse

router = APIRouter(prefix="/api", tags=["ingest"])
logger = logging.getLogger(__name__)

@router.post("/ingest", response_model=IngestResponse)
async def ingest_document(
    file: UploadFile = File(...),
    identity: UserIdentity = Depends(require_admin_org)
):
    try:
        logger.info("Starting PDF ingest: filename=%s org_id=%s", file.filename, identity.org_id)
        contents = await file.read()
        chunks = extract_chunks_from_pdf(contents)

        if not chunks:
            raise HTTPException(status_code=400, detail="No readable text chunks (>50 characters) found in PDF.")

        # Generate 1024-dim Cohere embeddings
        embeddings = await generate_embeddings(chunks, input_type="search_document")

        collection = get_documents_collection()
        documents_to_insert = []
        for i, chunk in enumerate(chunks):
            documents_to_insert.append({
                "content": chunk,
                "embedding": embeddings[i],
                "org_id": identity.org_id,
                "filename": file.filename
            })

        if documents_to_insert:
            await collection.insert_many(documents_to_insert)

        logger.info("Completed PDF ingest: filename=%s chunks=%s", file.filename, len(documents_to_insert))
        return IngestResponse(message="Done")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
