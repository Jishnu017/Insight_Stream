from fastapi import APIRouter, Depends, HTTPException, status
from app.security import require_admin_org, UserIdentity
from app.database import get_documents_collection
from app.models.document import DeleteResponse

router = APIRouter(prefix="/api", tags=["purge"])

@router.delete("/purge", response_model=DeleteResponse)
async def purge_memory(
    identity: UserIdentity = Depends(require_admin_org)
):
    try:
        collection = get_documents_collection()
        result = await collection.delete_many({"org_id": identity.org_id})
        return DeleteResponse(message=f"Memory bank purged by administrator. Deleted {result.deleted_count} chunks.")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
