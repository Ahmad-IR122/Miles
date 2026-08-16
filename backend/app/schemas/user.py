from datetime import datetime

from pydantic import BaseModel


class UserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    created_at: datetime

    model_config = {"from_attributes": True}
