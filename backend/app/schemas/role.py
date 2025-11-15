from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class RoleBase(BaseModel):
    role_name: str
    description: Optional[str] = None

class RoleCreate(RoleBase):
    event_id: UUID

class RoleOut(RoleBase):
    id: UUID
    event_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}