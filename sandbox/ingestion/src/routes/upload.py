"""Upload route — accepts files and starts the conversion pipeline."""

import os
import tempfile

from fastapi import APIRouter, BackgroundTasks, HTTPException, Request, UploadFile

from src.state import jobs, datasets, limiter
from src.config import get_settings
from src.models import Job
from src.services.pipeline import run_pipeline

router = APIRouter(prefix="/api")


@router.post("/upload")
@limiter.limit("5/hour")
async def upload_file(
    request: Request,
    file: UploadFile,
    background_tasks: BackgroundTasks,
):
    """Accept a file upload and start the conversion pipeline."""
    settings = get_settings()

    # Validate file size (read in chunks to avoid loading entire file in memory)
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename or "")[1])
    size = 0
    try:
        while chunk := await file.read(1024 * 1024):  # 1MB chunks
            size += len(chunk)
            if size > settings.max_upload_bytes:
                os.unlink(tmp.name)
                raise HTTPException(
                    status_code=413,
                    detail=f"File too large. Maximum size is {settings.max_upload_bytes // (1024*1024)} MB.",
                )
            tmp.write(chunk)
        tmp.close()
    except HTTPException:
        raise
    except Exception:
        os.unlink(tmp.name)
        raise

    if not file.filename:
        os.unlink(tmp.name)
        raise HTTPException(status_code=400, detail="Filename is required.")

    job = Job(filename=file.filename)
    jobs[job.id] = job

    background_tasks.add_task(_run_and_cleanup, job, tmp.name)
    return {"job_id": job.id, "dataset_id": job.dataset_id}


async def _run_and_cleanup(job: Job, input_path: str):
    """Run the pipeline, then clean up the temp file."""
    try:
        await run_pipeline(job, input_path, datasets)
    finally:
        if os.path.exists(input_path):
            os.unlink(input_path)
