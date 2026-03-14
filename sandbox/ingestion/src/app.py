"""FastAPI application for the CNG Sandbox ingestion service."""

from contextlib import asynccontextmanager

import boto3
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from src.config import get_settings
from src.state import limiter


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    s3 = boto3.client(
        "s3",
        endpoint_url=settings.s3_endpoint,
        aws_access_key_id=settings.aws_access_key_id,
        aws_secret_access_key=settings.aws_secret_access_key,
        region_name=settings.s3_region,
    )
    s3.head_bucket(Bucket=settings.s3_bucket)
    app.state.s3 = s3
    yield


def create_app(settings=None) -> FastAPI:
    """Application factory — testable configuration."""
    if settings is None:
        settings = get_settings()

    app = FastAPI(title="CNG Sandbox Ingestion API", lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.state.limiter = limiter
    app.add_middleware(SlowAPIMiddleware)

    @app.exception_handler(RateLimitExceeded)
    async def rate_limit_handler(request, exc):
        return JSONResponse(
            status_code=429,
            content={"detail": "Rate limit exceeded. Max 5 uploads per hour."},
        )

    @app.get("/api/health")
    async def health():
        return {"status": "ok"}

    from src.routes.upload import router as upload_router
    from src.routes.jobs import router as jobs_router
    from src.routes.datasets import router as datasets_router
    app.include_router(upload_router)
    app.include_router(jobs_router)
    app.include_router(datasets_router)

    return app


app = create_app()
