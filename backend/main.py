"""
main.py — FastAPI entry point for the Codequity Launchpad backend.

Run with:
    uvicorn main:app --reload --port 8000

For production (Railway/Render):
    uvicorn main:app --host 0.0.0.0 --port $PORT
"""

import logging
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown hooks."""
    logger.info("Codequity Launchpad backend starting up...")
    # Validate critical env vars on startup
    missing = [k for k in ("SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "ADMIN_API_KEY") if not os.getenv(k)]
    if missing:
        logger.warning("Missing environment variables: %s", missing)
    yield
    logger.info("Codequity Launchpad backend shutting down.")


app = FastAPI(
    title="Codequity Launchpad API",
    description="AI-governed milestone funding on Casper Network",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — allow the Next.js frontend and any Vercel preview URLs
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://codequity.live",
    "https://launchpad.codequity.live",
    "https://api.codequity.live",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Global error handler
# ---------------------------------------------------------------------------

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled error on %s %s: %s", request.method, request.url.path, exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Check server logs."},
    )


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

from routers.launchpad import router as launchpad_router  # noqa: E402

app.include_router(launchpad_router)


@app.get("/health")
async def health():
    """Simple health check — used by Railway/Render keep-alive."""
    from casper_client import casper_client
    return {
        "status": "ok",
        "casper_mode": "mock" if casper_client.mock else "live",
        "version": "0.1.0",
    }
