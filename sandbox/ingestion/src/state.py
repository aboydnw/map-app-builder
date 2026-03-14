"""Shared mutable state — imported by both app.py and route modules.

Keeps state in a neutral module to avoid circular imports.
Jobs and datasets are ephemeral and lost on restart — adequate for v1 demo.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
jobs: dict = {}
datasets: dict = {}
