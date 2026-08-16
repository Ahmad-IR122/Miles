from fastapi import APIRouter, Depends

from app.core.security import get_current_user
from app.models.user_models import User
from app.schemas.user import UserResponse

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
def read_current_user(user: User = Depends(get_current_user)):
    return user
