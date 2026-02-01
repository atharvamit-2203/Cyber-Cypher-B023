from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # OpenAI
    openai_api_key: str
    
    # LangSmith
    langchain_tracing_v2: bool = True
    langchain_api_key: str
    langchain_project: str = "cyber-cypher-agent"
    langchain_endpoint: str = "https://api.smith.langchain.com"
    
    # Database
    database_url: str = "sqlite:///./cyber_cypher.db"
    
    # Application
    app_name: str = "Cyber Cypher Agent System"
    debug: bool = True
    cors_origins: List[str] = ["http://localhost:3000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
