import json
import math

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, Request, UploadFile, status
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.database import get_db
from app.models.document import Document
from app.models.user import User
from app.schemas.document import (
    DocumentCreate,
    DocumentResponse,
    DocumentUpdate,
    PublicDocumentResponse,
    SimilarDocumentResponse,
    SummaryPreviewRequest,
    SummaryPreviewResponse,
)
from app.services.embeddings import generate_summary_embedding, generate_summary_text
from app.services.file_parser import extract_text_from_upload

router = APIRouter(prefix='/documents', tags=['documents'])


def _to_public_document_response(document: Document) -> PublicDocumentResponse:
    return PublicDocumentResponse(
        id=document.id,
        title=document.title,
        description=document.description,
        summary=document.summary,
        summary_embedding=document.summary_embedding,
        source_type=document.source_type,
        file_name=document.file_name,
        file_type=document.file_type,
        created_by=document.created_by,
        created_at=document.created_at,
        updated_at=document.updated_at,
        author_name=document.creator.name,
    )


def _cosine_similarity(vector_a: list[float], vector_b: list[float]) -> float:
    if not vector_a or not vector_b or len(vector_a) != len(vector_b):
        return 0.0

    dot_product = sum(a * b for a, b in zip(vector_a, vector_b))
    magnitude_a = math.sqrt(sum(a * a for a in vector_a))
    magnitude_b = math.sqrt(sum(b * b for b in vector_b))

    if magnitude_a == 0 or magnitude_b == 0:
        return 0.0

    return dot_product / (magnitude_a * magnitude_b)


@router.get('/public', response_model=list[PublicDocumentResponse])
def list_public_documents(db: Session = Depends(get_db)):
    documents = db.query(Document).join(User, User.id == Document.created_by).order_by(Document.created_at.desc()).all()

    return [_to_public_document_response(document) for document in documents]


@router.get('/public/{document_id}', response_model=PublicDocumentResponse)
def get_public_document(document_id: int, db: Session = Depends(get_db)):
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Document not found')

    return _to_public_document_response(document)


@router.get('/public/{document_id}/similar', response_model=list[SimilarDocumentResponse])
def get_similar_public_documents(
    document_id: int,
    min_similarity: float = Query(0.5, ge=0.0, le=1.0),
    limit: int = Query(5, ge=1, le=5),
    db: Session = Depends(get_db),
):
    source_document = db.query(Document).filter(Document.id == document_id).first()
    if not source_document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Document not found')

    try:
        source_embedding = json.loads(source_document.summary_embedding)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail='Invalid source embedding') from exc

    candidates = db.query(Document).filter(Document.id != document_id).order_by(Document.created_at.desc()).all()

    scored_documents: list[SimilarDocumentResponse] = []
    for candidate in candidates:
        try:
            candidate_embedding = json.loads(candidate.summary_embedding)
        except json.JSONDecodeError:
            continue

        similarity = _cosine_similarity(source_embedding, candidate_embedding)
        if similarity < min_similarity:
            continue

        scored_documents.append(
            SimilarDocumentResponse(
                id=candidate.id,
                title=candidate.title,
                author_name=candidate.creator.name,
                similarity=similarity,
            )
        )

    scored_documents.sort(key=lambda item: item.similarity, reverse=True)
    return scored_documents[:limit]


@router.post('/summary-preview', response_model=SummaryPreviewResponse)
def generate_summary_preview(
    payload: SummaryPreviewRequest,
    current_user: User = Depends(get_current_user),
):
    del current_user
    summary = generate_summary_text(payload.title, payload.description)
    return SummaryPreviewResponse(summary=summary)


@router.get('', response_model=list[DocumentResponse])
def list_documents(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(Document)
    if current_user.role != 'admin':
        query = query.filter(Document.created_by == current_user.id)
    return query.order_by(Document.created_at.desc()).all()


@router.post('', response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def create_document(
    request: Request,
    file: UploadFile | None = File(default=None),
    title: str | None = Form(default=None),
    description: str | None = Form(default=None),
    summary: str | None = Form(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    content_type = request.headers.get('content-type', '')

    if content_type.startswith('multipart/form-data'):
        cleaned_title = (title or '').strip()
        cleaned_description = (description or '').strip()
        cleaned_summary = (summary or '').strip()

        if not cleaned_title:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail='Title is required')

        source_type = 'typed'
        file_name = None
        file_type = None
        text_content = cleaned_description

        if file:
            text_content, file_name, file_type = await extract_text_from_upload(file)
            source_type = 'uploaded'

        if not text_content:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail='Provide description text or upload a supported file',
            )

        summary_text = cleaned_summary or generate_summary_text(cleaned_title, text_content)

        document = Document(
            title=cleaned_title,
            description=text_content,
            summary=summary_text,
            summary_embedding=json.dumps(generate_summary_embedding(summary_text)),
            source_type=source_type,
            file_name=file_name,
            file_type=file_type,
            created_by=current_user.id,
        )
    else:
        try:
            payload = DocumentCreate.model_validate(await request.json())
        except ValidationError as exc:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail='Invalid JSON payload') from exc

        summary_text = payload.summary or generate_summary_text(payload.title, payload.description)
        document = Document(
            title=payload.title,
            description=payload.description,
            summary=summary_text,
            summary_embedding=json.dumps(generate_summary_embedding(summary_text)),
            source_type='typed',
            created_by=current_user.id,
        )

    db.add(document)
    db.commit()
    db.refresh(document)
    return document


@router.get('/{document_id}', response_model=DocumentResponse)
def get_document(document_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Document not found')

    if current_user.role != 'admin' and document.created_by != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Not authorized')

    return document


@router.put('/{document_id}', response_model=DocumentResponse)
async def update_document(
    document_id: int,
    request: Request,
    file: UploadFile | None = File(default=None),
    title: str | None = Form(default=None),
    description: str | None = Form(default=None),
    summary: str | None = Form(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Document not found')

    if current_user.role != 'admin' and document.created_by != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Not authorized')

    content_type = request.headers.get('content-type', '')

    if content_type.startswith('multipart/form-data'):
        updates: dict[str, str] = {}

        if title is not None:
            cleaned_title = title.strip()
            if not cleaned_title:
                raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail='Title cannot be empty')
            updates['title'] = cleaned_title

        if description is not None:
            updates['description'] = description.strip()
            updates['source_type'] = 'typed'
            updates['file_name'] = None
            updates['file_type'] = None

        if file:
            text_content, file_name, file_type = await extract_text_from_upload(file)
            updates['description'] = text_content
            updates['source_type'] = 'uploaded'
            updates['file_name'] = file_name
            updates['file_type'] = file_type

        if summary is not None:
            cleaned_summary = summary.strip()
            updates['summary'] = cleaned_summary

    else:
        try:
            payload = DocumentUpdate.model_validate(await request.json())
        except ValidationError as exc:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail='Invalid JSON payload') from exc
        updates = payload.model_dump(exclude_unset=True)

    if 'summary' in updates:
        updates['summary_embedding'] = json.dumps(generate_summary_embedding(updates['summary']))

    for key, value in updates.items():
        setattr(document, key, value)

    db.commit()
    db.refresh(document)
    return document


@router.delete('/{document_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_document(document_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Document not found')

    if current_user.role != 'admin' and document.created_by != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Not authorized')

    if current_user.role == 'admin' or document.created_by == current_user.id:
        db.delete(document)
        db.commit()
