from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserRegistration(BaseModel):
    name: str
    email: str
    password: str

@app.get("/")
def root():
    return {"message": "Backend is running"}

@app.post("/register")
def register_user(user: UserRegistration):
    return {
        "message": "User registration received",
        "name": user.name,
        "email": user.email
    }