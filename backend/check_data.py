"""데이터 확인 스크립트"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal
from app.models.symptom import Symptom
from app.models.disease import Disease
from app.models.disease_symptom import DiseaseSymptom

db = SessionLocal()

print("=" * 60)
print("데이터베이스 통계")
print("=" * 60)
print(f"총 증상 수: {db.query(Symptom).count()}개")
print(f"총 질병 수: {db.query(Disease).count()}개")
print(f"총 질병-증상 관계 수: {db.query(DiseaseSymptom).count()}개")

print("\n" + "=" * 60)
print("증상 샘플 (첫 10개)")
print("=" * 60)
for s in db.query(Symptom).limit(10).all():
    print(f"  - {s.name}: {s.description}")

print("\n" + "=" * 60)
print("질병 샘플 (첫 10개)")
print("=" * 60)
for d in db.query(Disease).limit(10).all():
    # 해당 질병의 증상 개수 확인
    symptom_count = db.query(DiseaseSymptom).filter(DiseaseSymptom.disease_id == d.id).count()
    print(f"  - {d.name} ({symptom_count}개 증상): {d.description[:40]}...")

print("\n" + "=" * 60)
print("질병-증상 관계 샘플 (감기)")
print("=" * 60)
disease = db.query(Disease).filter(Disease.name == "감기").first()
if disease:
    relations = db.query(DiseaseSymptom).filter(DiseaseSymptom.disease_id == disease.id).all()
    for rel in relations:
        symptom = db.query(Symptom).filter(Symptom.id == rel.symptom_id).first()
        primary_text = "주증상" if rel.is_primary else "부증상"
        print(f"  - {symptom.name}: {rel.probability:.0%} ({primary_text})")

db.close()
