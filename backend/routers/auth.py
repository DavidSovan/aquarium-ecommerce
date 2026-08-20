from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from config.database import get_db
from models.user import User
from schemas.auth import (
    RegisterRequest,
    LoginRequest,
    LoginResponse,
    UserResponse,
    AdminCreateUserRequest,
    UserListResponse,
    GoogleLoginRequest,
)
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import uuid
from dependencies.auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    require_role,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=201)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        first_name=data.first_name,
        last_name=data.last_name,
        role="customer",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=LoginResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is inactive",
        )

    token = create_access_token({"sub": user.id, "role": user.role})
    return LoginResponse(access_token=token)


@router.post("/google", response_model=LoginResponse)
def google_login(data: GoogleLoginRequest, db: Session = Depends(get_db)):
    client_id = "213431034913-valrbe4pn4jgcaol5h94q2ikg15j6oef.apps.googleusercontent.com"
    try:
        idinfo = id_token.verify_oauth2_token(
            data.credential, google_requests.Request(), client_id
        )
        email = idinfo.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="No email provided by Google")
        
        user = db.query(User).filter(User.email == email).first()
        if user:
            if data.is_register:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, 
                    detail="Email already registered. Please login instead."
                )
        else:
            # Create a new user with dummy password
            first_name = idinfo.get("given_name")
            last_name = idinfo.get("family_name")
            dummy_password = str(uuid.uuid4())
            user = User(
                email=email,
                password_hash=hash_password(dummy_password),
                first_name=first_name,
                last_name=last_name,
                role="customer",
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is inactive",
            )
            
        token = create_access_token({"sub": user.id, "role": user.role})
        return LoginResponse(access_token=token)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token",
        )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/admin/users", response_model=UserResponse, status_code=201)
def admin_create_user(
    data: AdminCreateUserRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    if data.role not in ("admin", "staff", "customer", "driver"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be admin, staff, customer, or driver",
        )

    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        first_name=data.first_name,
        last_name=data.last_name,
        role=data.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/users", response_model=UserListResponse)
def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    role: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    query = db.query(User)

    if role:
        query = query.filter(User.role == role)

    if search:
        term = f"%{search}%"
        query = query.filter(
            User.email.ilike(term) |
            User.first_name.ilike(term) |
            User.last_name.ilike(term)
        )

    total = query.count()
    users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()

    return UserListResponse(
        total=total,
        items=[UserResponse.model_validate(u) for u in users],
    )


@router.get("/drivers", response_model=List[UserResponse])
def list_drivers(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    drivers = db.query(User).filter(User.role == "driver", User.is_active == True).order_by(User.first_name).all()
    return drivers
