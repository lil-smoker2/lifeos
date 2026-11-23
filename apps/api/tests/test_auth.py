"""Authentication, password reset, and token flow tests."""

from app.core.security import hash_password, hash_recovery_code, verify_password


def test_register_returns_token_and_user(client):
    response = client.post(
        "/api/auth/register",
        json={"name": "New User", "password": "password123"},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["access_token"]
    assert body["user"]["name"] == "New User"
    assert body["recovery_codes"]
    assert len(body["recovery_codes"]) == 8


def test_register_duplicate_name_conflicts(client):
    client.post(
        "/api/auth/register",
        json={"name": "Dup", "password": "password123"},
    )
    second = client.post(
        "/api/auth/register",
        json={"name": "Dup", "password": "password123"},
    )
    assert second.status_code == 409


def test_login_wrong_password_401(client):
    client.post(
        "/api/auth/register",
        json={"name": "Login", "password": "password123"},
    )
    response = client.post(
        "/api/auth/login",
        json={"name": "Login", "password": "wrong"},
    )
    assert response.status_code == 401


def test_login_success_returns_token(client):
    client.post(
        "/api/auth/register",
        json={"name": "Ok", "password": "password123"},
    )
    response = client.post(
        "/api/auth/login",
        json={"name": "Ok", "password": "password123"},
    )
    assert response.status_code == 200
    assert response.json()["access_token"]


def test_me_requires_auth(client):
    assert client.get("/api/auth/me").status_code == 401


def test_me_with_token(client):
    client.post(
        "/api/auth/register",
        json={"name": "Me", "password": "password123"},
    )
    token = client.post(
        "/api/auth/login",
        json={"name": "Me", "password": "password123"},
    ).json()["access_token"]
    response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["name"] == "Me"


def test_reset_password_with_recovery_code(client):
    register = client.post(
        "/api/auth/register",
        json={"name": "Reset", "password": "oldpassword"},
    ).json()
    code = register["recovery_codes"][0]

    reset = client.post(
        "/api/auth/reset-password",
        json={"name": "Reset", "recovery_code": code, "new_password": "newpassword"},
    )
    assert reset.status_code == 204

    # Old password fails, new one works.
    assert client.post(
        "/api/auth/login",
        json={"name": "Reset", "password": "oldpassword"},
    ).status_code == 401
    assert client.post(
        "/api/auth/login",
        json={"name": "Reset", "password": "newpassword"},
    ).status_code == 200


def test_reset_password_invalid_code_400(client):
    client.post(
        "/api/auth/register",
        json={"name": "Bad", "password": "password123"},
    )
    # Well-formed 32-hex code that was never issued -> endpoint rejects it.
    response = client.post(
        "/api/auth/reset-password",
        json={"name": "Bad", "recovery_code": "0" * 32, "new_password": "newpassword"},
    )
    assert response.status_code == 400


def test_reset_password_malformed_code_422(client):
    client.post(
        "/api/auth/register",
        json={"name": "Mal", "password": "password123"},
    )
    response = client.post(
        "/api/auth/reset-password",
        json={"name": "Mal", "recovery_code": "NOTREAL", "new_password": "newpassword"},
    )
    assert response.status_code == 422


def test_passwords_are_hashed(client, db_session):
    from app.models import User

    client.post(
        "/api/auth/register",
        json={"name": "Hash", "password": "password123"},
    )
    row = db_session.query(User).filter_by(name="Hash").one()
    assert row.hashed_password.startswith("$2b$")
    assert row.hashed_password != "password123"
    assert verify_password("password123", row.hashed_password)