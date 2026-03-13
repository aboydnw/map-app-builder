"""Convert a GeoTIFF to a Cloud-Optimized GeoTIFF (COG)."""

import argparse
import os
import sys

_REQUIRED = {"rasterio": "rasterio", "numpy": "numpy"}
_missing = []
for _mod, _pkg in _REQUIRED.items():
    try:
        __import__(_mod)
    except ImportError:
        _missing.append(_pkg)
if _missing:
    print(f"Missing dependencies: {', '.join(_missing)}")
    print(f"Install with: pip install {' '.join(_missing)} rio-cogeo")
    sys.exit(1)

import numpy as np
import rasterio


def convert(input_path: str, output_path: str, compression: str = "DEFLATE", verbose: bool = False):
    """Convert a GeoTIFF to a Cloud-Optimized GeoTIFF."""
    with rasterio.open(input_path) as src:
        profile = src.profile.copy()

        if verbose:
            print(f"Input: {src.width}x{src.height}, {src.count} band(s), dtype={src.dtypes[0]}")
            print(f"CRS: {src.crs}")
            print(f"Bounds: {src.bounds}")

        profile.update(
            driver="GTiff",
            tiled=True,
            blockxsize=512,
            blockysize=512,
            compress=compression,
            copy_src_overviews=False,
        )

        if verbose:
            print(f"Writing COG with {compression} compression...")

        with rasterio.open(output_path, "w", **profile) as dst:
            for band_idx in range(1, src.count + 1):
                data = src.read(band_idx)
                dst.write(data, band_idx)

            if verbose:
                print("Building overviews...")

            overview_levels = [2, 4, 8, 16]
            dst.build_overviews(overview_levels, rasterio.enums.Resampling.nearest)
            dst.update_tags(ns="rio_overview", resampling="nearest")

    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"Output: {output_path} ({size_mb:.1f} MB)")


def main():
    parser = argparse.ArgumentParser(description="Convert a GeoTIFF to a Cloud-Optimized GeoTIFF")
    parser.add_argument("--input", required=True, help="Path to input GeoTIFF")
    parser.add_argument("--output", required=True, help="Path for output COG")
    parser.add_argument("--compression", default="DEFLATE", choices=["DEFLATE", "ZSTD", "LZW"],
                        help="Compression method (default: DEFLATE)")
    parser.add_argument("--overwrite", action="store_true", help="Overwrite output if it exists")
    parser.add_argument("--verbose", action="store_true", help="Print detailed progress")
    args = parser.parse_args()

    if not os.path.isfile(args.input):
        print(f"Error: input file not found: {args.input}")
        sys.exit(1)

    ext = os.path.splitext(args.input)[1].lower()
    if ext not in (".tif", ".tiff"):
        print(f"Error: expected a .tif or .tiff file, got '{ext}'")
        sys.exit(1)

    if os.path.exists(args.output) and not args.overwrite:
        print(f"Error: output file already exists: {args.output}")
        print("Use --overwrite to replace it.")
        sys.exit(1)

    convert(args.input, args.output, compression=args.compression, verbose=args.verbose)


if __name__ == "__main__":
    main()
