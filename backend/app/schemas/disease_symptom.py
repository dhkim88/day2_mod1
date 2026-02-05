from pydantic import BaseModel, Field


class DiseaseSymptomCreate(BaseModel):
    """질병에 증상 추가 요청"""

    symptom_id: int = Field(..., gt=0, description="증상 ID")
    probability: float = Field(..., ge=0.0, le=1.0, description="발생 확률 (0.0 ~ 1.0)")
    is_primary: bool = Field(default=False, description="주요 증상 여부")


class SymptomInfo(BaseModel):
    """증상 정보"""

    symptom_id: int
    symptom_name: str
    probability: float
    is_primary: bool

    class Config:
        from_attributes = True


class DiseaseSymptomResponse(BaseModel):
    """질병의 증상 목록 응답"""

    disease_id: int
    disease_name: str
    symptoms: list[SymptomInfo]

    class Config:
        from_attributes = True


class DiseaseSymptomsBulkUpdate(BaseModel):
    """여러 증상 일괄 업데이트"""

    symptoms: list[DiseaseSymptomCreate] = Field(..., description="증상 목록")
