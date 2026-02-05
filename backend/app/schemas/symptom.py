from datetime import datetime
from pydantic import BaseModel, Field


class SymptomBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="증상 이름")
    description: str | None = Field(None, description="증상 설명")


class SymptomCreate(SymptomBase):
    pass


class SymptomUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100, description="증상 이름")
    description: str | None = Field(None, description="증상 설명")


class SymptomResponse(SymptomBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}
