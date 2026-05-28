import sys
import os
from sqlalchemy import create_all, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine

# Add backend directory to path
sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))

try:
    from config.database import engine, SessionLocal
    from models.user import User

    db = SessionLocal()
    users = db.query(User).all()
    if not users:
        print("No users found in database.")
    for user in users:
        print(f"ID: {user.id}, Email: {user.email}, Role: {user.role}, Active: {user.is_active}")
    db.close()
except Exception as e:
    print(f"Error: {e}")
