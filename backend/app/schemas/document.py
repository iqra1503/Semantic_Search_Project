from datetime import datetime

from pydantic import BaseModel, Field


class DocumentBase(BaseModel):
    title: str = Field(min_length=3, max_length=255)
    description: str = Field(min_length=1)
    summary: str = Field(min_length=1)


class DocumentCreate(DocumentBase):
    pass


class DocumentUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=255)
    description: str | None = Field(default=None, min_length=1)
    summary: str | None = Field(default=None, min_length=1)


class DocumentResponse(DocumentBase):
    id: int
    created_by: int
    created_at: datetime
    updated_at: datetime

    model_config = {'from_attributes': True}
