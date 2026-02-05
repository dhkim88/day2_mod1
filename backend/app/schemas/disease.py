from datetime import datetime
from pydantic import BaseModel, Field


class DiseaseBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="질병 이름")
    description: str = Field(..., min_length=1, description="질병 설명")
    category: str = Field(..., min_length=1, max_length=50, description="질병 카테고리")


class DiseaseCreate(DiseaseBase):
    pass


class DiseaseUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100, description="질병 이름")
    description: str | None = Field(None, min_length=1, description="질병 설명")
    category: str | None = Field(None, min_length=1, max_length=50, description="질병 카테고리")


class DiseaseResponse(DiseaseBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}
