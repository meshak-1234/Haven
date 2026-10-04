"""
Haven -- Database Connection Diagnostic Script
=============================================
Run this to verify that your SQL database connection is configured correctly
BEFORE starting the full backend server.

Usage:
    python backend/tests/test_db_connection.py
"""

import sys
import os

# Ensure project root is on the path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from sqlalchemy import text
from backend.app.core.config import settings
from backend.app.db.database import engine, Base
import backend.app.db.models  # ensure models are registered with Base metadata


def test_db_connection():
    db_url = settings.get_database_url()
    # Mask credentials in output to avoid printing passwords
    safe_url = db_url
    if "@" in db_url:
        parts = db_url.split("@")
        prefix = parts[0].rsplit(":", 1)[0]
        safe_url = f"{prefix}:****@{'@'.join(parts[1:])}"

    print("=" * 60)
    print("Haven -- Database Connection Diagnostic")
    print("=" * 60)
    print(f"DB Type     : {settings.DB_TYPE if not settings.DATABASE_URL else '(via DATABASE_URL)'}")
    print(f"URL (masked): {safe_url}")
    print()

    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("[OK]  Connection successful!")
    except Exception as e:
        print(f"[FAIL] Connection FAILED: {e}")
        print()
        print("Troubleshooting tips:")
        print("  1. Verify DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD in your .env file.")
        print("  2. Make sure the database server is running on your laptop.")
        print("  3. Make sure the database/schema exists (e.g. CREATE DATABASE haven;).")
        print("  4. For MySQL, install pymysql: pip install pymysql cryptography")
        sys.exit(1)

    print()
    print("Creating / verifying Haven database tables (safe -- does NOT drop existing data)...")
    try:
        Base.metadata.create_all(bind=engine)
        print("[OK]  All tables verified / created successfully.")
    except Exception as e:
        print(f"[FAIL] Table creation failed: {e}")
        sys.exit(1)

    print()
    print("=" * 60)
    print("Database is ready for Haven. You can start the backend now.")
    print("=" * 60)


if __name__ == "__main__":
    test_db_connection()
