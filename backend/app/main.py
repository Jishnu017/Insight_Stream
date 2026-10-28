from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import connect_to_mongo, close_mongo_connection
from app.routers import ingest, chat, documents, delete_file, purge

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB
    await connect_to_mongo()
    yield
    # Shutdown: Close MongoDB connection
    await close_mongo_connection()

app = FastAPI(
    title="InsightStream RAG API",
    description="Enterprise Multi-Tenant AI Knowledge Base powered by FastAPI and MongoDB",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for Angular frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(ingest.router)
app.include_router(chat.router)
app.include_router(documents.router)
app.include_router(delete_file.router)
app.include_router(purge.router)

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "InsightStream FastAPI Backend",
        "docs": "/docs"
    }
