"""Ingest local COG files into a pgSTAC-backed STAC API.

Usage:
    pip install rasterio requests
    python infra/scripts/ingest.py infra/scripts/sample-collection.json infra/data/

This creates a STAC collection from the JSON file, then creates a STAC item
for each .tif file found in the data directory.
"""

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

import rasterio
import requests

STAC_API_URL = os.environ.get("STAC_API_URL", "http://localhost:8081")
FILESERVER_INTERNAL_URL = os.environ.get(
    "FILESERVER_INTERNAL_URL", "http://fileserver:80"
)


def create_collection(collection_path: str) -> dict:
    with open(collection_path) as f:
        collection = json.load(f)

    resp = requests.post(f"{STAC_API_URL}/collections", json=collection)
    if resp.status_code == 409:
        print(f"Collection '{collection['id']}' already exists, skipping.")
    elif resp.status_code >= 400:
        print(f"Error creating collection: {resp.status_code} {resp.text}")
        sys.exit(1)
    else:
        print(f"Created collection '{collection['id']}'")

    return collection


def create_item(collection_id: str, tif_path: Path) -> None:
    with rasterio.open(tif_path) as ds:
        bounds = ds.bounds
        bbox = [bounds.left, bounds.bottom, bounds.right, bounds.top]
        geometry = {
            "type": "Polygon",
            "coordinates": [
                [
                    [bounds.left, bounds.bottom],
                    [bounds.right, bounds.bottom],
                    [bounds.right, bounds.top],
                    [bounds.left, bounds.top],
                    [bounds.left, bounds.bottom],
                ]
            ],
        }

    item_id = tif_path.stem
    asset_href = f"{FILESERVER_INTERNAL_URL}/data/{tif_path.name}"

    item = {
        "type": "Feature",
        "stac_version": "1.0.0",
        "id": item_id,
        "geometry": geometry,
        "bbox": bbox,
        "properties": {
            "datetime": datetime.now(timezone.utc).isoformat(),
        },
        "links": [],
        "assets": {
            "data": {
                "href": asset_href,
                "type": "image/tiff; application=geotiff; profile=cloud-optimized",
                "title": item_id,
                "roles": ["data"],
            }
        },
        "collection": collection_id,
    }

    resp = requests.post(
        f"{STAC_API_URL}/collections/{collection_id}/items", json=item
    )
    if resp.status_code == 409:
        print(f"  Item '{item_id}' already exists, skipping.")
    elif resp.status_code >= 400:
        print(f"  Error creating item '{item_id}': {resp.status_code} {resp.text}")
    else:
        print(f"  Created item '{item_id}' (bbox: {bbox})")


def main() -> None:
    if len(sys.argv) != 3:
        print(f"Usage: {sys.argv[0]} <collection.json> <data-directory>")
        sys.exit(1)

    collection_path = sys.argv[1]
    data_dir = Path(sys.argv[2])

    if not os.path.exists(collection_path):
        print(f"Collection file not found: {collection_path}")
        sys.exit(1)

    if not data_dir.is_dir():
        print(f"Data directory not found: {data_dir}")
        sys.exit(1)

    collection = create_collection(collection_path)
    collection_id = collection["id"]

    tif_files = sorted(data_dir.glob("*.tif")) + sorted(data_dir.glob("*.tiff"))
    if not tif_files:
        print(f"No .tif/.tiff files found in {data_dir}")
        return

    print(f"Ingesting {len(tif_files)} file(s) into '{collection_id}'...")
    for tif_path in tif_files:
        create_item(collection_id, tif_path)

    print("Done.")


if __name__ == "__main__":
    main()
