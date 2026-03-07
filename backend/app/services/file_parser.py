from __future__ import annotations

from io import BytesIO
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

SUPPORTED_EXTENSIONS = {'.txt', '.pdf', '.docx'}


def _extract_txt(file_bytes: bytes) -> str:
    return file_bytes.decode('utf-8', errors='ignore').strip()


def _extract_pdf(file_bytes: bytes) -> str:
    try:
        from PyPDF2 import PdfReader
    except ImportError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='PDF parsing dependency is missing',
        ) from exc

    reader = PdfReader(BytesIO(file_bytes))
    text = '\n'.join((page.extract_text() or '').strip() for page in reader.pages)
    return text.strip()


def _extract_docx(file_bytes: bytes) -> str:
    try:
        from docx import Document as DocxDocument
    except ImportError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='DOCX parsing dependency is missing',
        ) from exc

    document = DocxDocument(BytesIO(file_bytes))
    text = '\n'.join(paragraph.text.strip() for paragraph in document.paragraphs if paragraph.text.strip())
    return text.strip()


async def extract_text_from_upload(file: UploadFile) -> tuple[str, str, str]:
    extension = Path(file.filename or '').suffix.lower()
    if extension not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Unsupported file type. Allowed types: .txt, .pdf, .docx',
        )

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Uploaded file is empty')

    if extension == '.txt':
        extracted_text = _extract_txt(file_bytes)
    elif extension == '.pdf':
        extracted_text = _extract_pdf(file_bytes)
    else:
        extracted_text = _extract_docx(file_bytes)

    if not extracted_text:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Could not extract text from uploaded file')

    return extracted_text, file.filename or 'uploaded-file', extension
