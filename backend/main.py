import os
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, FastAPI, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pwdlib import PasswordHash


import models
from database import Base, engine, SessionLocal

security = HTTPBearer()

password_hash = PasswordHash.recommended()

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(user_id: int):
    expiration = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user_id),
        "exp": expiration
    }

    return jwt.encode(
        payload,
        JWT_SECRET,
        algorithm=JWT_ALGORITHM
    )

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProductCreate(BaseModel):
    sku: str
    name: str
    description: str | None = None
    quantity: int = 0
    location: str | None = None
    low_stock_threshold: int = 5

class UserLogin(BaseModel):
    email: str
    password: str

class UserRegistration(BaseModel):
    name: str
    email: str
    password: str

def get_current_user(
        credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM]
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token"
            )

    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired authentication token"
        )

    db = SessionLocal()

    try:
        user = db.scalar(
            select(models.User).where(
                models.User.id == int(user_id)
            )
        )

        if user is None:
            raise HTTPException(
                status_code=401,
                detail="User not found"
            )

        return user

    finally:
        db.close()


@app.post("/products")
def create_product(
        product: ProductCreate,
        current_user: models.User = Depends(get_current_user)
):
    db = SessionLocal()

    try:
        existing_product = db.scalar(
            select(models.Product).where(
                models.Product.sku == product.sku
            )
        )

        if existing_product:
            raise HTTPException(
                status_code=400,
                detail="A product with this SKU already exists"
            )

        new_product = models.Product(
            sku=product.sku,
            name=product.name,
            description=product.description,
            quantity=product.quantity,
            location=product.location,
            low_stock_threshold=product.low_stock_threshold
        )

        db.add(new_product)
        db.commit()
        db.refresh(new_product)

        return {
            "message": "Product created successfully",
            "id": new_product.id,
            "sku": new_product.sku,
            "name": new_product.name,
            "quantity": new_product.quantity
        }

    finally:
        db.close()

@app.get("/products")
def get_products(
        current_user: models.User = Depends(get_current_user)
):
    db = SessionLocal()

    try:
        products = db.scalars(
            select(models.Product)
        ).all()

        return products

    finally:
        db.close()

@app.get("/me")
def get_me(current_user: models.User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email
    }


@app.get("/")
def root():
    return {"message": "Backend is running"}

@app.post("/register")
def register_user(user: UserRegistration):
    db = SessionLocal()

    try:
        existing_user = db.scalar(
            select(models.User).where(models.User.email == user.email)
        )

        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Email is already registered"
            )

        hashed_password = password_hash.hash(user.password)

        new_user = models.User(
            name=user.name,
            email=user.email,
            password_hash=hashed_password
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return {
            "message": "User created successfully",
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email
        }

    finally:
        db.close()


@app.post("/login")
def login_user(user: UserLogin):
    db = SessionLocal()

    try:
        existing_user = db.scalar(
            select(models.User).where(models.User.email == user.email)
        )

        if not existing_user:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        if not password_hash.verify(
                user.password,
                existing_user.password_hash
        ):
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        access_token = create_access_token(existing_user.id)

        return {
            "message": "Login successful",
            "access_token": access_token,
            "token_type": "bearer",
            "id": existing_user.id,
            "name": existing_user.name,
            "email": existing_user.email
        }

    finally:
        db.close()