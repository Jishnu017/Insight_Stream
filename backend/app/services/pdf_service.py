import io
from pypdf import PdfReader
from typing import List

def extract_chunks_from_pdf(file_bytes: bytes) -> List[str]:
    reader = PdfReader(io.BytesIO(file_bytes))
    full_text = ""
    for page in reader.pages:
        text = page.extract_text()
        if text:
            full_text += text + "\n\n"
    
    # Split paragraphs by double newlines and filter out short snippets <= 50 chars
    raw_chunks = full_text.split("\n\n")
    chunks = [chunk.strip() for chunk in raw_chunks if len(chunk.strip()) > 50]
    return chunks
