import json
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from fastapi import HTTPException, status

from app.core.config import settings

EMBEDDING_MODEL = 'text-embedding-3-small'
EMBEDDING_ENDPOINT = 'https://models.inference.ai.azure.com/embeddings'
SUMMARY_MODEL = 'azure-openai/gpt-4o-mini'
CHAT_COMPLETIONS_ENDPOINT = 'https://models.inference.ai.azure.com/chat/completions'


def _require_models_token() -> None:
    if not settings.GITHUB_MODELS_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='GITHUB_MODELS_TOKEN is not configured',
        )


def generate_summary_text(title: str, description: str) -> str:
    _require_models_token()

    payload = {
        'model': SUMMARY_MODEL,
        'messages': [
            {
                'role': 'system',
                'content': 'You are an assistant that writes concise and clear document summaries in plain text.',
            },
            {
                'role': 'user',
                'content': (
                    'Create a short summary (2-3 sentences, max 90 words) for the following document. '
                    'Return only the summary text.\n\n'
                    f'Title: {title}\n'
                    f'Description: {description}'
                ),
            },
        ],
        'temperature': 0.3,
        'max_tokens': 180,
    }

    request = Request(
        CHAT_COMPLETIONS_ENDPOINT,
        data=json.dumps(payload).encode('utf-8'),
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
            detail=f'Summary generation request failed: {detail or exc.reason}',
        ) from exc
    except URLError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail='Unable to connect to summary provider',
        ) from exc

    choices = body.get('choices') or []
    content = choices[0].get('message', {}).get('content', '').strip() if choices else ''
    if not content:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail='Summary provider returned an invalid response',
        )

    return content


def generate_summary_embedding(summary: str) -> list[float]:
    _require_models_token()

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
