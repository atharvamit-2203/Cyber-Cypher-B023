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
    
    # LLM Provider
    llm_provider: str = "ollama"  # or "openai"
    ollama_model: str = "llama3"
    ollama_base_url: str = "http://localhost:11434"
    
    # Supabase
    supabase_url: str = ""
    supabase_key: str = ""
    
    # Database
    database_url: str = "sqlite:///./cyber_cypher.db"
    
    # Application
    app_name: str = "Cyber Cypher Agent System"
    debug: bool = True
    cors_origins: str = "http://localhost:3000,http://localhost:3001"
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"


settings = Settings()
