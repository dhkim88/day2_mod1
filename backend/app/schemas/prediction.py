from pydantic import BaseModel, Field
from typing import List


class PredictRequest(BaseModel):
    """예측 요청 스키마"""
    symptom_ids: List[int] = Field(..., min_length=1, description="증상 ID 목록 (최소 1개)")


class MatchedSymptom(BaseModel):
    """매칭된 증상 정보"""
    id: int
    name: str
    probability: float = Field(..., ge=0.0, le=1.0)

    class Config:
        from_attributes = True


class DiseasePredictor(BaseModel):
    """질병 예측 결과"""
    disease_id: int
    disease_name: str
    description: str
    category: str = Field(..., description="질병 카테고리")
    probability: float = Field(..., ge=0.0, le=1.0, description="최종 예측 확률")
    rank: int = Field(..., ge=1, description="순위")
    matched_symptoms: List[MatchedSymptom] = Field(..., description="일치한 증상 목록")

    class Config:
        from_attributes = True


class PredictResponse(BaseModel):
    """예측 응답 스키마"""
    predictions: List[DiseasePredictor] = Field(..., description="예측된 질병 목록 (상위 3개)")
    total_diseases_checked: int = Field(..., ge=0, description="검사한 전체 질병 수")
