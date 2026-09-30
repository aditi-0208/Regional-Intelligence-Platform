"""Run the comparison endpoint locally (port 8000) for testing.

It mounts the new router in a tiny FastAPI app and reuses the backend's
db.py for the connection. Nothing here is deployed or pushed anywhere.
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, ".."))  # SOTR/ (analytics, explore_api)
sys.path.insert(0, os.path.expanduser("~/Aditi/Projects/SOTR-github/backend"))  # db.py

import uvicorn                                          # noqa: E402
from fastapi import FastAPI                             # noqa: E402
from fastapi.middleware.cors import CORSMiddleware      # noqa: E402
from explore_api.comparison import router as comparison_router  # noqa: E402
from explore_api.lookups import router as lookups_router        # noqa: E402
from explore_api.rankings import router as rankings_router      # noqa: E402

app = FastAPI(title="Explore comparison (local dev)")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(lookups_router)
app.include_router(rankings_router)
app.include_router(comparison_router)

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
