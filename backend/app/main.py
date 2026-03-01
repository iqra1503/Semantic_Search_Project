from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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


@app.on_event('startup')
def startup_event():
    Base.metadata.create_all(bind=engine)
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
