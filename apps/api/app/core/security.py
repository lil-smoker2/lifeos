from datetime import UTC, datetime, timedelta
import hashlib
import secrets

import bcrypt
import jwt

from app.core.config import get_settings

settings = get_settings()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8")[:72], bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8")[:72], hashed_password.encode("utf-8"))
    except ValueError:
        return False


def create_recovery_codes(count: int = 8) -> list[str]:
    return [secrets.token_hex(16).upper() for _ in range(count)]


def hash_recovery_code(code: str) -> str:
    normalized = code.replace("-", "").replace(" ", "").upper()
    return hashlib.sha256(normalized.encode("ascii")).hexdigest()


def create_access_token(subject: str) -> str:
    now = datetime.now(UTC)
    payload = {
        "sub": subject,
        "iat": now,
        "exp": now + timedelta(minutes=settings.access_token_minutes),
    }
    return jwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm])
    except jwt.PyJWTError:
        return None
    subject = payload.get("sub")
    return subject if isinstance(subject, str) else None
