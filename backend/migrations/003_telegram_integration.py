"""
Migration script for Telegram integration.

Adds to the `users` table:
- telegram_chat_id
- telegram_link_token
- telegram_link_token_expires_at

Run: python -m backend.migrations.003_telegram_integration
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from sqlalchemy import text
from backend.config.database import engine


def upgrade():
    print("Adding Telegram fields to users table...")
    conn = engine.connect()
    try:
        conn.execute(text("ALTER TABLE users ADD COLUMN telegram_chat_id VARCHAR(50) NULL"))
    except Exception:
        print("  telegram_chat_id already exists, skipping")
    try:
        conn.execute(text("ALTER TABLE users ADD COLUMN telegram_link_token VARCHAR(100) NULL"))
    except Exception:
        print("  telegram_link_token already exists, skipping")
    try:
        conn.execute(text("ALTER TABLE users ADD COLUMN telegram_link_token_expires_at DATETIME NULL"))
    except Exception:
        print("  telegram_link_token_expires_at already exists, skipping")
    try:
        conn.execute(text("CREATE INDEX ix_users_telegram_link_token ON users (telegram_link_token)"))
    except Exception:
        print("  index already exists, skipping")
    conn.commit()
    conn.close()
    print("Migration complete.")


def downgrade():
    print("Removing Telegram fields from users table...")
    conn = engine.connect()
    try:
        conn.execute(text("ALTER TABLE users DROP INDEX ix_users_telegram_link_token"))
    except Exception:
        pass
    try:
        conn.execute(text("ALTER TABLE users DROP COLUMN telegram_link_token_expires_at"))
    except Exception:
        pass
    try:
        conn.execute(text("ALTER TABLE users DROP COLUMN telegram_link_token"))
    except Exception:
        pass
    try:
        conn.execute(text("ALTER TABLE users DROP COLUMN telegram_chat_id"))
    except Exception:
        pass
    conn.commit()
    conn.close()
    print("Downgrade complete.")


if __name__ == "__main__":
    if "--rollback" in sys.argv:
        downgrade()
    else:
        upgrade()
