import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv('DATABASE_URL')
    ADMIN_API_KEY: str = os.getenv('ADMIN_API_KEY', 'dev-key')
    HOST: str = os.getenv('HOST','0.0.0.0')
    PORT: int = int(os.getenv('PORT', 4000))
    SECRET_KEY: str = "pw96ruT0taOCNg_dNEmQv7omV9VGpTR_qDI2zPKCaYx5yycQIj_NMiJ68UpKLqRq172AAmoHDxlTe_5g8D1XBQ"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

settings = Settings()
