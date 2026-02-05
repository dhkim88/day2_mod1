from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Disease, Symptom, DiseaseSymptom
from app.schemas import (
    DiseaseCreate,
    DiseaseUpdate,
    DiseaseResponse,
    DiseaseSymptomCreate,
    DiseaseSymptomResponse,
    DiseaseSymptomsBulkUpdate,
    SymptomInfo,
)

router = APIRouter(prefix="/api/diseases", tags=["diseases"])


@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    """질병 카테고리 목록 조회"""
    categories = db.query(Disease.category).distinct().all()
    return {"categories": [c[0] for c in categories if c[0]]}


@router.get("/", response_model=list[DiseaseResponse])
def get_diseases(
    skip: int = 0,
    limit: int = 100,
    category: str | None = None,
    db: Session = Depends(get_db)
):
    """모든 질병 목록 조회 (카테고리 필터 옵션)"""
    query = db.query(Disease)
    if category:
        query = query.filter(Disease.category == category)
    diseases = query.offset(skip).limit(limit).all()
    return diseases


@router.get("/{disease_id}", response_model=DiseaseResponse)
def get_disease(disease_id: int, db: Session = Depends(get_db)):
    """특정 질병 조회"""
    disease = db.query(Disease).filter(Disease.id == disease_id).first()
    if not disease:
        raise HTTPException(status_code=404, detail="질병을 찾을 수 없습니다")
    return disease


@router.post("/", response_model=DiseaseResponse, status_code=201)
def create_disease(disease: DiseaseCreate, db: Session = Depends(get_db)):
    """새로운 질병 생성"""
    # 중복 체크
    existing = db.query(Disease).filter(Disease.name == disease.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="이미 존재하는 질병 이름입니다")

    db_disease = Disease(**disease.model_dump())
    db.add(db_disease)
    db.commit()
    db.refresh(db_disease)
    return db_disease


@router.put("/{disease_id}", response_model=DiseaseResponse)
def update_disease(disease_id: int, disease: DiseaseUpdate, db: Session = Depends(get_db)):
    """질병 정보 수정"""
    db_disease = db.query(Disease).filter(Disease.id == disease_id).first()
    if not db_disease:
        raise HTTPException(status_code=404, detail="질병을 찾을 수 없습니다")

    # 중복 체크 (이름 변경 시)
    if disease.name and disease.name != db_disease.name:
        existing = db.query(Disease).filter(Disease.name == disease.name).first()
        if existing:
            raise HTTPException(status_code=400, detail="이미 존재하는 질병 이름입니다")

    update_data = disease.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_disease, key, value)

    db.commit()
    db.refresh(db_disease)
    return db_disease


@router.delete("/{disease_id}")
def delete_disease(disease_id: int, db: Session = Depends(get_db)):
    """질병 삭제"""
    disease = db.query(Disease).filter(Disease.id == disease_id).first()
    if not disease:
        raise HTTPException(status_code=404, detail="질병을 찾을 수 없습니다")

    db.delete(disease)
    db.commit()
    return {"message": "질병이 성공적으로 삭제되었습니다"}


# ==================== 질병-증상 연결 API ====================


@router.get("/{disease_id}/symptoms", response_model=DiseaseSymptomResponse)
def get_disease_symptoms(disease_id: int, db: Session = Depends(get_db)):
    """특정 질병의 모든 증상 조회"""
    # 질병 존재 확인
    disease = db.query(Disease).filter(Disease.id == disease_id).first()
    if not disease:
        raise HTTPException(status_code=404, detail="질병을 찾을 수 없습니다")

    # 질병-증상 연결 조회
    disease_symptoms = (
        db.query(DiseaseSymptom).filter(DiseaseSymptom.disease_id == disease_id).all()
    )

    # 증상 정보 구성
    symptom_infos = []
    for ds in disease_symptoms:
        symptom = db.query(Symptom).filter(Symptom.id == ds.symptom_id).first()
        if symptom:
            symptom_infos.append(
                SymptomInfo(
                    symptom_id=symptom.id,
                    symptom_name=symptom.name,
                    probability=ds.probability,
                    is_primary=ds.is_primary,
                )
            )

    return DiseaseSymptomResponse(
        disease_id=disease.id, disease_name=disease.name, symptoms=symptom_infos
    )


@router.post("/{disease_id}/symptoms", status_code=201)
def add_disease_symptom(
    disease_id: int, symptom_data: DiseaseSymptomCreate, db: Session = Depends(get_db)
):
    """질병에 증상 추가 (이미 존재하면 업데이트)"""
    # 질병 존재 확인
    disease = db.query(Disease).filter(Disease.id == disease_id).first()
    if not disease:
        raise HTTPException(status_code=404, detail="질병을 찾을 수 없습니다")

    # 증상 존재 확인
    symptom = (
        db.query(Symptom).filter(Symptom.id == symptom_data.symptom_id).first()
    )
    if not symptom:
        raise HTTPException(status_code=404, detail="증상을 찾을 수 없습니다")

    # 기존 연결 확인
    existing = (
        db.query(DiseaseSymptom)
        .filter(
            DiseaseSymptom.disease_id == disease_id,
            DiseaseSymptom.symptom_id == symptom_data.symptom_id,
        )
        .first()
    )

    if existing:
        # 업데이트
        existing.probability = symptom_data.probability
        existing.is_primary = symptom_data.is_primary
        db.commit()
        db.refresh(existing)
        return {
            "message": "질병-증상 연결이 업데이트되었습니다",
            "disease_symptom_id": existing.id,
        }
    else:
        # 새로 생성
        new_ds = DiseaseSymptom(
            disease_id=disease_id,
            symptom_id=symptom_data.symptom_id,
            probability=symptom_data.probability,
            is_primary=symptom_data.is_primary,
        )
        db.add(new_ds)
        db.commit()
        db.refresh(new_ds)
        return {
            "message": "질병-증상 연결이 생성되었습니다",
            "disease_symptom_id": new_ds.id,
        }


@router.delete("/{disease_id}/symptoms/{symptom_id}")
def remove_disease_symptom(disease_id: int, symptom_id: int, db: Session = Depends(get_db)):
    """질병-증상 연결 해제"""
    # 연결 확인
    disease_symptom = (
        db.query(DiseaseSymptom)
        .filter(
            DiseaseSymptom.disease_id == disease_id,
            DiseaseSymptom.symptom_id == symptom_id,
        )
        .first()
    )

    if not disease_symptom:
        raise HTTPException(status_code=404, detail="해당 질병-증상 연결을 찾을 수 없습니다")

    db.delete(disease_symptom)
    db.commit()
    return {"message": "질병-증상 연결이 성공적으로 해제되었습니다"}


@router.put("/{disease_id}/symptoms/bulk")
def bulk_update_disease_symptoms(
    disease_id: int, bulk_data: DiseaseSymptomsBulkUpdate, db: Session = Depends(get_db)
):
    """여러 증상을 한번에 업데이트 (기존 연결은 모두 삭제 후 새로 생성)"""
    # 질병 존재 확인
    disease = db.query(Disease).filter(Disease.id == disease_id).first()
    if not disease:
        raise HTTPException(status_code=404, detail="질병을 찾을 수 없습니다")

    # 모든 증상 ID 검증
    symptom_ids = [s.symptom_id for s in bulk_data.symptoms]
    existing_symptoms = db.query(Symptom).filter(Symptom.id.in_(symptom_ids)).all()
    existing_symptom_ids = {s.id for s in existing_symptoms}

    missing_ids = set(symptom_ids) - existing_symptom_ids
    if missing_ids:
        raise HTTPException(
            status_code=404, detail=f"존재하지 않는 증상 ID: {missing_ids}"
        )

    # 기존 연결 모두 삭제
    db.query(DiseaseSymptom).filter(DiseaseSymptom.disease_id == disease_id).delete()

    # 새 연결 생성
    for symptom_data in bulk_data.symptoms:
        new_ds = DiseaseSymptom(
            disease_id=disease_id,
            symptom_id=symptom_data.symptom_id,
            probability=symptom_data.probability,
            is_primary=symptom_data.is_primary,
        )
        db.add(new_ds)

    db.commit()
    return {
        "message": f"{len(bulk_data.symptoms)}개의 증상이 질병에 연결되었습니다",
        "disease_id": disease_id,
    }
