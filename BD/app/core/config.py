from pydantic_settings import BaseSettings 
import os

class Settings(BaseSettings):
   
    DATABASE_URL: str 
    
 
    API_PORT: int = 8000
    JWT_SECRET: str
    JWT_EXPIRES_IN: int = 3600  # segundos
    DEBUG: bool = False

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

# Instancia global
settings = Settings()

# 🧩 Verificación opcional
if __name__ == "__main__":
    print("DATABASE_URL:", settings.DATABASE_URL)
    print("DEBUG:", settings.DEBUG)
