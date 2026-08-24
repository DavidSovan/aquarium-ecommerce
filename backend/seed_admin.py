import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config.database import SessionLocal
from models.user import User
from dependencies.auth import hash_password

def seed_admin():
    db = SessionLocal()
    try:
        email = "admin@aquarium.com"
        password = "admin123"
        admin = db.query(User).filter(User.email == email).first()
        if not admin:
            admin = User(
                email=email,
                password_hash=hash_password(password),
                first_name="Admin",
                last_name="User",
                role="admin",
                is_active=True,
            )
            db.add(admin)
            db.commit()
            print(f"Admin user created: {email} / {password}")
        else:
            print(f"Admin user already exists: {email}")
            
        # Also let's seed staff just in case they need it
        staff_email = "staff@aquarium.com"
        staff = db.query(User).filter(User.email == staff_email).first()
        if not staff:
            staff = User(
                email=staff_email,
                password_hash=hash_password("staff123"),
                first_name="Staff",
                last_name="User",
                role="staff",
                is_active=True,
            )
            db.add(staff)
            db.commit()
            print(f"Staff user created: {staff_email} / staff123")
    except Exception as e:
        db.rollback()
        print(f"Error seeding admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()
