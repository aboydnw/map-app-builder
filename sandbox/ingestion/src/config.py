"""Application configuration via environment variables."""

from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # S3 / MinIO
    s3_bucket: str = "sandbox-data"
    s3_endpoint: str = "http://localhost:9000"
    aws_access_key_id: str = "minioadmin"
    aws_secret_access_key: str = "minioadmin"
    s3_region: str = "us-east-1"

    # eoAPI URLs
    stac_api_url: str = "http://localhost:8081"
    raster_tiler_url: str = "http://localhost:8082"
    vector_tiler_url: str = "http://localhost:8083"

    # PostgreSQL (for vector ingest via geopandas)
    postgres_dsn: str = "postgresql://sandbox:sandbox_dev_password@localhost:5439/postgis"

    # Upload limits
    max_upload_bytes: int = 1_073_741_824  # 1 GB
    rate_limit: str = "5/hour"

    # CORS
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000", "http://localhost:5185"]

    model_config = {"env_prefix": "", "case_sensitive": False}


@lru_cache
def get_settings() -> Settings:
    return Settings()
