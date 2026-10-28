from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

class DatabaseManager:
    client: AsyncIOMotorClient = None

db_manager = DatabaseManager()

def get_database():
    return db_manager.client[settings.DATABASE_NAME]

def get_documents_collection():
    return get_database()["documents"]

async def connect_to_mongo():
    db_manager.client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = get_database()
    # Create indexes for fast lookup
    await db["documents"].create_index([("org_id", 1), ("filename", 1)])
    await db["documents"].create_index([("org_id", 1)])

async def close_mongo_connection():
    if db_manager.client:
        db_manager.client.close()
