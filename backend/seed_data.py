"""
샘플 데이터 입력 스크립트
질병 예측 시스템을 테스트하기 위한 증상, 질병, 질병-증상 관계 데이터를 생성합니다.
"""
from app.database import SessionLocal, engine, Base
from app.models.symptom import Symptom
from app.models.disease import Disease
from app.models.disease_symptom import DiseaseSymptom


def create_sample_data():
    # 테이블 생성
    Base.metadata.create_all(bind=engine)

    # 세션 생성
    db = SessionLocal()

    try:
        # 기존 데이터 삭제 (중복 방지)
        print("기존 데이터 삭제 중...")
        db.query(DiseaseSymptom).delete()
        db.query(Disease).delete()
        db.query(Symptom).delete()
        db.commit()

        # 1. 증상 생성 (10개)
        print("\n증상 데이터 생성 중...")
        symptoms = [
            Symptom(name="고열", description="38도 이상의 고열"),
            Symptom(name="기침", description="지속적인 기침 증상"),
            Symptom(name="콧물", description="코에서 분비물이 나오는 증상"),
            Symptom(name="가래", description="기침과 함께 나오는 끈적한 분비물"),
            Symptom(name="두통", description="머리가 아픈 증상"),
            Symptom(name="근육통", description="근육이 당기거나 아픈 증상"),
            Symptom(name="인후통", description="목이 아프고 따끔거리는 증상"),
            Symptom(name="설사", description="묽은 변을 자주 보는 증상"),
            Symptom(name="구토", description="음식물을 토하는 증상"),
            Symptom(name="피로감", description="심한 피로와 무기력함"),
        ]

        db.add_all(symptoms)
        db.commit()

        # 증상 ID를 이름으로 매핑 (쉬운 참조를 위해)
        symptom_map = {s.name: s.id for s in symptoms}
        print(f"생성된 증상: {len(symptoms)}개")

        # 2. 질병 생성 (5개)
        print("\n질병 데이터 생성 중...")
        diseases = [
            Disease(
                name="독감",
                description="인플루엔자 바이러스에 의한 급성 호흡기 질환"
            ),
            Disease(
                name="코로나19",
                description="SARS-CoV-2 바이러스에 의한 감염병"
            ),
            Disease(
                name="감기",
                description="다양한 바이러스에 의한 상기도 감염"
            ),
            Disease(
                name="식중독",
                description="오염된 음식 섭취로 인한 급성 위장관 질환"
            ),
            Disease(
                name="편도염",
                description="편도선의 염증으로 인한 질환"
            ),
        ]

        db.add_all(diseases)
        db.commit()

        # 질병 ID를 이름으로 매핑
        disease_map = {d.name: d.id for d in diseases}
        print(f"생성된 질병: {len(diseases)}개")

        # 3. 질병-증상 관계 생성
        print("\n질병-증상 관계 데이터 생성 중...")
        disease_symptoms = [
            # 독감 (Influenza)
            DiseaseSymptom(disease_id=disease_map["독감"], symptom_id=symptom_map["고열"],
                          probability=0.9, is_primary=True),
            DiseaseSymptom(disease_id=disease_map["독감"], symptom_id=symptom_map["기침"],
                          probability=0.8, is_primary=True),
            DiseaseSymptom(disease_id=disease_map["독감"], symptom_id=symptom_map["근육통"],
                          probability=0.7, is_primary=False),
            DiseaseSymptom(disease_id=disease_map["독감"], symptom_id=symptom_map["피로감"],
                          probability=0.85, is_primary=False),
            DiseaseSymptom(disease_id=disease_map["독감"], symptom_id=symptom_map["두통"],
                          probability=0.6, is_primary=False),

            # 코로나19 (COVID-19)
            DiseaseSymptom(disease_id=disease_map["코로나19"], symptom_id=symptom_map["고열"],
                          probability=0.85, is_primary=True),
            DiseaseSymptom(disease_id=disease_map["코로나19"], symptom_id=symptom_map["기침"],
                          probability=0.75, is_primary=True),
            DiseaseSymptom(disease_id=disease_map["코로나19"], symptom_id=symptom_map["피로감"],
                          probability=0.8, is_primary=False),
            DiseaseSymptom(disease_id=disease_map["코로나19"], symptom_id=symptom_map["인후통"],
                          probability=0.6, is_primary=False),
            DiseaseSymptom(disease_id=disease_map["코로나19"], symptom_id=symptom_map["두통"],
                          probability=0.55, is_primary=False),

            # 감기 (Common Cold)
            DiseaseSymptom(disease_id=disease_map["감기"], symptom_id=symptom_map["콧물"],
                          probability=0.9, is_primary=True),
            DiseaseSymptom(disease_id=disease_map["감기"], symptom_id=symptom_map["기침"],
                          probability=0.7, is_primary=True),
            DiseaseSymptom(disease_id=disease_map["감기"], symptom_id=symptom_map["인후통"],
                          probability=0.65, is_primary=False),
            DiseaseSymptom(disease_id=disease_map["감기"], symptom_id=symptom_map["고열"],
                          probability=0.4, is_primary=False),
            DiseaseSymptom(disease_id=disease_map["감기"], symptom_id=symptom_map["두통"],
                          probability=0.5, is_primary=False),

            # 식중독 (Food Poisoning)
            DiseaseSymptom(disease_id=disease_map["식중독"], symptom_id=symptom_map["설사"],
                          probability=0.95, is_primary=True),
            DiseaseSymptom(disease_id=disease_map["식중독"], symptom_id=symptom_map["구토"],
                          probability=0.85, is_primary=True),
            DiseaseSymptom(disease_id=disease_map["식중독"], symptom_id=symptom_map["고열"],
                          probability=0.5, is_primary=False),
            DiseaseSymptom(disease_id=disease_map["식중독"], symptom_id=symptom_map["두통"],
                          probability=0.4, is_primary=False),

            # 편도염 (Tonsillitis)
            DiseaseSymptom(disease_id=disease_map["편도염"], symptom_id=symptom_map["인후통"],
                          probability=0.95, is_primary=True),
            DiseaseSymptom(disease_id=disease_map["편도염"], symptom_id=symptom_map["고열"],
                          probability=0.8, is_primary=True),
            DiseaseSymptom(disease_id=disease_map["편도염"], symptom_id=symptom_map["두통"],
                          probability=0.6, is_primary=False),
            DiseaseSymptom(disease_id=disease_map["편도염"], symptom_id=symptom_map["피로감"],
                          probability=0.7, is_primary=False),
        ]

        db.add_all(disease_symptoms)
        db.commit()

        print(f"생성된 질병-증상 관계: {len(disease_symptoms)}개")

        # 결과 요약 출력
        print("\n" + "="*60)
        print("샘플 데이터 생성 완료!")
        print("="*60)
        print(f"증상: {len(symptoms)}개")
        print(f"질병: {len(diseases)}개")
        print(f"질병-증상 관계: {len(disease_symptoms)}개")
        print("\n질병별 증상 개수:")
        for disease_name, disease_id in disease_map.items():
            count = len([ds for ds in disease_symptoms if ds.disease_id == disease_id])
            print(f"  - {disease_name}: {count}개 증상")
        print("="*60)

    except Exception as e:
        print(f"\n오류 발생: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("질병 예측 시스템 샘플 데이터 생성 시작...\n")
    create_sample_data()
    print("\n스크립트 실행 완료!")
