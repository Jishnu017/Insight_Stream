from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.security import require_admin_org, UserIdentity
from app.database import get_documents_collection
from app.models.document import DeleteResponse

router = APIRouter(prefix="/api", tags=["delete-file"])

@router.delete("/delete-file", response_model=DeleteResponse)
async def delete_file(
    filename: str = Query(..., description="Name of file to decommission"),
    identity: UserIdentity = Depends(require_admin_org)
):
    try:
        collection = get_documents_collection()
        result = await collection.delete_many({"org_id": identity.org_id, "filename": filename})
        return DeleteResponse(message=f"Successfully deleted {filename} from memory. Removed {result.deleted_count} chunks.")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
