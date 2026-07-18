from pathlib import Path

from pydantic_settings import BaseSettings

# .env nella root del repo (server/config.py -> parent.parent). Percorso assoluto
# così le settings si caricano a prescindere dalla cwd (uvicorn con --directory
# server, script di invio lanciati da root, ecc.).
ENV_FILE = str(Path(__file__).resolve().parent.parent / ".env")

class Settings(BaseSettings):
    postgres_user: str = "root"
    postgres_password: str = "root"
    postgres_host: str = "127.0.0.1"
    postgres_db: str = "db"

    # Base URL del frontend, usato per costruire i link nelle email
    # (conferma / uscita / annullamento). In produzione: https://nocanonetv.it
    app_base_url: str = "http://localhost:5173"

    # Invio email. "console" stampa a schermo (dev, nessun provider);
    # "resend" invia davvero via API Resend.
    email_backend: str = "console"
    resend_api_key: str = ""
    # Mittente. Con backend sandbox di Resend usare onboarding@resend.dev
    # (invia solo al proprietario dell'account). Dopo aver verificato il
    # dominio nocanonetv.it -> "nocanonetv.it <noreply@nocanonetv.it>".
    email_from: str = "nocanonetv.it <onboarding@resend.dev>"

    @property
    def database_url(self) -> str:
        return f"postgresql://{self.postgres_user}:{self.postgres_password}@{self.postgres_host}/{self.postgres_db}"

    class Config:
        env_file = ENV_FILE
        extra = "ignore"

settings = Settings()