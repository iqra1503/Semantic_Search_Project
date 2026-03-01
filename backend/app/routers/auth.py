from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.user import UserResponse
from app.services.security import create_access_token, verify_password

router = APIRouter(prefix='/auth', tags=['auth'])


@router.post('/login', response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid credentials')

    token = create_access_token({'sub': str(user.id), 'role': user.role, 'email': user.email})
    return TokenResponse(access_token=token)


@router.get('/me', response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
