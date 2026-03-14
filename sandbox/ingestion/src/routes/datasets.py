"""Dataset metadata route."""

from fastapi import APIRouter, HTTPException

from src.state import datasets

router = APIRouter(prefix="/api")


@router.get("/datasets/{dataset_id}")
async def get_dataset(dataset_id: str):
    """Get metadata for a converted dataset."""
    dataset = datasets.get(dataset_id)
    if dataset is None:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return dataset.model_dump()
