from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
import os
import uuid
import mimetypes
from datetime import datetime, timezone
from config.database import get_db
from models.media import MediaLibrary, MediaType
from models.user import User
from schemas.media import MediaLibraryCreate, MediaLibraryUpdate, MediaLibraryResponse
from dependencies.auth import require_role
from typing import List, Optional

router = APIRouter(prefix="/media", tags=["media"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(os.path.join(UPLOAD_DIR, "images"), exist_ok=True)
os.makedirs(os.path.join(UPLOAD_DIR, "videos"), exist_ok=True)


@router.get("", response_model=List[MediaLibraryResponse])
def list_media(
    folder: Optional[str] = None,
    media_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    query = db.query(MediaLibrary)
    if folder:
        query = query.filter(MediaLibrary.folder == folder)
    if media_type:
        query = query.filter(MediaLibrary.media_type == media_type)
    return query.order_by(MediaLibrary.created_at.desc()).all()


@router.get("/{media_id}", response_model=MediaLibraryResponse)
def get_media(
    media_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    media = db.query(MediaLibrary).filter(MediaLibrary.id == media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    return media


@router.post("/upload", response_model=MediaLibraryResponse)
async def upload_media(
    file: UploadFile = File(...),
    folder: str = Form("/"),
    alt_text: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    ext = os.path.splitext(file.filename)[1].lower()
    unique_name = f"{uuid.uuid4().hex}{ext}"

    mime_type = file.content_type or mimetypes.guess_type(file.filename)[0] or "application/octet-stream"

    if mime_type.startswith("image/"):
        subdir = "images"
        media_type = MediaType.IMAGE
    elif mime_type.startswith("video/"):
        subdir = "videos"
        media_type = MediaType.VIDEO
    else:
        subdir = "other"
        media_type = MediaType.OTHER

    save_dir = os.path.join(UPLOAD_DIR, subdir)
    os.makedirs(save_dir, exist_ok=True)
    file_path = os.path.join(save_dir, unique_name)

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    url = f"/uploads/{subdir}/{unique_name}"
    file_size = len(content)
    width = None
    height = None

    if media_type == MediaType.IMAGE:
        try:
            from PIL import Image
            img = Image.open(file_path)
            width, height = img.size
        except ImportError:
            pass

    media_entry = MediaLibrary(
        filename=unique_name,
        original_name=file.filename,
        url=url,
        media_type=media_type,
        mime_type=mime_type,
        file_size=file_size,
        width=width,
        height=height,
        alt_text=alt_text or file.filename,
        folder=folder,
    )
    db.add(media_entry)
    db.commit()
    db.refresh(media_entry)
    return media_entry


@router.post("/url", response_model=MediaLibraryResponse)
def save_media_url(
    data: MediaLibraryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    filename = os.path.basename(data.url)
    media_entry = MediaLibrary(
        filename=filename,
        original_name=filename,
        url=data.url,
        media_type=data.media_type,
        mime_type=data.mime_type,
        file_size=data.file_size,
        width=data.width,
        height=data.height,
        alt_text=data.alt_text or filename,
        folder=data.folder,
    )
    db.add(media_entry)
    db.commit()
    db.refresh(media_entry)
    return media_entry


@router.put("/{media_id}", response_model=MediaLibraryResponse)
def update_media(
    media_id: int,
    data: MediaLibraryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    media = db.query(MediaLibrary).filter(MediaLibrary.id == media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(media, key, value)

    db.commit()
    db.refresh(media)
    return media


@router.delete("/{media_id}")
def delete_media(
    media_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    media = db.query(MediaLibrary).filter(MediaLibrary.id == media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")

    file_path = os.path.join(UPLOAD_DIR, media.media_type.value + "s", media.filename)
    if os.path.exists(file_path):
        os.remove(file_path)

    db.delete(media)
    db.commit()
    return {"message": "Media deleted successfully"}
