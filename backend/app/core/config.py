import json
from pathlib import Path
from typing import List, Optional, Union
from urllib.parse import quote

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Haven"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"

    # AI Provider
    AI_PROVIDER: str = "gemini"  # "gemini" | "mock"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"

    # ------------------------------------------------------------------
    # Database — two configuration modes:
    #   Option A (recommended for local SQL): set individual variables
    #     DB_TYPE, DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
    #   Option B (direct): set DATABASE_URL to a full connection string
    #     e.g. sqlite:///./haven.db  or  mysql+pymysql://user:pass@host/db
    #   If DATABASE_URL is explicitly set it takes precedence over Option A.
    # ------------------------------------------------------------------
    DATABASE_URL: str = ""

    # Discrete SQL connection parameters (Option A)
    DB_TYPE: str = "mysql"          # mysql | postgresql | sqlite | mssql
    DB_HOST: str = "localhost"
    DB_PORT: str = "3306"
    DB_NAME: str = "haven"
    DB_USER: str = "root"
    DB_PASSWORD: str = ""

    # JWT Authentication
    JWT_SECRET: str = "haven-super-secret-jwt-token-change-in-production-min32chars"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Server
    BACKEND_HOST: str = "127.0.0.1"
    BACKEND_PORT: int = 8000

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("["):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    def get_database_url(self) -> str:
        """
        Returns the active database URL.

        If DATABASE_URL is explicitly set in the environment, it is used
        as-is (Option B).  Otherwise, a URL is assembled from the discrete
        DB_* variables (Option A), with the password safely URL-encoded to
        support special characters.

        SQLite fallback is used only when neither mode is configured.
        """
        if self.DATABASE_URL:
            return self.DATABASE_URL

        db_type = self.DB_TYPE.lower()

        if db_type == "sqlite":
            db_name = self.DB_NAME if self.DB_NAME else "haven"
            return f"sqlite:///./{db_name}.db"

        if db_type == "mysql":
            driver = "mysql+pymysql"
        elif db_type == "postgresql":
            driver = "postgresql+psycopg2"
        elif db_type == "mssql":
            driver = "mssql+pyodbc"
        else:
            # Fallback: use DB_TYPE as-is for any other dialect
            driver = db_type

        user = self.DB_USER
        password = quote(self.DB_PASSWORD, safe="") if self.DB_PASSWORD else ""
        host = self.DB_HOST
        port = self.DB_PORT
        name = self.DB_NAME

        if user and password:
            return f"{driver}://{user}:{password}@{host}:{port}/{name}"
        elif user:
            return f"{driver}://{user}@{host}:{port}/{name}"
        else:
            return f"{driver}://{host}:{port}/{name}"

    _backend_dir = Path(__file__).resolve().parent.parent.parent
    _root_dir = _backend_dir.parent

    model_config = SettingsConfigDict(
        env_file=(
            str(_backend_dir / ".env"),
            str(_root_dir / ".env"),
            "backend/.env",
            ".env",
            "../.env",
        ),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
