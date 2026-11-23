import os
import sys
from pathlib import Path

import pytest

# Make `app` importable and pin settings before any app module is imported.
API_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(API_ROOT))

# Test-only settings: isolated SQLite file, fixed secret, deterministic AI path.
os.environ.setdefault("LIFEOS_DATABASE_URL", "sqlite:///./test_app.db")
os.environ.setdefault("LIFEOS_SECRET_KEY", "test-secret-that-is-long-enough-for-hs256")
os.environ.setdefault("LIFEOS_UPLOAD_DIR", str(API_ROOT / ".test_uploads"))
os.environ.setdefault("LIFEOS_AI_PROVIDER", "rules")

from fastapi.testclient import TestClient  # noqa: E402

from app.core.config import get_settings  # noqa: E402
from app.core.database import Base, SessionLocal, engine  # noqa: E402
from app.main import app  # noqa: E402

# Clear cached settings so the test overrides take effect.
get_settings.cache_clear()


@pytest.fixture(autouse=True)
def _clean_database():
    """Drop and recreate the schema before each test for isolation."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db_session():
    """Provide a database session for direct assertions."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def client():
    """A TestClient bound to the FastAPI app."""
    with TestClient(app) as test_client:
        yield test_client


def _register(client: TestClient, name: str, password: str = "password123") -> dict:
    response = client.post(
        "/api/auth/register",
        json={"name": name, "password": password},
    )
    assert response.status_code == 201, response.text
    return response.json()


def _login(client: TestClient, name: str, password: str = "password123") -> str:
    response = client.post("/api/auth/login", json={"name": name, "password": password})
    assert response.status_code == 200, response.text
    return response.json()["access_token"]


def _auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def user_token(client):
    """Register a fresh user and return its access token."""
    _register(client, "alice")
    return _login(client, "alice")


@pytest.fixture()
def auth_headers(user_token):
    """Bearer headers for the alice user."""
    return _auth_headers(user_token)


@pytest.fixture()
def second_user(client):
    """Register and return a second user's token for isolation tests."""
    _register(client, "bob")
    return _login(client, "bob")


@pytest.fixture()
def second_headers(second_user):
    return _auth_headers(second_user)