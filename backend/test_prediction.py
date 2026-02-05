"""
질병 예측 알고리즘 테스트 스크립트
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal
from app.models.symptom import Symptom
from app.models.disease import Disease
from app.models.disease_symptom import DiseaseSymptom

def test_prediction():
    db = SessionLocal()

    # 1. 테스트할 증상들 찾기
    test_symptom_names = ["감각이상", "어지러움", "체중증가"]
    symptoms = db.query(Symptom).filter(Symptom.name.in_(test_symptom_names)).all()

    print("=" * 60)
    print("테스트 증상:")
    for symptom in symptoms:
        print(f"  - {symptom.name} (ID: {symptom.id})")
    print()

    symptom_ids = [s.id for s in symptoms]

    # 2. 모든 질병에 대해 점수 계산
    all_diseases = db.query(Disease).all()
    predictions = []

    print("=" * 60)
    print("점수 계산 과정:")
    print("=" * 60)

    for disease in all_diseases:
        # 해당 질병의 모든 증상-확률 정보
        disease_symptom_relations = (
            db.query(DiseaseSymptom)
            .filter(DiseaseSymptom.disease_id == disease.id)
            .all()
        )

        if not disease_symptom_relations:
            continue

        # 일치하는 증상 찾기
        matched_symptoms = []
        matched_probabilities = []

        for ds_relation in disease_symptom_relations:
            if ds_relation.symptom_id in symptom_ids:
                symptom = db.query(Symptom).filter(Symptom.id == ds_relation.symptom_id).first()
                matched_symptoms.append({
                    "name": symptom.name,
                    "probability": ds_relation.probability
                })
                matched_probabilities.append(ds_relation.probability)

        # 일치하는 증상이 없으면 스킵
        if not matched_symptoms:
            continue

        # 최종 점수 계산 (새 알고리즘)
        user_coverage = len(matched_symptoms) / len(symptom_ids)
        avg_probability = sum(matched_probabilities) / len(matched_probabilities)
        match_count_bonus = 1 + len(matched_symptoms) * 0.1
        final_score = user_coverage * avg_probability * match_count_bonus

        print(f"\n질병: {disease.name}")
        print(f"  일치 증상: {len(matched_symptoms)}/{len(symptom_ids)}")
        print(f"  일치 증상 목록: {[s['name'] for s in matched_symptoms]}")
        print(f"  사용자 커버리지: {user_coverage:.2f}")
        print(f"  평균 확률: {avg_probability:.2f}")
        print(f"  가중치 보너스: {match_count_bonus:.2f}")
        print(f"  최종 점수: {final_score:.4f}")

        predictions.append({
            "name": disease.name,
            "matched_count": len(matched_symptoms),
            "matched_symptoms": matched_symptoms,
            "score": final_score
        })

    # 3. 점수 순으로 정렬
    predictions.sort(key=lambda x: x["score"], reverse=True)

    print("\n" + "=" * 60)
    print("예측 결과 (상위 5개):")
    print("=" * 60)

    for i, pred in enumerate(predictions[:5], 1):
        print(f"\n{i}위: {pred['name']}")
        print(f"  최종 점수: {pred['score']:.4f}")
        print(f"  일치 증상 수: {pred['matched_count']}/{len(symptom_ids)}")
        print(f"  일치 증상: {[s['name'] for s in pred['matched_symptoms']]}")

    # 4. 제2형당뇨병 순위 확인
    diabetes_rank = None
    for i, pred in enumerate(predictions, 1):
        if pred["name"] == "제2형당뇨병":
            diabetes_rank = i
            break

    print("\n" + "=" * 60)
    print("테스트 결과:")
    print("=" * 60)
    if diabetes_rank == 1:
        print("✅ 성공! 제2형당뇨병이 1위입니다.")
    else:
        print(f"❌ 실패! 제2형당뇨병이 {diabetes_rank}위입니다.")

    db.close()

if __name__ == "__main__":
    test_prediction()
