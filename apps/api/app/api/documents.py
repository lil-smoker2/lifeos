import asyncio
import mimetypes
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, Response, UploadFile, status
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import Document, User
from app.services.seed import ensure_user_seed

router = APIRouter(prefix="/documents", tags=["documents"])
settings = get_settings()


class DocOut(BaseModel):
    id: str
    name: str
    kind: str
    size_bytes: int
    tag: str
    uploaded_at: str


def doc_out(row: Document) -> DocOut:
    return DocOut(
        id=row.id,
        name=row.name,
        kind=row.kind,
        size_bytes=row.size_bytes,
        tag=row.tag,
        uploaded_at=row.uploaded_at.isoformat() if row.uploaded_at else "",
    )


def doc_or_404(db: Session, user: User, doc_id: str) -> Document:
    row = db.scalar(select(Document).where(Document.id == doc_id, Document.user_id == user.id))
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return row


def doc_path(row: Document) -> Path:
    return Path(settings.upload_dir) / row.stored_name


@router.get("", response_model=list[DocOut])
def list_documents(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[DocOut]:
    ensure_user_seed(db, user)
    rows = db.scalars(
        select(Document).where(Document.user_id == user.id).order_by(Document.uploaded_at.desc())
    ).all()
    return [doc_out(row) for row in rows]


@router.post("", response_model=DocOut, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    tag: str = Form(default="Uploaded"),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DocOut:
    payload = await file.read()
    max_bytes = settings.max_upload_mb * 1024 * 1024
    if len(payload) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Files must be {settings.max_upload_mb} MB or smaller",
        )
    if not payload:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty file")

    suffix = Path(file.filename or "").suffix.lower()
    stored_name = f"{uuid4().hex}{suffix}"
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    await asyncio.to_thread((upload_dir / stored_name).write_bytes, payload)

    row = Document(
        user_id=user.id,
        name=(file.filename or "upload").strip()[:255],
        kind=(suffix.lstrip(".") or "file").upper(),
        size_bytes=len(payload),
        tag=tag.strip()[:64] or "Uploaded",
        stored_name=stored_name,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return doc_out(row)


@router.get("/{doc_id}/download")
def download_document(
    doc_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = doc_or_404(db, user, doc_id)
    path = doc_path(row)
    if not path.is_file():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stored file is missing")
    media_type = mimetypes.guess_type(row.name)[0] or "application/octet-stream"
    return FileResponse(path, media_type=media_type, filename=row.name, content_disposition_type="attachment")


PREVIEW_ALLOWLIST = {
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
    "image/webp",
    "application/pdf",
    "text/plain",
}


def preview_media_type(row: Document) -> str | None:
    media_type = mimetypes.guess_type(row.name)[0]
    return media_type if media_type in PREVIEW_ALLOWLIST else None


@router.get("/{doc_id}/preview")
def preview_document(
    doc_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = doc_or_404(db, user, doc_id)
    path = doc_path(row)
    if not path.is_file():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stored file is missing")
    media_type = preview_media_type(row)
    if media_type is None:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Preview is not available for this file type. Download the file instead.",
        )
    return FileResponse(
        path,
        media_type=media_type,
        headers={"X-Content-Type-Options": "nosniff"},
    )


@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    doc_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Response:
    row = doc_or_404(db, user, doc_id)
    path = doc_path(row)
    if path.is_file():
        path.unlink()
    db.delete(row)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
