import os
from datetime import timedelta
from dotenv import load_dotenv

# Carrega variáveis do .env se existir
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

class Config:
    # Exemplo de URL do Postgres local
    # Ajuste para sua máquina ou Docker
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg2://univet:univet@localhost:5432/univet_db"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "troca_essa_chave_por_uma_bem_grande")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)

    # Se quiser limitar CORS depois, dá para ajustar
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")
