# InsightStream

InsightStream is a multi-tenant document knowledge base. Users upload PDFs, the API extracts text chunks, creates Cohere embeddings, stores them in MongoDB, and uses similarity search to provide context for Groq-powered chat responses.

## Architecture

- **Frontend:** Angular 18
- **API:** FastAPI
- **Database:** MongoDB, database `insight_stream`, collection `documents`
- **Authentication:** Clerk Organizations and roles
- **Embeddings:** Cohere `embed-english-v3.0` with 1024-dimensional vectors
- **LLM:** Groq with Llama 3.1 8B Instant

MongoDB is the only application persistence layer. The old Next.js and Supabase implementation has been removed.

## MongoDB document shape

Each document chunk contains:

```json
{
  "org_id": "org_example",
  "filename": "handbook.pdf",
  "content": "Extracted text chunk",
  "embedding": [0.0123, -0.0456]
}
```

MongoDB creates an index on `org_id` and a compound index on `org_id, filename`. Vector similarity is calculated by the FastAPI service using cosine similarity, then filtered by organization and limited to the best matches.

## Configuration

Copy `backend/.env.example` to `backend/.env` and set:

```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=insight_stream
COHERE_API_KEY=your_cohere_api_key
GROQ_API_KEY=your_groq_api_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

Start MongoDB locally or provide a MongoDB Atlas connection string in `MONGODB_URL`.

## Run the backend

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The API is available at `http://localhost:8000`. OpenAPI documentation is available at `http://localhost:8000/docs`.

## Run the Angular frontend

In a second terminal:

```powershell
cd frontend
npm install
npm start
```

The Angular application calls the FastAPI API at `http://localhost:8000/api`.

## API operations

- `POST /api/ingest` uploads and indexes a PDF. Organization administrators only.
- `GET /api/documents` lists indexed filenames for the active organization.
- `POST /api/chat` performs retrieval-augmented chat.
- `DELETE /api/delete-file?filename=...` removes one file.
- `DELETE /api/purge` removes all files for the active organization.
