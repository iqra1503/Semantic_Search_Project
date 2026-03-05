from datetime import datetime

from pydantic import BaseModel, Field


class DocumentBase(BaseModel):
    title: str = Field(min_length=3, max_length=255)
    description: str = Field(min_length=1)


class DocumentCreate(DocumentBase):
    summary: str | None = Field(default=None, min_length=1)


class DocumentCreateWithSummary(DocumentBase):
    summary: str = Field(min_length=1)


class DocumentUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=255)
    description: str | None = Field(default=None, min_length=1)
    summary: str | None = Field(default=None, min_length=1)


class DocumentResponse(DocumentCreateWithSummary):
    id: int
    summary_embedding: str
    created_by: int
    created_at: datetime
    updated_at: datetime

    model_config = {'from_attributes': True}


class PublicDocumentResponse(DocumentResponse):
    author_name: str


class SimilarDocumentResponse(BaseModel):
    id: int
    title: str
    author_name: str
    similarity: float


class SummaryPreviewRequest(DocumentBase):
    pass


class SummaryPreviewResponse(BaseModel):
    summary: str = Field(min_length=1)
