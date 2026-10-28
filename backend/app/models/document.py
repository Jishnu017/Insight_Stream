from pydantic import BaseModel, Field
from typing import List, Optional

class DocumentChunk(BaseModel):
    id: Optional[str] = None
    org_id: str
    filename: str
    content: str
    embedding: List[float]

class DocumentListResponse(BaseModel):
    files: List[str]

class IngestResponse(BaseModel):
    message: str

class DeleteResponse(BaseModel):
    message: str
