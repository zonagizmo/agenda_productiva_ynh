import sqlite3
import os

DATA_DIR = os.environ.get("AGENDA_DATA_DIR", os.path.dirname(os.path.abspath(__file__)))


def _db_path(username: str) -> str:
    user_dir = os.path.join(DATA_DIR, username)
    os.makedirs(user_dir, exist_ok=True)
    return os.path.join(user_dir, "agenda.db")


def get_db(username: str):
    return sqlite3.connect(_db_path(username))


def init_db(username: str):
    with get_db(username) as db:
        db.execute("""
            CREATE TABLE IF NOT EXISTS storage (
                key   TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )
        """)


def get_value(username: str, key: str):
    with get_db(username) as db:
        row = db.execute("SELECT value FROM storage WHERE key=?", (key,)).fetchone()
    return row[0] if row else None


def set_value(username: str, key: str, value: str):
    with get_db(username) as db:
        db.execute(
            "INSERT OR REPLACE INTO storage (key, value) VALUES (?, ?)",
            (key, value)
        )


def delete_value(username: str, key: str):
    with get_db(username) as db:
        db.execute("DELETE FROM storage WHERE key=?", (key,))
