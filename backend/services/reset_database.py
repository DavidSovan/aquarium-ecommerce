"""Database reset service - safely deletes all data and seeds minimal system data."""
import os
import subprocess
from datetime import datetime, timezone
from sqlalchemy import text
from config.database import Base, SessionLocal, DATABASE_URL
from dependencies.auth import hash_password
from models.audit_log import AuditLog
from models.user import User
from models.theme import ThemeSettings
from models.branding import BrandingSettings
from models.setting import Setting


def backup_database() -> str | None:
    try:
        backup_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "backups")
        os.makedirs(backup_dir, exist_ok=True)
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        backup_path = os.path.join(backup_dir, f"backup_{timestamp}.sql")
        import re
        match = re.match(r"mysql\+pymysql://(.*?):(.*?)@(.*?)/(.*)", DATABASE_URL)
        if not match:
            return None
        user, password, host_db, db_name = match.groups()
        host = host_db.split(":")[0] if ":" in host_db else host_db
        port = host_db.split(":")[1] if ":" in host_db else "3306"
        cmd = ["mysqldump", f"--user={user}", f"--host={host}", f"--port={port}", db_name]
        if password:
            cmd.insert(1, f"--password={password}")
        with open(backup_path, "w") as f:
            process = subprocess.run(cmd, stdout=f, stderr=subprocess.PIPE, timeout=120)
            if process.returncode != 0:
                return None
        return backup_path
    except Exception:
        return None


def seed_minimal_system_data(db):
    """Seed only the essential data needed for the system to function."""
    admin = User(
        email="admin@fashionstore.com",
        password_hash=hash_password("admin123"),
        first_name="Admin",
        last_name="User",
        role="admin",
        is_active=True,
    )
    db.add(admin)

    staff = User(
        email="staff@fashionstore.com",
        password_hash=hash_password("staff123"),
        first_name="Staff",
        last_name="User",
        role="staff",
        is_active=True,
    )
    db.add(staff)

    db.flush()

    theme = ThemeSettings(name="Default Theme", is_active=True)
    db.add(theme)

    branding = BrandingSettings(store_name="Fashion Store")
    db.add(branding)

    essential_settings = [
        Setting(key="store_name", value="Fashion Store", description="Store display name"),
        Setting(key="store_email", value="support@fashionstore.com", description="Store contact email"),
        Setting(key="shipping_rate", value="5.00", description="Default shipping rate"),
        Setting(key="tax_rate", value="0.08", description="Tax rate (decimal)"),
        Setting(key="low_stock_threshold", value="5", description="Low stock alert threshold"),
    ]
    for s in essential_settings:
        db.add(s)


def reset_database(admin_id: str, backup: bool = False) -> dict:
    backup_path = None
    if backup:
        backup_path = backup_database()

    db = SessionLocal()
    try:
        db.execute(text("SET FOREIGN_KEY_CHECKS = 0"))
        db.execute(text("SET SQL_SAFE_UPDATES = 0"))

        tables = Base.metadata.sorted_tables
        for table in reversed(tables):
            try:
                db.execute(text(f"DELETE FROM `{table.name}`"))
            except Exception as e:
                db.rollback()
                raise RuntimeError(f"Failed to clear table '{table.name}': {e}")

        db.execute(text("SET FOREIGN_KEY_CHECKS = 1"))

        seed_minimal_system_data(db)

        new_admin = db.query(User).filter(User.email == "admin@fashionstore.com").first()

        log = AuditLog(
            admin_id=new_admin.id if new_admin else None,
            action="reset_database",
            details=f"Database reset performed by admin (id={admin_id}). Backup: {backup_path or 'none'}",
        )
        db.add(log)

        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

    return {
        "success": True,
        "message": "Database has been reset. All data cleared. Only admin user and essential system settings remain.",
        "backup_path": backup_path,
    }
