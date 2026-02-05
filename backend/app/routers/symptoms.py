from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Symptom
from app.schemas import SymptomCreate, SymptomUpdate, SymptomResponse

router = APIRouter(prefix="/api/symptoms", tags=["symptoms"])


@router.get("/", response_model=list[SymptomResponse])
def get_symptoms(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """모든 증상 목록 조회"""
    symptoms = db.query(Symptom).offset(skip).limit(limit).all()
    return symptoms


@router.get("/{symptom_id}", response_model=SymptomResponse)
def get_symptom(symptom_id: int, db: Session = Depends(get_db)):
    """특정 증상 조회"""
    symptom = db.query(Symptom).filter(Symptom.id == symptom_id).first()
    if not symptom:
        raise HTTPException(status_code=404, detail="증상을 찾을 수 없습니다")
    return symptom


@router.post("/", response_model=SymptomResponse, status_code=201)
def create_symptom(symptom: SymptomCreate, db: Session = Depends(get_db)):
    """새로운 증상 생성"""
    # 중복 체크
    existing = db.query(Symptom).filter(Symptom.name == symptom.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="이미 존재하는 증상 이름입니다")

    db_symptom = Symptom(**symptom.model_dump())
    db.add(db_symptom)
    db.commit()
    db.refresh(db_symptom)
    return db_symptom


@router.put("/{symptom_id}", response_model=SymptomResponse)
def update_symptom(symptom_id: int, symptom: SymptomUpdate, db: Session = Depends(get_db)):
    """증상 정보 수정"""
    db_symptom = db.query(Symptom).filter(Symptom.id == symptom_id).first()
    if not db_symptom:
        raise HTTPException(status_code=404, detail="증상을 찾을 수 없습니다")

    # 중복 체크 (이름 변경 시)
    if symptom.name and symptom.name != db_symptom.name:
        existing = db.query(Symptom).filter(Symptom.name == symptom.name).first()
        if existing:
            raise HTTPException(status_code=400, detail="이미 존재하는 증상 이름입니다")

    update_data = symptom.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_symptom, key, value)

    db.commit()
    db.refresh(db_symptom)
    return db_symptom


@router.delete("/{symptom_id}")
def delete_symptom(symptom_id: int, db: Session = Depends(get_db)):
    """증상 삭제"""
    symptom = db.query(Symptom).filter(Symptom.id == symptom_id).first()
    if not symptom:
        raise HTTPException(status_code=404, detail="증상을 찾을 수 없습니다")

    db.delete(symptom)
    db.commit()
    return {"message": "증상이 성공적으로 삭제되었습니다"}
