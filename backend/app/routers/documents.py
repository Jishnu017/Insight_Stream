from fastapi import APIRouter, Depends, HTTPException, status
from app.security import get_current_org, UserIdentity
from app.database import get_documents_collection
from app.models.document import DocumentListResponse

router = APIRouter(prefix="/api", tags=["documents"])

@router.get("/documents", response_model=DocumentListResponse)
async def list_documents(
    identity: UserIdentity = Depends(get_current_org)
):
    try:
        collection = get_documents_collection()
        distinct_files = await collection.distinct("filename", {"org_id": identity.org_id, "filename": {"$ne": None}})
        return DocumentListResponse(files=distinct_files)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
