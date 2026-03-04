import json
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from fastapi import HTTPException, status

from app.core.config import settings

EMBEDDING_MODEL = 'text-embedding-3-small'
EMBEDDING_ENDPOINT = 'https://models.inference.ai.azure.com/embeddings'


def generate_summary_embedding(summary: str) -> list[float]:
    if not settings.GITHUB_MODELS_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='GITHUB_MODELS_TOKEN is not configured',
        )

    payload = json.dumps({'input': summary, 'model': EMBEDDING_MODEL}).encode('utf-8')
    request = Request(
        EMBEDDING_ENDPOINT,
        data=payload,
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {settings.GITHUB_MODELS_TOKEN}',
        },
        method='POST',
    )

    try:
        with urlopen(request, timeout=30) as response:
            body = json.loads(response.read().decode('utf-8'))
    except HTTPError as exc:
        detail = exc.read().decode('utf-8', errors='ignore')
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f'Embedding request failed: {detail or exc.reason}',
        ) from exc
    except URLError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail='Unable to connect to embedding provider',
        ) from exc

    embedding_data = body.get('data') or []
    if not embedding_data or 'embedding' not in embedding_data[0]:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail='Embedding provider returned an invalid response',
        )

    return embedding_data[0]['embedding']
