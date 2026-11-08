"""
========================================================================
🏛️ CULTIVATE // SANCTUARY — LIVE FASTAPI REST GATEWAY (api.py)
========================================================================
Production REST API running with FastAPI & Uvicorn.
Provides clean endpoints to:
  1. Inspect the Sanctuary world state & sector power levels.
  2. Log real-world habit check-ins with automatic Pydantic validation.
  3. Query NPC status and village progression.
  4. Generate interactive OpenAPI / Swagger UI documentation.
"""

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List

from lab05_api_gateway import (
    SanctuaryService,
    HabitLogRequest,
    HabitLogResponse
)

# Initialize master service (rehydrates from sanctuary_save.json if present)
service = SanctuaryService()

app = FastAPI(
    title="🌸 Cultivate // Sanctuary API",
    description="Cyber-cozy Life OS bridging real-world habits, 3-tier memory engine, and village state.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS so browser apps (like GitHub Pages or local web sims) can interact with the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["System"])
def root() -> Dict[str, Any]:
    """Healthcheck & API gateway landing."""
    return {
        "system": "Cultivate // Sanctuary REST Gateway",
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs",
        "active_session": service.engine.current_session,
        "signal_strength": service.engine.world.signal_strength
    }


@app.get("/api/v1/world", tags=["World State"])
def get_world() -> Dict[str, Any]:
    """Returns a full real-time snapshot of Sanctuary Village."""
    return service.get_world_summary()


@app.post(
    "/api/v1/habits/log",
    response_model=HabitLogResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Habit Engine"]
)
def log_habit(req: HabitLogRequest) -> HabitLogResponse:
    """
    Submits a validated habit completion:
    - Validates sector ID and parameters via Pydantic
    - Boosts sector power and evaluates building online status
    - Consolidates the observation into the 3-Tier Memory Vault
    - Persists the new state to sanctuary_save.json
    """
    try:
        response = service.record_habit(req)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record habit: {str(e)}"
        )


@app.get("/api/v1/npcs", tags=["NPC Registry"])
def get_npcs() -> List[Dict[str, Any]]:
    """Returns all registered NPCs in the village registry."""
    return [npc.model_dump() for npc in service.registry.npcs.values()]


if __name__ == "__main__":
    import uvicorn
    print("🚀 Booting Cultivate // Sanctuary FastAPI Server on http://127.0.0.1:8000 ...")
    print("📖 Swagger UI Docs available at http://127.0.0.1:8000/docs")
    uvicorn.run("api:app", host="127.0.0.1", port=8000, reload=True)
