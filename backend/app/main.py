from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.db.database import Base, SessionLocal, engine
from app.models import Document, User
from app.routers import auth, documents, users
from app.services.security import hash_password

app = FastAPI(title='Document Management API', version='1.0.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


def ensure_summary_embedding_column():
    if engine.dialect.name != 'sqlite':
        return

    with engine.begin() as connection:
        result = connection.execute(text("PRAGMA table_info(documents)"))
        columns = [row[1] for row in result.fetchall()]
        if columns and 'summary_embedding' not in columns:
            connection.execute(text("ALTER TABLE documents ADD COLUMN summary_embedding TEXT"))
            connection.execute(
                text("UPDATE documents SET summary_embedding = '[]' WHERE summary_embedding IS NULL")
            )


@app.on_event('startup')
def startup_event():
    Base.metadata.create_all(bind=engine)
    ensure_summary_embedding_column()
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == 'admin@example.com').first()
        if not admin:
            db.add(
                User(
                    name='System Admin',
                    email='admin@example.com',
                    password=hash_password('Admin@12345'),
                    role='admin',
                )
            )
            db.commit()
    finally:
        db.close()


@app.get('/health')
def health_check():
    return {'status': 'ok'}


app.include_router(auth.router, prefix='/api')
app.include_router(users.router, prefix='/api')
app.include_router(documents.router, prefix='/api')
