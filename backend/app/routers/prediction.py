from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, List

from app.database import get_db
from app.schemas.prediction import (
    PredictRequest,
    PredictResponse,
    DiseasePredictor,
    MatchedSymptom,
)
from app.models.symptom import Symptom
from app.models.disease import Disease
from app.models.disease_symptom import DiseaseSymptom

router = APIRouter(prefix="/api/predict", tags=["Prediction"])


@router.post("", response_model=PredictResponse)
def predict_disease(request: PredictRequest, db: Session = Depends(get_db)):
    """
    입력된 증상들을 기반으로 질병을 예측합니다.

    ## 예측 알고리즘:
    1. 입력된 증상 ID 목록 검증
    2. 모든 질병을 순회하면서:
       - 해당 질병의 모든 증상들 가져오기
       - 입력된 증상과 일치하는 증상들의 probability 평균 계산
       - 사용자 커버리지 = (일치하는 증상 수 / 입력된 증상 수)
       - 최종 점수 = (probability 평균) * (사용자 커버리지) * (1 + 일치 증상 수 * 0.1)
    3. 점수가 높은 순으로 정렬
    4. 상위 3개 반환
    """
    symptom_ids = request.symptom_ids

    # 1. 입력된 증상 ID 검증
    if not symptom_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="symptom_ids는 비어있을 수 없습니다.",
        )

    # 입력된 증상들이 실제 존재하는지 확인
    existing_symptoms = db.query(Symptom).filter(Symptom.id.in_(symptom_ids)).all()
    existing_symptom_ids = {symptom.id for symptom in existing_symptoms}

    # 존재하지 않는 증상 ID 체크
    invalid_ids = set(symptom_ids) - existing_symptom_ids
    if invalid_ids:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"존재하지 않는 증상 ID: {list(invalid_ids)}",
        )

    # 2. 모든 질병 가져오기
    all_diseases = db.query(Disease).all()
    total_diseases_checked = len(all_diseases)

    # 3. 각 질병별 예측 점수 계산
    predictions: List[Dict] = []

    for disease in all_diseases:
        # 해당 질병의 모든 증상-확률 정보 가져오기
        disease_symptom_relations = (
            db.query(DiseaseSymptom)
            .filter(DiseaseSymptom.disease_id == disease.id)
            .all()
        )

        if not disease_symptom_relations:
            # 증상이 없는 질병은 스킵
            continue

        # 일치하는 증상 찾기
        matched_symptoms = []
        matched_probabilities = []

        for ds_relation in disease_symptom_relations:
            if ds_relation.symptom_id in symptom_ids:
                # 증상 정보 가져오기
                symptom = db.query(Symptom).filter(Symptom.id == ds_relation.symptom_id).first()
                matched_symptoms.append(
                    MatchedSymptom(
                        id=symptom.id,
                        name=symptom.name,
                        probability=ds_relation.probability,
                    )
                )
                matched_probabilities.append(ds_relation.probability)

        # 일치하는 증상이 없으면 스킵
        if not matched_symptoms:
            continue

        # 최종 점수 계산
        # 1. 입력한 증상 중 얼마나 이 질병과 일치하는가? (사용자 관점)
        user_coverage = len(matched_symptoms) / len(symptom_ids)

        # 2. 일치한 증상들의 평균 확률
        avg_probability = sum(matched_probabilities) / len(matched_probabilities)

        # 3. 일치한 증상 수에 따른 가중치 (많이 일치할수록 보너스)
        match_count_bonus = 1 + len(matched_symptoms) * 0.1

        # 4. 최종 점수
        final_score = user_coverage * avg_probability * match_count_bonus

        # 디버깅 로그
        print(f"질병: {disease.name}")
        print(f"  일치 증상: {len(matched_symptoms)}/{len(symptom_ids)}")
        print(f"  사용자 커버리지: {user_coverage:.2f}")
        print(f"  평균 확률: {avg_probability:.2f}")
        print(f"  가중치 보너스: {match_count_bonus:.2f}")
        print(f"  최종 점수: {final_score:.4f}")
        print()

        predictions.append(
            {
                "disease_id": disease.id,
                "disease_name": disease.name,
                "description": disease.description,
                "category": disease.category,
                "probability": round(final_score, 4),
                "matched_symptoms": matched_symptoms,
            }
        )

    # 4. 점수 높은 순으로 정렬하고 상위 3개 선택
    predictions.sort(key=lambda x: x["probability"], reverse=True)
    top_predictions = predictions[:3]

    # 5. 순위 추가
    for rank, pred in enumerate(top_predictions, start=1):
        pred["rank"] = rank

    # 6. 응답 생성
    result = PredictResponse(
        predictions=[DiseasePredictor(**pred) for pred in top_predictions],
        total_diseases_checked=total_diseases_checked,
    )

    return result
