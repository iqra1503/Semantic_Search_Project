from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import require_admin
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.services.security import hash_password

router = APIRouter(prefix='/users', tags=['users'])


@router.get('', response_model=list[UserResponse])
def list_users(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    return db.query(User).order_by(User.created_at.desc()).all()


@router.post('', response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(payload: UserCreate, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Email already exists')

    user = User(
        name=payload.name,
        email=payload.email,
        password=hash_password(payload.password),
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get('/{user_id}', response_model=UserResponse)
def get_user(user_id: int, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found')
    return user


@router.put('/{user_id}', response_model=UserResponse)
def update_user(user_id: int, payload: UserUpdate, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found')

    updates = payload.model_dump(exclude_unset=True)
    if 'email' in updates:
        existing = db.query(User).filter(User.email == updates['email'], User.id != user_id).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Email already exists')

    if 'password' in updates:
        updates['password'] = hash_password(updates['password'])

    for key, value in updates.items():
        setattr(user, key, value)

    db.commit()
    db.refresh(user)
    return user
