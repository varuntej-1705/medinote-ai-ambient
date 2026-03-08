import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from database.connection import init_db
from routes.consultations import router as consultations_router
from routes.notes import router as notes_router
from routes.analytics import router as analytics_router
from routes.risks import router as risks_router

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="MediNote AI API",
    description="Ambient Clinical Note Generator - Backend API",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(consultations_router)
app.include_router(notes_router)
app.include_router(analytics_router)
app.include_router(risks_router)


@app.on_event("startup")
def startup():
    logger.info("Initializing database...")
    init_db()
    logger.info("MediNote AI API started successfully.")


@app.get("/")
def root():
    return {
        "name": "MediNote AI API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "consultations": "/api/consultations",
            "notes": "/api/notes",
            "analytics": "/api/analytics",
            "risks": "/api/risks",
            "docs": "/docs"
        }
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
