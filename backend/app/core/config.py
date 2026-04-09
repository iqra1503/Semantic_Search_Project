from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=('.env', 'backend/.env'),
        env_file_encoding='utf-8',
        extra='ignore',
    )

    DATABASE_URL: str = 'sqlite:///./app.db'
    JWT_SECRET_KEY: str = Field(default='change-me', validation_alias=AliasChoices('JWT_SECRET_KEY', 'SECRET_KEY'))
    ALGORITHM: str = 'HS256'
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    EMBEDDINGS_API_KEY: str = ''
    GITHUB_TOKEN: str = Field(
        default='',
        validation_alias=AliasChoices('GITHUB_TOKEN', 'GITHUB_MODELS_TOKEN'),
    )

    EMBEDDINGS_MODEL: str = 'text-embedding-3-small'
    EMBEDDINGS_BASE_URL: str = 'https://models.inference.ai.azure.com'
    SUMMARY_MODEL: str = 'gpt-4o-mini'
    LLM_BASE_URL: str = 'https://models.inference.ai.azure.com'

    @property
    def api_token(self) -> str:
        return self.EMBEDDINGS_API_KEY or self.GITHUB_TOKEN


settings = Settings()
