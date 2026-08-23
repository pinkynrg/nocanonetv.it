from pathlib import Path

from pydantic_settings import BaseSettings

# .env at the repo root (server/config.py -> parent.parent). Absolute path so
# settings load regardless of the cwd (uvicorn with --directory server, sender
# scripts launched from the root, etc.).
ENV_FILE = str(Path(__file__).resolve().parent.parent / ".env")

class Settings(BaseSettings):
    postgres_user: str = "root"
    postgres_password: str = "root"
    postgres_host: str = "127.0.0.1"
    postgres_db: str = "db"

    # Frontend base URL, used to build the links in the emails
    # (confirm / exit / unsubscribe). In production: https://nocanonetv.it
    app_base_url: str = "http://localhost:5173"

    # Email sending. "console" prints to stdout (dev, no provider);
    # "resend" actually sends via the Resend API.
    email_backend: str = "console"
    resend_api_key: str = ""
    # Sender. With the Resend sandbox use onboarding@resend.dev (only delivers to
    # the account owner). After verifying the nocanonetv.it domain ->
    # "nocanonetv.it <noreply@nocanonetv.it>".
    email_from: str = "nocanonetv.it <onboarding@resend.dev>"

    @property
    def database_url(self) -> str:
        return f"postgresql://{self.postgres_user}:{self.postgres_password}@{self.postgres_host}/{self.postgres_db}"

    class Config:
        env_file = ENV_FILE
        extra = "ignore"

settings = Settings()