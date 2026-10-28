import httpx
from typing import List
from app.config import settings

COHERE_EMBED_URL = "https://api.cohere.com/v1/embed"

async def generate_embeddings(texts: List[str], input_type: str = "search_document") -> List[List[float]]:
    if not settings.COHERE_API_KEY:
        raise ValueError("COHERE_API_KEY is not configured in settings.")
    
    headers = {
        "Authorization": f"Bearer {settings.COHERE_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "texts": texts,
        "model": "embed-english-v3.0",
        "input_type": input_type
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(COHERE_EMBED_URL, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        embeddings = data.get("embeddings")
        if not embeddings:
            raise ValueError("Cohere failed to return embeddings.")
        return embeddings
