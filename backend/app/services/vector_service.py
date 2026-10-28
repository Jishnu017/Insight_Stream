import numpy as np
from typing import List, Dict, Any
from app.database import get_documents_collection

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    a = np.array(v1, dtype=np.float32)
    b = np.array(v2, dtype=np.float32)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(a, b) / (norm_a * norm_b))

async def search_similar_documents(
    query_vector: List[float],
    org_id: str,
    match_threshold: float = 0.01,
    match_count: int = 5
) -> List[Dict[str, Any]]:
    collection = get_documents_collection()
    cursor = collection.find({"org_id": org_id})
    
    scored_documents = []
    async for doc in cursor:
        doc_embedding = doc.get("embedding")
        if doc_embedding:
            sim = cosine_similarity(query_vector, doc_embedding)
            if sim >= match_threshold:
                scored_documents.append({
                    "id": str(doc["_id"]),
                    "content": doc.get("content", ""),
                    "similarity": sim
                })
    
    # Sort descending by similarity score
    scored_documents.sort(key=lambda x: x["similarity"], reverse=True)
    return scored_documents[:match_count]
