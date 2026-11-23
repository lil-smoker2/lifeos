from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.automation import router as automation_router
from app.api.budget import router as budget_router
from app.api.courses import router as courses_router
from app.api.documents import router as documents_router
from app.api.events import router as events_router
from app.api.goals import router as goals_router
from app.api.health import router as health_router
from app.api.healthlog import router as healthlog_router
from app.api.notes import router as notes_router
from app.api.search import router as search_router
from app.api.alerts import router as alerts_router
from app.api.assistant import router as assistant_router
from app.api.summary import router as summary_router
from app.api.tasks import router as tasks_router
from app.api.transactions import router as transactions_router
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="Backend for the LifeOS personal dashboard.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix=settings.api_prefix)
app.include_router(auth_router, prefix=settings.api_prefix)
app.include_router(tasks_router, prefix=settings.api_prefix)
app.include_router(events_router, prefix=settings.api_prefix)
app.include_router(transactions_router, prefix=settings.api_prefix)
app.include_router(courses_router, prefix=settings.api_prefix)
app.include_router(goals_router, prefix=settings.api_prefix)
app.include_router(healthlog_router, prefix=settings.api_prefix)
app.include_router(notes_router, prefix=settings.api_prefix)
app.include_router(documents_router, prefix=settings.api_prefix)
app.include_router(summary_router, prefix=settings.api_prefix)
app.include_router(search_router, prefix=settings.api_prefix)
app.include_router(alerts_router, prefix=settings.api_prefix)
app.include_router(assistant_router, prefix=settings.api_prefix)
app.include_router(automation_router, prefix=settings.api_prefix)
app.include_router(budget_router, prefix=settings.api_prefix)


@app.get("/")
def root() -> dict[str, str]:
    return {
        "name": settings.app_name,
        "docs": "/docs",
        "health": f"{settings.api_prefix}/health",
    }
