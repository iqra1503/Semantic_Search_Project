from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.database import get_db
from app.models.document import Document
from app.models.user import User
from app.schemas.document import DocumentCreate, DocumentResponse, DocumentUpdate

router = APIRouter(prefix='/documents', tags=['documents'])


@router.get('', response_model=list[DocumentResponse])
def list_documents(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(Document)
    if current_user.role != 'admin':
        query = query.filter(Document.created_by == current_user.id)
    return query.order_by(Document.created_at.desc()).all()


@router.post('', response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
def create_document(
    payload: DocumentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    document = Document(**payload.model_dump(), created_by=current_user.id)
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
def update_document(
    document_id: int,
    payload: DocumentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Document not found')

    if current_user.role != 'admin' and document.created_by != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Not authorized')

    for key, value in payload.model_dump(exclude_unset=True).items():
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
