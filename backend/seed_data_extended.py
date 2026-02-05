"""
질병 예측 시스템 대량 데이터 생성 스크립트

목표:
- 증상: 50개 이상
- 질병: 100개 이상
- 각 질병마다 5-10개의 증상 연결 (확률 포함)
"""
import sys
from pathlib import Path

# 프로젝트 루트를 sys.path에 추가
sys.path.insert(0, str(Path(__file__).parent))

from app.database import engine, SessionLocal, Base
from app.models.disease import Disease
from app.models.symptom import Symptom
from app.models.disease_symptom import DiseaseSymptom


def clear_existing_data(db):
    """기존 데이터 삭제"""
    print("[1/3] 기존 데이터 삭제 중...")
    db.query(DiseaseSymptom).delete()
    db.query(Disease).delete()
    db.query(Symptom).delete()
    db.commit()
    print(">> 기존 데이터 삭제 완료")


def create_symptoms(db):
    """증상 50개 이상 생성"""
    print("\n[2/3] 증상 데이터 생성 중...")

    symptoms_data = [
        # 호흡기 증상 (11개)
        {"name": "고열", "description": "38도 이상의 체온"},
        {"name": "미열", "description": "37.5-38도의 약간 높은 체온"},
        {"name": "기침", "description": "마른기침 또는 가래를 동반한 기침"},
        {"name": "콧물", "description": "코에서 분비물이 흐름"},
        {"name": "가래", "description": "기침 시 나오는 점액성 분비물"},
        {"name": "인후통", "description": "목이 아프고 따가운 증상"},
        {"name": "코막힘", "description": "코가 막혀 호흡이 어려움"},
        {"name": "재채기", "description": "갑작스럽게 나오는 재채기"},
        {"name": "호흡곤란", "description": "숨쉬기가 힘들거나 가빠짐"},
        {"name": "천명음", "description": "숨쉴 때 쌕쌕거리는 소리"},
        {"name": "객혈", "description": "기침 시 피가 섞여 나옴"},

        # 소화기 증상 (10개)
        {"name": "복통", "description": "배가 아픔"},
        {"name": "설사", "description": "묽은 변을 자주 봄"},
        {"name": "구토", "description": "음식물을 토함"},
        {"name": "메스꺼움", "description": "속이 울렁거리고 토할 것 같음"},
        {"name": "식욕부진", "description": "음식을 먹고 싶지 않음"},
        {"name": "변비", "description": "배변이 어렵고 딱딱함"},
        {"name": "혈변", "description": "변에 피가 섞여 나옴"},
        {"name": "복부팽만", "description": "배가 부풀어 오름"},
        {"name": "소화불량", "description": "음식 소화가 잘 안됨"},
        {"name": "속쓰림", "description": "가슴이 타는 듯한 느낌"},

        # 피부/외관 증상 (10개)
        {"name": "발진", "description": "피부에 붉은 반점이나 돌기"},
        {"name": "가려움", "description": "피부가 간지럽고 긁고 싶음"},
        {"name": "얼굴빨개짐", "description": "얼굴이 붉어짐"},
        {"name": "황달", "description": "피부와 눈이 노랗게 변함"},
        {"name": "부종", "description": "몸이 붓고 부풀어 오름"},
        {"name": "멍", "description": "피부에 멍이 잘 듦"},
        {"name": "두드러기", "description": "피부에 부풀어 오르고 가려운 반점"},
        {"name": "물집", "description": "피부에 물집이 생김"},
        {"name": "건조함", "description": "피부가 건조하고 갈라짐"},
        {"name": "탈모", "description": "머리카락이 빠짐"},

        # 신경계 증상 (9개)
        {"name": "두통", "description": "머리가 아픔"},
        {"name": "어지러움", "description": "몸이 흔들리고 균형을 잡기 어려움"},
        {"name": "현기증", "description": "주변이 빙글빙글 도는 느낌"},
        {"name": "의식저하", "description": "의식이 흐려지고 정신이 명료하지 않음"},
        {"name": "경련", "description": "근육이 심하게 떨리고 수축함"},
        {"name": "마비", "description": "몸의 일부가 움직이지 않음"},
        {"name": "손발저림", "description": "손발이 저리고 감각이 둔함"},
        {"name": "감각이상", "description": "촉각, 통각 등의 감각이 비정상"},
        {"name": "통증", "description": "신체 일부에 아픔이나 불편감"},

        # 근골격계 증상 (6개)
        {"name": "근육통", "description": "근육이 아프고 쑤심"},
        {"name": "관절통", "description": "관절이 아프고 뻣뻣함"},
        {"name": "요통", "description": "허리가 아픔"},
        {"name": "목통증", "description": "목이 아프고 움직이기 어려움"},
        {"name": "뻣뻣함", "description": "몸이 뻣뻣하고 움직이기 불편함"},
        {"name": "운동제한", "description": "특정 부위의 움직임이 제한됨"},

        # 전신 증상 (7개)
        {"name": "피로감", "description": "몸이 피곤하고 무거움"},
        {"name": "오한", "description": "추위를 느끼고 몸이 떨림"},
        {"name": "발열", "description": "체온이 올라감"},
        {"name": "체중감소", "description": "의도하지 않은 체중 감소"},
        {"name": "식은땀", "description": "갑자기 땀이 남"},
        {"name": "무기력", "description": "기력이 없고 의욕이 없음"},
        {"name": "체중증가", "description": "의도하지 않은 체중 증가"},

        # 감각기관 증상 (9개)
        {"name": "눈충혈", "description": "눈이 빨갛게 충혈됨"},
        {"name": "눈물", "description": "눈물이 과도하게 남"},
        {"name": "귀통증", "description": "귀가 아픔"},
        {"name": "청력저하", "description": "소리가 잘 들리지 않음"},
        {"name": "이명", "description": "귀에서 윙윙거리는 소리"},
        {"name": "코피", "description": "코에서 피가 남"},
        {"name": "구내염", "description": "입안이 헐고 아픔"},
        {"name": "미각이상", "description": "맛을 느끼지 못하거나 이상하게 느낌"},
        {"name": "후각상실", "description": "냄새를 맡지 못함"},

        # 심혈관 증상 (4개)
        {"name": "가슴통증", "description": "가슴이 아프거나 답답함"},
        {"name": "두근거림", "description": "심장이 빠르게 뜀"},
        {"name": "혈압상승", "description": "혈압이 높아짐"},
        {"name": "심계항진", "description": "심장 박동을 강하게 느낌"},

        # 비뇨기 증상 (5개)
        {"name": "빈뇨", "description": "소변을 자주 봄"},
        {"name": "배뇨통", "description": "소변 볼 때 통증"},
        {"name": "혈뇨", "description": "소변에 피가 섞임"},
        {"name": "야뇨증", "description": "밤에 소변을 자주 봄"},
        {"name": "잔뇨감", "description": "소변을 봐도 개운하지 않음"},

        # 정신 증상 (5개)
        {"name": "불안", "description": "불안하고 초조함"},
        {"name": "우울", "description": "우울하고 무기력함"},
        {"name": "불면증", "description": "잠을 잘 수 없음"},
        {"name": "집중력저하", "description": "집중이 잘 안됨"},
        {"name": "기억력저하", "description": "기억력이 떨어짐"},
    ]

    symptoms = []
    for data in symptoms_data:
        symptom = Symptom(**data)
        symptoms.append(symptom)

    db.bulk_save_objects(symptoms)
    db.commit()

    print(f">> 증상 {len(symptoms_data)}개 생성 완료")

    # 생성된 증상을 딕셔너리로 반환 (이름 -> ID 매핑)
    db.expire_all()  # 캐시 갱신
    symptom_map = {s.name: s.id for s in db.query(Symptom).all()}
    return symptom_map


def create_diseases_and_relations(db, symptom_map):
    """질병 100개 이상 생성 및 증상 연결"""
    print("\n[3/3] 질병 및 증상 관계 데이터 생성 중...")

    diseases_data = [
        # 호흡기 질환 (15개)
        {
            "name": "감기",
            "description": "다양한 바이러스에 의한 상기도 감염",
            "category": "호흡기질환",
            "symptoms": [
                {"name": "콧물", "probability": 0.9, "is_primary": True},
                {"name": "재채기", "probability": 0.85, "is_primary": True},
                {"name": "인후통", "probability": 0.75, "is_primary": True},
                {"name": "기침", "probability": 0.7, "is_primary": False},
                {"name": "미열", "probability": 0.6, "is_primary": False},
                {"name": "두통", "probability": 0.5, "is_primary": False},
                {"name": "피로감", "probability": 0.5, "is_primary": False},
            ]
        },
        {
            "name": "독감",
            "description": "인플루엔자 바이러스에 의한 급성 호흡기 감염",
            "category": "호흡기질환",
            "symptoms": [
                {"name": "고열", "probability": 0.95, "is_primary": True},
                {"name": "근육통", "probability": 0.9, "is_primary": True},
                {"name": "오한", "probability": 0.85, "is_primary": True},
                {"name": "피로감", "probability": 0.8, "is_primary": False},
                {"name": "두통", "probability": 0.75, "is_primary": False},
                {"name": "기침", "probability": 0.7, "is_primary": False},
                {"name": "인후통", "probability": 0.6, "is_primary": False},
            ]
        },
        {
            "name": "코로나19",
            "description": "SARS-CoV-2 바이러스에 의한 감염병",
            "category": "호흡기질환",
            "symptoms": [
                {"name": "발열", "probability": 0.88, "is_primary": True},
                {"name": "기침", "probability": 0.85, "is_primary": True},
                {"name": "피로감", "probability": 0.8, "is_primary": True},
                {"name": "후각상실", "probability": 0.7, "is_primary": True},
                {"name": "미각이상", "probability": 0.65, "is_primary": False},
                {"name": "호흡곤란", "probability": 0.6, "is_primary": False},
                {"name": "근육통", "probability": 0.55, "is_primary": False},
                {"name": "두통", "probability": 0.5, "is_primary": False},
            ]
        },
        {
            "name": "폐렴",
            "description": "폐 조직의 염증성 질환",
            "category": "호흡기질환",
            "symptoms": [
                {"name": "고열", "probability": 0.9, "is_primary": True},
                {"name": "기침", "probability": 0.85, "is_primary": True},
                {"name": "가래", "probability": 0.8, "is_primary": True},
                {"name": "호흡곤란", "probability": 0.75, "is_primary": True},
                {"name": "가슴통증", "probability": 0.65, "is_primary": False},
                {"name": "피로감", "probability": 0.6, "is_primary": False},
                {"name": "오한", "probability": 0.55, "is_primary": False},
            ]
        },
        {
            "name": "천식",
            "description": "기도의 만성 염증성 질환",
            "category": "호흡기질환",
            "symptoms": [
                {"name": "호흡곤란", "probability": 0.95, "is_primary": True},
                {"name": "천명음", "probability": 0.9, "is_primary": True},
                {"name": "기침", "probability": 0.8, "is_primary": True},
                {"name": "가슴통증", "probability": 0.6, "is_primary": False},
                {"name": "피로감", "probability": 0.5, "is_primary": False},
            ]
        },
        {
            "name": "급성기관지염",
            "description": "기관지의 급성 염증",
            "category": "호흡기질환",
            "symptoms": [
                {"name": "기침", "probability": 0.95, "is_primary": True},
                {"name": "가래", "probability": 0.85, "is_primary": True},
                {"name": "인후통", "probability": 0.7, "is_primary": True},
                {"name": "미열", "probability": 0.6, "is_primary": False},
                {"name": "피로감", "probability": 0.55, "is_primary": False},
                {"name": "가슴통증", "probability": 0.4, "is_primary": False},
            ]
        },
        {
            "name": "만성기관지염",
            "description": "기관지의 만성 염증",
            "category": "호흡기질환",
            "symptoms": [
                {"name": "기침", "probability": 0.9, "is_primary": True},
                {"name": "가래", "probability": 0.85, "is_primary": True},
                {"name": "호흡곤란", "probability": 0.7, "is_primary": True},
                {"name": "천명음", "probability": 0.6, "is_primary": False},
                {"name": "피로감", "probability": 0.55, "is_primary": False},
            ]
        },
        {
            "name": "후두염",
            "description": "후두의 염증",
            "category": "호흡기질환",
            "symptoms": [
                {"name": "인후통", "probability": 0.9, "is_primary": True},
                {"name": "기침", "probability": 0.8, "is_primary": True},
                {"name": "미열", "probability": 0.6, "is_primary": False},
                {"name": "두통", "probability": 0.5, "is_primary": False},
                {"name": "피로감", "probability": 0.45, "is_primary": False},
            ]
        },
        {
            "name": "편도염",
            "description": "편도의 염증",
            "category": "호흡기질환",
            "symptoms": [
                {"name": "인후통", "probability": 0.95, "is_primary": True},
                {"name": "고열", "probability": 0.85, "is_primary": True},
                {"name": "두통", "probability": 0.7, "is_primary": False},
                {"name": "피로감", "probability": 0.65, "is_primary": False},
                {"name": "근육통", "probability": 0.5, "is_primary": False},
            ]
        },
        {
            "name": "인두염",
            "description": "인두의 염증",
            "category": "호흡기질환",
            "symptoms": [
                {"name": "인후통", "probability": 0.9, "is_primary": True},
                {"name": "기침", "probability": 0.7, "is_primary": True},
                {"name": "미열", "probability": 0.6, "is_primary": False},
                {"name": "두통", "probability": 0.5, "is_primary": False},
                {"name": "피로감", "probability": 0.45, "is_primary": False},
            ]
        },
        {
            "name": "부비동염",
            "description": "부비동의 염증 (축농증)",
            "category": "호흡기질환",
            "symptoms": [
                {"name": "코막힘", "probability": 0.9, "is_primary": True},
                {"name": "콧물", "probability": 0.85, "is_primary": True},
                {"name": "두통", "probability": 0.8, "is_primary": True},
                {"name": "얼굴빨개짐", "probability": 0.6, "is_primary": False},
                {"name": "미열", "probability": 0.5, "is_primary": False},
                {"name": "피로감", "probability": 0.45, "is_primary": False},
            ]
        },
        {
            "name": "비염",
            "description": "코 점막의 염증",
            "category": "호흡기질환",
            "symptoms": [
                {"name": "콧물", "probability": 0.9, "is_primary": True},
                {"name": "코막힘", "probability": 0.85, "is_primary": True},
                {"name": "재채기", "probability": 0.8, "is_primary": True},
                {"name": "가려움", "probability": 0.6, "is_primary": False},
                {"name": "두통", "probability": 0.4, "is_primary": False},
            ]
        },
        {
            "name": "알레르기비염",
            "description": "알레르기에 의한 비염",
            "category": "호흡기질환",
            "symptoms": [
                {"name": "재채기", "probability": 0.95, "is_primary": True},
                {"name": "콧물", "probability": 0.9, "is_primary": True},
                {"name": "코막힘", "probability": 0.85, "is_primary": True},
                {"name": "가려움", "probability": 0.75, "is_primary": True},
                {"name": "눈물", "probability": 0.65, "is_primary": False},
                {"name": "눈충혈", "probability": 0.6, "is_primary": False},
            ]
        },
        {
            "name": "폐결핵",
            "description": "결핵균에 의한 폐 감염",
            "category": "호흡기질환",
            "symptoms": [
                {"name": "기침", "probability": 0.9, "is_primary": True},
                {"name": "가래", "probability": 0.85, "is_primary": True},
                {"name": "객혈", "probability": 0.7, "is_primary": True},
                {"name": "체중감소", "probability": 0.75, "is_primary": True},
                {"name": "미열", "probability": 0.7, "is_primary": False},
                {"name": "식은땀", "probability": 0.65, "is_primary": False},
                {"name": "피로감", "probability": 0.6, "is_primary": False},
            ]
        },
        {
            "name": "만성폐쇄성폐질환",
            "description": "만성적인 기도 폐쇄를 특징으로 하는 폐질환",
            "category": "호흡기질환",
            "symptoms": [
                {"name": "호흡곤란", "probability": 0.95, "is_primary": True},
                {"name": "기침", "probability": 0.85, "is_primary": True},
                {"name": "가래", "probability": 0.8, "is_primary": True},
                {"name": "천명음", "probability": 0.7, "is_primary": False},
                {"name": "피로감", "probability": 0.65, "is_primary": False},
                {"name": "체중감소", "probability": 0.5, "is_primary": False},
            ]
        },

        # 소화기 질환 (15개)
        {
            "name": "급성위염",
            "description": "위 점막의 급성 염증",
            "category": "소화기질환",
            "symptoms": [
                {"name": "복통", "probability": 0.9, "is_primary": True},
                {"name": "메스꺼움", "probability": 0.85, "is_primary": True},
                {"name": "구토", "probability": 0.75, "is_primary": True},
                {"name": "식욕부진", "probability": 0.7, "is_primary": False},
                {"name": "소화불량", "probability": 0.65, "is_primary": False},
            ]
        },
        {
            "name": "만성위염",
            "description": "위 점막의 만성 염증",
            "category": "소화기질환",
            "symptoms": [
                {"name": "복통", "probability": 0.8, "is_primary": True},
                {"name": "소화불량", "probability": 0.75, "is_primary": True},
                {"name": "속쓰림", "probability": 0.7, "is_primary": True},
                {"name": "식욕부진", "probability": 0.65, "is_primary": False},
                {"name": "메스꺼움", "probability": 0.6, "is_primary": False},
                {"name": "복부팽만", "probability": 0.55, "is_primary": False},
            ]
        },
        {
            "name": "위궤양",
            "description": "위 점막의 궤양",
            "category": "소화기질환",
            "symptoms": [
                {"name": "복통", "probability": 0.9, "is_primary": True},
                {"name": "속쓰림", "probability": 0.8, "is_primary": True},
                {"name": "메스꺼움", "probability": 0.7, "is_primary": False},
                {"name": "구토", "probability": 0.6, "is_primary": False},
                {"name": "식욕부진", "probability": 0.65, "is_primary": False},
                {"name": "체중감소", "probability": 0.5, "is_primary": False},
            ]
        },
        {
            "name": "십이지장궤양",
            "description": "십이지장의 궤양",
            "category": "소화기질환",
            "symptoms": [
                {"name": "복통", "probability": 0.9, "is_primary": True},
                {"name": "속쓰림", "probability": 0.75, "is_primary": True},
                {"name": "메스꺼움", "probability": 0.65, "is_primary": False},
                {"name": "소화불량", "probability": 0.6, "is_primary": False},
                {"name": "식욕부진", "probability": 0.55, "is_primary": False},
            ]
        },
        {
            "name": "역류성식도염",
            "description": "위산이 식도로 역류하여 생기는 염증",
            "category": "소화기질환",
            "symptoms": [
                {"name": "속쓰림", "probability": 0.95, "is_primary": True},
                {"name": "가슴통증", "probability": 0.75, "is_primary": True},
                {"name": "메스꺼움", "probability": 0.6, "is_primary": False},
                {"name": "기침", "probability": 0.5, "is_primary": False},
                {"name": "인후통", "probability": 0.45, "is_primary": False},
            ]
        },
        {
            "name": "과민성대장증후군",
            "description": "기능적 장 질환",
            "category": "소화기질환",
            "symptoms": [
                {"name": "복통", "probability": 0.9, "is_primary": True},
                {"name": "복부팽만", "probability": 0.85, "is_primary": True},
                {"name": "설사", "probability": 0.7, "is_primary": True},
                {"name": "변비", "probability": 0.65, "is_primary": False},
                {"name": "소화불량", "probability": 0.6, "is_primary": False},
            ]
        },
        {
            "name": "궤양성대장염",
            "description": "대장의 만성 염증성 질환",
            "category": "소화기질환",
            "symptoms": [
                {"name": "설사", "probability": 0.9, "is_primary": True},
                {"name": "혈변", "probability": 0.85, "is_primary": True},
                {"name": "복통", "probability": 0.8, "is_primary": True},
                {"name": "체중감소", "probability": 0.7, "is_primary": False},
                {"name": "피로감", "probability": 0.65, "is_primary": False},
                {"name": "발열", "probability": 0.5, "is_primary": False},
            ]
        },
        {
            "name": "크론병",
            "description": "소화관의 만성 염증성 질환",
            "category": "소화기질환",
            "symptoms": [
                {"name": "복통", "probability": 0.9, "is_primary": True},
                {"name": "설사", "probability": 0.85, "is_primary": True},
                {"name": "체중감소", "probability": 0.8, "is_primary": True},
                {"name": "피로감", "probability": 0.7, "is_primary": False},
                {"name": "발열", "probability": 0.6, "is_primary": False},
                {"name": "식욕부진", "probability": 0.65, "is_primary": False},
            ]
        },
        {
            "name": "급성장염",
            "description": "장의 급성 염증",
            "category": "소화기질환",
            "symptoms": [
                {"name": "설사", "probability": 0.95, "is_primary": True},
                {"name": "복통", "probability": 0.9, "is_primary": True},
                {"name": "구토", "probability": 0.8, "is_primary": True},
                {"name": "메스꺼움", "probability": 0.75, "is_primary": False},
                {"name": "발열", "probability": 0.6, "is_primary": False},
                {"name": "피로감", "probability": 0.55, "is_primary": False},
            ]
        },
        {
            "name": "식중독",
            "description": "오염된 음식으로 인한 질병",
            "category": "소화기질환",
            "symptoms": [
                {"name": "구토", "probability": 0.9, "is_primary": True},
                {"name": "설사", "probability": 0.9, "is_primary": True},
                {"name": "복통", "probability": 0.85, "is_primary": True},
                {"name": "메스꺼움", "probability": 0.8, "is_primary": False},
                {"name": "발열", "probability": 0.65, "is_primary": False},
                {"name": "오한", "probability": 0.5, "is_primary": False},
            ]
        },
        {
            "name": "변비",
            "description": "배변 횟수 감소 및 배변 곤란",
            "category": "소화기질환",
            "symptoms": [
                {"name": "변비", "probability": 0.95, "is_primary": True},
                {"name": "복통", "probability": 0.7, "is_primary": True},
                {"name": "복부팽만", "probability": 0.75, "is_primary": True},
                {"name": "소화불량", "probability": 0.5, "is_primary": False},
                {"name": "식욕부진", "probability": 0.45, "is_primary": False},
            ]
        },
        {
            "name": "설사",
            "description": "묽은 변을 자주 보는 증상",
            "category": "소화기질환",
            "symptoms": [
                {"name": "설사", "probability": 0.95, "is_primary": True},
                {"name": "복통", "probability": 0.75, "is_primary": True},
                {"name": "복부팽만", "probability": 0.6, "is_primary": False},
                {"name": "메스꺼움", "probability": 0.5, "is_primary": False},
                {"name": "피로감", "probability": 0.55, "is_primary": False},
            ]
        },
        {
            "name": "담석증",
            "description": "담낭이나 담도에 돌이 생기는 질환",
            "category": "소화기질환",
            "symptoms": [
                {"name": "복통", "probability": 0.9, "is_primary": True},
                {"name": "메스꺼움", "probability": 0.75, "is_primary": True},
                {"name": "구토", "probability": 0.7, "is_primary": False},
                {"name": "황달", "probability": 0.6, "is_primary": False},
                {"name": "발열", "probability": 0.5, "is_primary": False},
            ]
        },
        {
            "name": "췌장염",
            "description": "췌장의 염증",
            "category": "소화기질환",
            "symptoms": [
                {"name": "복통", "probability": 0.95, "is_primary": True},
                {"name": "메스꺼움", "probability": 0.85, "is_primary": True},
                {"name": "구토", "probability": 0.8, "is_primary": True},
                {"name": "발열", "probability": 0.7, "is_primary": False},
                {"name": "체중감소", "probability": 0.6, "is_primary": False},
                {"name": "설사", "probability": 0.5, "is_primary": False},
            ]
        },
        {
            "name": "간염",
            "description": "간의 염증",
            "category": "소화기질환",
            "symptoms": [
                {"name": "황달", "probability": 0.8, "is_primary": True},
                {"name": "피로감", "probability": 0.85, "is_primary": True},
                {"name": "복통", "probability": 0.7, "is_primary": True},
                {"name": "메스꺼움", "probability": 0.65, "is_primary": False},
                {"name": "식욕부진", "probability": 0.7, "is_primary": False},
                {"name": "발열", "probability": 0.55, "is_primary": False},
            ]
        },

        # 피부 질환 (12개)
        {
            "name": "아토피피부염",
            "description": "만성 염증성 피부 질환",
            "category": "피부질환",
            "symptoms": [
                {"name": "가려움", "probability": 0.95, "is_primary": True},
                {"name": "발진", "probability": 0.9, "is_primary": True},
                {"name": "건조함", "probability": 0.85, "is_primary": True},
                {"name": "피부가 붉어짐", "probability": 0.7, "is_primary": False},
                {"name": "불면증", "probability": 0.5, "is_primary": False},
            ]
        },
        {
            "name": "접촉성피부염",
            "description": "자극물질에 접촉하여 생기는 피부염",
            "category": "피부질환",
            "symptoms": [
                {"name": "발진", "probability": 0.9, "is_primary": True},
                {"name": "가려움", "probability": 0.85, "is_primary": True},
                {"name": "얼굴빨개짐", "probability": 0.75, "is_primary": True},
                {"name": "부종", "probability": 0.6, "is_primary": False},
                {"name": "물집", "probability": 0.5, "is_primary": False},
            ]
        },
        {
            "name": "두드러기",
            "description": "피부에 부풀어 오르는 발진",
            "category": "피부질환",
            "symptoms": [
                {"name": "두드러기", "probability": 0.95, "is_primary": True},
                {"name": "가려움", "probability": 0.9, "is_primary": True},
                {"name": "부종", "probability": 0.7, "is_primary": False},
                {"name": "얼굴빨개짐", "probability": 0.6, "is_primary": False},
            ]
        },
        {
            "name": "습진",
            "description": "피부의 염증성 질환",
            "category": "피부질환",
            "symptoms": [
                {"name": "발진", "probability": 0.9, "is_primary": True},
                {"name": "가려움", "probability": 0.85, "is_primary": True},
                {"name": "건조함", "probability": 0.75, "is_primary": True},
                {"name": "물집", "probability": 0.6, "is_primary": False},
                {"name": "피부가 붉어짐", "probability": 0.7, "is_primary": False},
            ]
        },
        {
            "name": "무좀",
            "description": "곰팡이에 의한 피부 감염",
            "category": "피부질환",
            "symptoms": [
                {"name": "가려움", "probability": 0.9, "is_primary": True},
                {"name": "발진", "probability": 0.8, "is_primary": True},
                {"name": "건조함", "probability": 0.7, "is_primary": False},
                {"name": "물집", "probability": 0.6, "is_primary": False},
            ]
        },
        {
            "name": "대상포진",
            "description": "수두바이러스 재활성화로 인한 질환",
            "category": "피부질환",
            "symptoms": [
                {"name": "발진", "probability": 0.95, "is_primary": True},
                {"name": "물집", "probability": 0.9, "is_primary": True},
                {"name": "가려움", "probability": 0.75, "is_primary": True},
                {"name": "통증", "probability": 0.85, "is_primary": True},
                {"name": "발열", "probability": 0.6, "is_primary": False},
                {"name": "피로감", "probability": 0.55, "is_primary": False},
            ]
        },
        {
            "name": "수두",
            "description": "수두바이러스에 의한 급성 감염",
            "category": "피부질환",
            "symptoms": [
                {"name": "발진", "probability": 0.95, "is_primary": True},
                {"name": "물집", "probability": 0.9, "is_primary": True},
                {"name": "가려움", "probability": 0.85, "is_primary": True},
                {"name": "발열", "probability": 0.8, "is_primary": False},
                {"name": "피로감", "probability": 0.6, "is_primary": False},
            ]
        },
        {
            "name": "여드름",
            "description": "피지선의 염증",
            "category": "피부질환",
            "symptoms": [
                {"name": "발진", "probability": 0.95, "is_primary": True},
                {"name": "얼굴빨개짐", "probability": 0.75, "is_primary": True},
                {"name": "가려움", "probability": 0.4, "is_primary": False},
            ]
        },
        {
            "name": "건선",
            "description": "만성 피부 질환",
            "category": "피부질환",
            "symptoms": [
                {"name": "발진", "probability": 0.9, "is_primary": True},
                {"name": "가려움", "probability": 0.8, "is_primary": True},
                {"name": "건조함", "probability": 0.85, "is_primary": True},
                {"name": "피부가 붉어짐", "probability": 0.75, "is_primary": False},
                {"name": "관절통", "probability": 0.5, "is_primary": False},
            ]
        },
        {
            "name": "백선",
            "description": "곰팡이에 의한 피부 감염",
            "category": "피부질환",
            "symptoms": [
                {"name": "발진", "probability": 0.9, "is_primary": True},
                {"name": "가려움", "probability": 0.85, "is_primary": True},
                {"name": "피부가 붉어짐", "probability": 0.7, "is_primary": False},
            ]
        },
        {
            "name": "농가진",
            "description": "세균에 의한 피부 감염",
            "category": "피부질환",
            "symptoms": [
                {"name": "발진", "probability": 0.9, "is_primary": True},
                {"name": "물집", "probability": 0.8, "is_primary": True},
                {"name": "가려움", "probability": 0.7, "is_primary": False},
                {"name": "발열", "probability": 0.5, "is_primary": False},
            ]
        },
        {
            "name": "지루성피부염",
            "description": "피지가 많은 부위의 피부염",
            "category": "피부질환",
            "symptoms": [
                {"name": "발진", "probability": 0.9, "is_primary": True},
                {"name": "가려움", "probability": 0.75, "is_primary": True},
                {"name": "건조함", "probability": 0.7, "is_primary": False},
                {"name": "얼굴빨개짐", "probability": 0.65, "is_primary": False},
            ]
        },

        # 감염성 질환 (10개)
        {
            "name": "결핵",
            "description": "결핵균에 의한 감염",
            "category": "감염성질환",
            "symptoms": [
                {"name": "기침", "probability": 0.9, "is_primary": True},
                {"name": "가래", "probability": 0.85, "is_primary": True},
                {"name": "체중감소", "probability": 0.8, "is_primary": True},
                {"name": "식은땀", "probability": 0.75, "is_primary": False},
                {"name": "미열", "probability": 0.7, "is_primary": False},
                {"name": "피로감", "probability": 0.65, "is_primary": False},
            ]
        },
        {
            "name": "수막염",
            "description": "뇌수막의 염증",
            "category": "감염성질환",
            "symptoms": [
                {"name": "두통", "probability": 0.95, "is_primary": True},
                {"name": "고열", "probability": 0.9, "is_primary": True},
                {"name": "목통증", "probability": 0.85, "is_primary": True},
                {"name": "구토", "probability": 0.75, "is_primary": False},
                {"name": "의식저하", "probability": 0.7, "is_primary": False},
                {"name": "경련", "probability": 0.6, "is_primary": False},
            ]
        },
        {
            "name": "요로감염",
            "description": "요로의 세균 감염",
            "category": "감염성질환",
            "symptoms": [
                {"name": "빈뇨", "probability": 0.9, "is_primary": True},
                {"name": "배뇨통", "probability": 0.85, "is_primary": True},
                {"name": "혈뇨", "probability": 0.7, "is_primary": False},
                {"name": "발열", "probability": 0.6, "is_primary": False},
                {"name": "복통", "probability": 0.55, "is_primary": False},
            ]
        },
        {
            "name": "방광염",
            "description": "방광의 염증",
            "category": "감염성질환",
            "symptoms": [
                {"name": "빈뇨", "probability": 0.95, "is_primary": True},
                {"name": "배뇨통", "probability": 0.9, "is_primary": True},
                {"name": "잔뇨감", "probability": 0.8, "is_primary": True},
                {"name": "혈뇨", "probability": 0.6, "is_primary": False},
                {"name": "복통", "probability": 0.5, "is_primary": False},
            ]
        },
        {
            "name": "중이염",
            "description": "중이의 염증",
            "category": "감염성질환",
            "symptoms": [
                {"name": "귀통증", "probability": 0.95, "is_primary": True},
                {"name": "발열", "probability": 0.8, "is_primary": True},
                {"name": "청력저하", "probability": 0.7, "is_primary": False},
                {"name": "두통", "probability": 0.6, "is_primary": False},
                {"name": "어지러움", "probability": 0.5, "is_primary": False},
            ]
        },
        {
            "name": "외이도염",
            "description": "외이도의 염증",
            "category": "감염성질환",
            "symptoms": [
                {"name": "귀통증", "probability": 0.9, "is_primary": True},
                {"name": "가려움", "probability": 0.75, "is_primary": True},
                {"name": "청력저하", "probability": 0.6, "is_primary": False},
            ]
        },
        {
            "name": "봉와직염",
            "description": "피부 및 피하조직의 세균 감염",
            "category": "감염성질환",
            "symptoms": [
                {"name": "발진", "probability": 0.9, "is_primary": True},
                {"name": "부종", "probability": 0.85, "is_primary": True},
                {"name": "얼굴빨개짐", "probability": 0.8, "is_primary": True},
                {"name": "발열", "probability": 0.75, "is_primary": False},
                {"name": "통증", "probability": 0.7, "is_primary": False},
            ]
        },
        {
            "name": "농양",
            "description": "국소적인 고름 축적",
            "category": "감염성질환",
            "symptoms": [
                {"name": "부종", "probability": 0.9, "is_primary": True},
                {"name": "통증", "probability": 0.85, "is_primary": True},
                {"name": "발열", "probability": 0.75, "is_primary": False},
                {"name": "얼굴빨개짐", "probability": 0.7, "is_primary": False},
            ]
        },
        {
            "name": "패혈증",
            "description": "전신적인 중증 감염",
            "category": "감염성질환",
            "symptoms": [
                {"name": "고열", "probability": 0.95, "is_primary": True},
                {"name": "오한", "probability": 0.9, "is_primary": True},
                {"name": "의식저하", "probability": 0.8, "is_primary": True},
                {"name": "호흡곤란", "probability": 0.75, "is_primary": False},
                {"name": "두근거림", "probability": 0.7, "is_primary": False},
                {"name": "피로감", "probability": 0.85, "is_primary": False},
            ]
        },

        # 심혈관 질환 (8개)
        {
            "name": "고혈압",
            "description": "혈압이 지속적으로 높은 상태",
            "category": "심혈관질환",
            "symptoms": [
                {"name": "두통", "probability": 0.7, "is_primary": True},
                {"name": "어지러움", "probability": 0.65, "is_primary": True},
                {"name": "두근거림", "probability": 0.6, "is_primary": False},
                {"name": "피로감", "probability": 0.55, "is_primary": False},
            ]
        },
        {
            "name": "저혈압",
            "description": "혈압이 지속적으로 낮은 상태",
            "category": "심혈관질환",
            "symptoms": [
                {"name": "어지러움", "probability": 0.85, "is_primary": True},
                {"name": "피로감", "probability": 0.8, "is_primary": True},
                {"name": "무기력", "probability": 0.7, "is_primary": False},
                {"name": "두통", "probability": 0.6, "is_primary": False},
            ]
        },
        {
            "name": "부정맥",
            "description": "심장 박동의 이상",
            "category": "심혈관질환",
            "symptoms": [
                {"name": "두근거림", "probability": 0.9, "is_primary": True},
                {"name": "심계항진", "probability": 0.85, "is_primary": True},
                {"name": "어지러움", "probability": 0.7, "is_primary": False},
                {"name": "호흡곤란", "probability": 0.65, "is_primary": False},
                {"name": "가슴통증", "probability": 0.6, "is_primary": False},
            ]
        },
        {
            "name": "협심증",
            "description": "심장 근육에 혈액 공급 부족",
            "category": "심혈관질환",
            "symptoms": [
                {"name": "가슴통증", "probability": 0.95, "is_primary": True},
                {"name": "호흡곤란", "probability": 0.75, "is_primary": True},
                {"name": "두근거림", "probability": 0.6, "is_primary": False},
                {"name": "어지러움", "probability": 0.55, "is_primary": False},
                {"name": "식은땀", "probability": 0.65, "is_primary": False},
            ]
        },
        {
            "name": "심근경색",
            "description": "심장 근육의 괴사",
            "category": "심혈관질환",
            "symptoms": [
                {"name": "가슴통증", "probability": 0.95, "is_primary": True},
                {"name": "호흡곤란", "probability": 0.85, "is_primary": True},
                {"name": "식은땀", "probability": 0.8, "is_primary": True},
                {"name": "메스꺼움", "probability": 0.7, "is_primary": False},
                {"name": "구토", "probability": 0.65, "is_primary": False},
                {"name": "어지러움", "probability": 0.75, "is_primary": False},
            ]
        },
        {
            "name": "심부전",
            "description": "심장의 펌프 기능 저하",
            "category": "심혈관질환",
            "symptoms": [
                {"name": "호흡곤란", "probability": 0.9, "is_primary": True},
                {"name": "피로감", "probability": 0.85, "is_primary": True},
                {"name": "부종", "probability": 0.8, "is_primary": True},
                {"name": "기침", "probability": 0.65, "is_primary": False},
                {"name": "두근거림", "probability": 0.6, "is_primary": False},
            ]
        },
        {
            "name": "판막질환",
            "description": "심장 판막의 이상",
            "category": "심혈관질환",
            "symptoms": [
                {"name": "호흡곤란", "probability": 0.8, "is_primary": True},
                {"name": "피로감", "probability": 0.75, "is_primary": True},
                {"name": "두근거림", "probability": 0.7, "is_primary": False},
                {"name": "어지러움", "probability": 0.6, "is_primary": False},
                {"name": "가슴통증", "probability": 0.55, "is_primary": False},
            ]
        },
        {
            "name": "정맥류",
            "description": "정맥이 비정상적으로 확장됨",
            "category": "심혈관질환",
            "symptoms": [
                {"name": "부종", "probability": 0.85, "is_primary": True},
                {"name": "통증", "probability": 0.7, "is_primary": True},
                {"name": "피로감", "probability": 0.65, "is_primary": False},
                {"name": "가려움", "probability": 0.5, "is_primary": False},
            ]
        },

        # 내분비/대사 질환 (8개)
        {
            "name": "제1형당뇨병",
            "description": "인슐린 분비 부족으로 인한 당뇨병",
            "category": "내분비대사질환",
            "symptoms": [
                {"name": "빈뇨", "probability": 0.9, "is_primary": True},
                {"name": "체중감소", "probability": 0.85, "is_primary": True},
                {"name": "피로감", "probability": 0.8, "is_primary": True},
                {"name": "식욕부진", "probability": 0.7, "is_primary": False},
                {"name": "어지러움", "probability": 0.6, "is_primary": False},
            ]
        },
        {
            "name": "제2형당뇨병",
            "description": "인슐린 저항성으로 인한 당뇨병",
            "category": "내분비대사질환",
            "symptoms": [
                {"name": "빈뇨", "probability": 0.85, "is_primary": True},
                {"name": "피로감", "probability": 0.8, "is_primary": True},
                {"name": "체중증가", "probability": 0.7, "is_primary": False},
                {"name": "어지러움", "probability": 0.6, "is_primary": False},
                {"name": "감각이상", "probability": 0.55, "is_primary": False},
            ]
        },
        {
            "name": "갑상선기능항진증",
            "description": "갑상선 호르몬 과다 분비",
            "category": "내분비대사질환",
            "symptoms": [
                {"name": "체중감소", "probability": 0.85, "is_primary": True},
                {"name": "두근거림", "probability": 0.8, "is_primary": True},
                {"name": "피로감", "probability": 0.75, "is_primary": True},
                {"name": "식은땀", "probability": 0.7, "is_primary": False},
                {"name": "불안", "probability": 0.65, "is_primary": False},
                {"name": "불면증", "probability": 0.6, "is_primary": False},
            ]
        },
        {
            "name": "갑상선기능저하증",
            "description": "갑상선 호르몬 분비 부족",
            "category": "내분비대사질환",
            "symptoms": [
                {"name": "피로감", "probability": 0.9, "is_primary": True},
                {"name": "체중증가", "probability": 0.8, "is_primary": True},
                {"name": "무기력", "probability": 0.75, "is_primary": True},
                {"name": "변비", "probability": 0.7, "is_primary": False},
                {"name": "우울", "probability": 0.65, "is_primary": False},
                {"name": "건조함", "probability": 0.6, "is_primary": False},
            ]
        },
        {
            "name": "고지혈증",
            "description": "혈중 지질 농도 증가",
            "category": "내분비대사질환",
            "symptoms": [
                {"name": "피로감", "probability": 0.6, "is_primary": True},
                {"name": "두통", "probability": 0.5, "is_primary": False},
                {"name": "어지러움", "probability": 0.45, "is_primary": False},
            ]
        },
        {
            "name": "통풍",
            "description": "요산 결정 침착으로 인한 관절염",
            "category": "내분비대사질환",
            "symptoms": [
                {"name": "관절통", "probability": 0.95, "is_primary": True},
                {"name": "부종", "probability": 0.9, "is_primary": True},
                {"name": "얼굴빨개짐", "probability": 0.8, "is_primary": True},
                {"name": "발열", "probability": 0.6, "is_primary": False},
            ]
        },
        {
            "name": "골다공증",
            "description": "뼈의 밀도 감소",
            "category": "내분비대사질환",
            "symptoms": [
                {"name": "요통", "probability": 0.7, "is_primary": True},
                {"name": "관절통", "probability": 0.65, "is_primary": True},
                {"name": "뻣뻣함", "probability": 0.6, "is_primary": False},
            ]
        },
        {
            "name": "비만",
            "description": "체지방 과다 축적",
            "category": "내분비대사질환",
            "symptoms": [
                {"name": "체중증가", "probability": 0.95, "is_primary": True},
                {"name": "피로감", "probability": 0.75, "is_primary": True},
                {"name": "호흡곤란", "probability": 0.65, "is_primary": False},
                {"name": "관절통", "probability": 0.6, "is_primary": False},
            ]
        },

        # 근골격계 질환 (10개)
        {
            "name": "골관절염",
            "description": "관절 연골의 퇴행성 변화",
            "category": "근골격계질환",
            "symptoms": [
                {"name": "관절통", "probability": 0.95, "is_primary": True},
                {"name": "뻣뻣함", "probability": 0.85, "is_primary": True},
                {"name": "운동제한", "probability": 0.8, "is_primary": True},
                {"name": "부종", "probability": 0.6, "is_primary": False},
            ]
        },
        {
            "name": "류마티스관절염",
            "description": "자가면역 질환으로 인한 관절염",
            "category": "근골격계질환",
            "symptoms": [
                {"name": "관절통", "probability": 0.95, "is_primary": True},
                {"name": "뻣뻣함", "probability": 0.9, "is_primary": True},
                {"name": "부종", "probability": 0.85, "is_primary": True},
                {"name": "피로감", "probability": 0.75, "is_primary": False},
                {"name": "미열", "probability": 0.6, "is_primary": False},
            ]
        },
        {
            "name": "요추추간판탈출증",
            "description": "허리디스크",
            "category": "근골격계질환",
            "symptoms": [
                {"name": "요통", "probability": 0.95, "is_primary": True},
                {"name": "손발저림", "probability": 0.85, "is_primary": True},
                {"name": "마비", "probability": 0.7, "is_primary": False},
                {"name": "근육통", "probability": 0.65, "is_primary": False},
            ]
        },
        {
            "name": "경추추간판탈출증",
            "description": "목디스크",
            "category": "근골격계질환",
            "symptoms": [
                {"name": "목통증", "probability": 0.95, "is_primary": True},
                {"name": "손발저림", "probability": 0.85, "is_primary": True},
                {"name": "두통", "probability": 0.7, "is_primary": False},
                {"name": "어지러움", "probability": 0.6, "is_primary": False},
            ]
        },
        {
            "name": "오십견",
            "description": "어깨 관절의 유착성 관절낭염",
            "category": "근골격계질환",
            "symptoms": [
                {"name": "관절통", "probability": 0.95, "is_primary": True},
                {"name": "운동제한", "probability": 0.9, "is_primary": True},
                {"name": "뻣뻣함", "probability": 0.85, "is_primary": True},
            ]
        },
        {
            "name": "근막통증증후군",
            "description": "근육의 통증 유발점",
            "category": "근골격계질환",
            "symptoms": [
                {"name": "근육통", "probability": 0.95, "is_primary": True},
                {"name": "뻣뻣함", "probability": 0.8, "is_primary": True},
                {"name": "두통", "probability": 0.6, "is_primary": False},
                {"name": "피로감", "probability": 0.55, "is_primary": False},
            ]
        },
        {
            "name": "건염",
            "description": "힘줄의 염증",
            "category": "근골격계질환",
            "symptoms": [
                {"name": "관절통", "probability": 0.9, "is_primary": True},
                {"name": "부종", "probability": 0.75, "is_primary": True},
                {"name": "운동제한", "probability": 0.7, "is_primary": False},
            ]
        },
        {
            "name": "통풍성관절염",
            "description": "통풍으로 인한 관절염",
            "category": "근골격계질환",
            "symptoms": [
                {"name": "관절통", "probability": 0.95, "is_primary": True},
                {"name": "부종", "probability": 0.9, "is_primary": True},
                {"name": "얼굴빨개짐", "probability": 0.8, "is_primary": True},
                {"name": "발열", "probability": 0.65, "is_primary": False},
            ]
        },
        {
            "name": "섬유근통",
            "description": "전신 근육의 만성 통증",
            "category": "근골격계질환",
            "symptoms": [
                {"name": "근육통", "probability": 0.95, "is_primary": True},
                {"name": "피로감", "probability": 0.9, "is_primary": True},
                {"name": "불면증", "probability": 0.8, "is_primary": True},
                {"name": "두통", "probability": 0.7, "is_primary": False},
                {"name": "집중력저하", "probability": 0.65, "is_primary": False},
            ]
        },
        {
            "name": "척추측만증",
            "description": "척추의 측면 굽음",
            "category": "근골격계질환",
            "symptoms": [
                {"name": "요통", "probability": 0.85, "is_primary": True},
                {"name": "뻣뻣함", "probability": 0.7, "is_primary": True},
                {"name": "피로감", "probability": 0.6, "is_primary": False},
            ]
        },

        # 신경계 질환 (10개)
        {
            "name": "편두통",
            "description": "반복적인 심한 두통",
            "category": "신경계질환",
            "symptoms": [
                {"name": "두통", "probability": 0.95, "is_primary": True},
                {"name": "메스꺼움", "probability": 0.8, "is_primary": True},
                {"name": "구토", "probability": 0.7, "is_primary": False},
                {"name": "어지러움", "probability": 0.65, "is_primary": False},
                {"name": "감각이상", "probability": 0.5, "is_primary": False},
            ]
        },
        {
            "name": "긴장성두통",
            "description": "근육 긴장으로 인한 두통",
            "category": "신경계질환",
            "symptoms": [
                {"name": "두통", "probability": 0.95, "is_primary": True},
                {"name": "목통증", "probability": 0.75, "is_primary": True},
                {"name": "뻣뻣함", "probability": 0.7, "is_primary": False},
                {"name": "피로감", "probability": 0.6, "is_primary": False},
            ]
        },
        {
            "name": "군발두통",
            "description": "극심한 일측성 두통",
            "category": "신경계질환",
            "symptoms": [
                {"name": "두통", "probability": 0.95, "is_primary": True},
                {"name": "눈물", "probability": 0.85, "is_primary": True},
                {"name": "눈충혈", "probability": 0.8, "is_primary": True},
                {"name": "콧물", "probability": 0.7, "is_primary": False},
            ]
        },
        {
            "name": "어지럼증",
            "description": "평형 감각 이상",
            "category": "신경계질환",
            "symptoms": [
                {"name": "어지러움", "probability": 0.95, "is_primary": True},
                {"name": "현기증", "probability": 0.85, "is_primary": True},
                {"name": "메스꺼움", "probability": 0.7, "is_primary": False},
                {"name": "구토", "probability": 0.6, "is_primary": False},
            ]
        },
        {
            "name": "뇌졸중",
            "description": "뇌혈관의 폐색 또는 파열",
            "category": "신경계질환",
            "symptoms": [
                {"name": "마비", "probability": 0.9, "is_primary": True},
                {"name": "어지러움", "probability": 0.85, "is_primary": True},
                {"name": "두통", "probability": 0.75, "is_primary": True},
                {"name": "의식저하", "probability": 0.7, "is_primary": False},
                {"name": "감각이상", "probability": 0.75, "is_primary": False},
            ]
        },
        {
            "name": "파킨슨병",
            "description": "신경 퇴행성 질환",
            "category": "신경계질환",
            "symptoms": [
                {"name": "경련", "probability": 0.85, "is_primary": True},
                {"name": "뻣뻣함", "probability": 0.8, "is_primary": True},
                {"name": "운동제한", "probability": 0.75, "is_primary": True},
                {"name": "우울", "probability": 0.6, "is_primary": False},
                {"name": "불면증", "probability": 0.55, "is_primary": False},
            ]
        },
        {
            "name": "치매",
            "description": "인지 기능 저하",
            "category": "신경계질환",
            "symptoms": [
                {"name": "기억력저하", "probability": 0.95, "is_primary": True},
                {"name": "집중력저하", "probability": 0.85, "is_primary": True},
                {"name": "우울", "probability": 0.7, "is_primary": False},
                {"name": "불안", "probability": 0.65, "is_primary": False},
                {"name": "불면증", "probability": 0.6, "is_primary": False},
            ]
        },
        {
            "name": "말초신경병증",
            "description": "말초신경의 손상",
            "category": "신경계질환",
            "symptoms": [
                {"name": "손발저림", "probability": 0.9, "is_primary": True},
                {"name": "감각이상", "probability": 0.85, "is_primary": True},
                {"name": "근육통", "probability": 0.7, "is_primary": False},
                {"name": "마비", "probability": 0.6, "is_primary": False},
            ]
        },
        {
            "name": "안면신경마비",
            "description": "안면 근육의 마비",
            "category": "신경계질환",
            "symptoms": [
                {"name": "마비", "probability": 0.95, "is_primary": True},
                {"name": "감각이상", "probability": 0.75, "is_primary": True},
                {"name": "눈물", "probability": 0.6, "is_primary": False},
                {"name": "미각이상", "probability": 0.55, "is_primary": False},
            ]
        },
        {
            "name": "삼차신경통",
            "description": "삼차신경의 통증",
            "category": "신경계질환",
            "symptoms": [
                {"name": "두통", "probability": 0.95, "is_primary": True},
                {"name": "감각이상", "probability": 0.75, "is_primary": True},
                {"name": "통증", "probability": 0.9, "is_primary": True},
            ]
        },

        # 비뇨기 질환 (5개)
        {
            "name": "급성방광염",
            "description": "방광의 급성 염증",
            "category": "비뇨기질환",
            "symptoms": [
                {"name": "빈뇨", "probability": 0.95, "is_primary": True},
                {"name": "배뇨통", "probability": 0.9, "is_primary": True},
                {"name": "혈뇨", "probability": 0.7, "is_primary": False},
                {"name": "복통", "probability": 0.65, "is_primary": False},
            ]
        },
        {
            "name": "만성방광염",
            "description": "방광의 만성 염증",
            "category": "비뇨기질환",
            "symptoms": [
                {"name": "빈뇨", "probability": 0.9, "is_primary": True},
                {"name": "배뇨통", "probability": 0.8, "is_primary": True},
                {"name": "잔뇨감", "probability": 0.75, "is_primary": True},
                {"name": "복통", "probability": 0.6, "is_primary": False},
            ]
        },
        {
            "name": "요로결석",
            "description": "요로에 돌이 생기는 질환",
            "category": "비뇨기질환",
            "symptoms": [
                {"name": "복통", "probability": 0.95, "is_primary": True},
                {"name": "혈뇨", "probability": 0.85, "is_primary": True},
                {"name": "빈뇨", "probability": 0.7, "is_primary": False},
                {"name": "메스꺼움", "probability": 0.65, "is_primary": False},
                {"name": "구토", "probability": 0.6, "is_primary": False},
            ]
        },
        {
            "name": "전립선비대증",
            "description": "전립선의 비대",
            "category": "비뇨기질환",
            "symptoms": [
                {"name": "빈뇨", "probability": 0.9, "is_primary": True},
                {"name": "야뇨증", "probability": 0.85, "is_primary": True},
                {"name": "잔뇨감", "probability": 0.8, "is_primary": True},
                {"name": "배뇨통", "probability": 0.6, "is_primary": False},
            ]
        },
        {
            "name": "전립선염",
            "description": "전립선의 염증",
            "category": "비뇨기질환",
            "symptoms": [
                {"name": "배뇨통", "probability": 0.9, "is_primary": True},
                {"name": "빈뇨", "probability": 0.85, "is_primary": True},
                {"name": "복통", "probability": 0.7, "is_primary": False},
                {"name": "발열", "probability": 0.65, "is_primary": False},
            ]
        },

        # 안과 질환 (5개)
        {
            "name": "결막염",
            "description": "결막의 염증",
            "category": "안과질환",
            "symptoms": [
                {"name": "눈충혈", "probability": 0.95, "is_primary": True},
                {"name": "눈물", "probability": 0.85, "is_primary": True},
                {"name": "가려움", "probability": 0.75, "is_primary": True},
                {"name": "부종", "probability": 0.6, "is_primary": False},
            ]
        },
        {
            "name": "다래끼",
            "description": "눈꺼풀 가장자리의 염증",
            "category": "안과질환",
            "symptoms": [
                {"name": "부종", "probability": 0.9, "is_primary": True},
                {"name": "통증", "probability": 0.85, "is_primary": True},
                {"name": "눈충혈", "probability": 0.7, "is_primary": False},
            ]
        },
        {
            "name": "안구건조증",
            "description": "눈물 분비 부족",
            "category": "안과질환",
            "symptoms": [
                {"name": "건조함", "probability": 0.95, "is_primary": True},
                {"name": "가려움", "probability": 0.8, "is_primary": True},
                {"name": "눈충혈", "probability": 0.7, "is_primary": False},
                {"name": "피로감", "probability": 0.6, "is_primary": False},
            ]
        },
        {
            "name": "각막염",
            "description": "각막의 염증",
            "category": "안과질환",
            "symptoms": [
                {"name": "눈충혈", "probability": 0.9, "is_primary": True},
                {"name": "통증", "probability": 0.85, "is_primary": True},
                {"name": "눈물", "probability": 0.8, "is_primary": True},
                {"name": "감각이상", "probability": 0.6, "is_primary": False},
            ]
        },
        {
            "name": "녹내장",
            "description": "안압 상승으로 인한 시신경 손상",
            "category": "안과질환",
            "symptoms": [
                {"name": "두통", "probability": 0.8, "is_primary": True},
                {"name": "눈충혈", "probability": 0.7, "is_primary": True},
                {"name": "메스꺼움", "probability": 0.65, "is_primary": False},
                {"name": "구토", "probability": 0.6, "is_primary": False},
            ]
        },

        # 이비인후과 질환 (5개)
        {
            "name": "급성중이염",
            "description": "중이의 급성 염증",
            "category": "이비인후과질환",
            "symptoms": [
                {"name": "귀통증", "probability": 0.95, "is_primary": True},
                {"name": "발열", "probability": 0.85, "is_primary": True},
                {"name": "청력저하", "probability": 0.75, "is_primary": False},
                {"name": "두통", "probability": 0.6, "is_primary": False},
            ]
        },
        {
            "name": "만성중이염",
            "description": "중이의 만성 염증",
            "category": "이비인후과질환",
            "symptoms": [
                {"name": "청력저하", "probability": 0.9, "is_primary": True},
                {"name": "귀통증", "probability": 0.7, "is_primary": True},
                {"name": "이명", "probability": 0.65, "is_primary": False},
            ]
        },
        {
            "name": "메니에르병",
            "description": "내이의 질환",
            "category": "이비인후과질환",
            "symptoms": [
                {"name": "현기증", "probability": 0.95, "is_primary": True},
                {"name": "이명", "probability": 0.9, "is_primary": True},
                {"name": "청력저하", "probability": 0.85, "is_primary": True},
                {"name": "메스꺼움", "probability": 0.75, "is_primary": False},
                {"name": "구토", "probability": 0.7, "is_primary": False},
            ]
        },
        {
            "name": "이석증",
            "description": "내이의 이석 이탈",
            "category": "이비인후과질환",
            "symptoms": [
                {"name": "현기증", "probability": 0.95, "is_primary": True},
                {"name": "어지러움", "probability": 0.9, "is_primary": True},
                {"name": "메스꺼움", "probability": 0.75, "is_primary": False},
                {"name": "구토", "probability": 0.7, "is_primary": False},
            ]
        },

        # 정신과 질환 (5개)
        {
            "name": "우울증",
            "description": "지속적인 우울감과 무기력",
            "category": "정신과질환",
            "symptoms": [
                {"name": "우울", "probability": 0.95, "is_primary": True},
                {"name": "무기력", "probability": 0.9, "is_primary": True},
                {"name": "불면증", "probability": 0.8, "is_primary": True},
                {"name": "식욕부진", "probability": 0.75, "is_primary": False},
                {"name": "집중력저하", "probability": 0.7, "is_primary": False},
                {"name": "피로감", "probability": 0.85, "is_primary": False},
            ]
        },
        {
            "name": "불안장애",
            "description": "과도한 불안과 걱정",
            "category": "정신과질환",
            "symptoms": [
                {"name": "불안", "probability": 0.95, "is_primary": True},
                {"name": "두근거림", "probability": 0.8, "is_primary": True},
                {"name": "불면증", "probability": 0.75, "is_primary": True},
                {"name": "집중력저하", "probability": 0.7, "is_primary": False},
                {"name": "피로감", "probability": 0.65, "is_primary": False},
            ]
        },
        {
            "name": "공황장애",
            "description": "반복적인 공황발작",
            "category": "정신과질환",
            "symptoms": [
                {"name": "불안", "probability": 0.95, "is_primary": True},
                {"name": "두근거림", "probability": 0.9, "is_primary": True},
                {"name": "호흡곤란", "probability": 0.85, "is_primary": True},
                {"name": "어지러움", "probability": 0.8, "is_primary": False},
                {"name": "식은땀", "probability": 0.75, "is_primary": False},
            ]
        },
        {
            "name": "불면증",
            "description": "수면 장애",
            "category": "정신과질환",
            "symptoms": [
                {"name": "불면증", "probability": 0.95, "is_primary": True},
                {"name": "피로감", "probability": 0.9, "is_primary": True},
                {"name": "집중력저하", "probability": 0.8, "is_primary": True},
                {"name": "두통", "probability": 0.65, "is_primary": False},
                {"name": "우울", "probability": 0.6, "is_primary": False},
            ]
        },
        {
            "name": "강박장애",
            "description": "강박적 사고와 행동",
            "category": "정신과질환",
            "symptoms": [
                {"name": "불안", "probability": 0.9, "is_primary": True},
                {"name": "집중력저하", "probability": 0.75, "is_primary": True},
                {"name": "피로감", "probability": 0.7, "is_primary": False},
                {"name": "우울", "probability": 0.65, "is_primary": False},
                {"name": "불면증", "probability": 0.6, "is_primary": False},
            ]
        },

        # 기타 흔한 질환 (7개)
        {
            "name": "빈혈",
            "description": "혈중 헤모글로빈 감소",
            "category": "기타질환",
            "symptoms": [
                {"name": "피로감", "probability": 0.95, "is_primary": True},
                {"name": "어지러움", "probability": 0.85, "is_primary": True},
                {"name": "두근거림", "probability": 0.75, "is_primary": False},
                {"name": "호흡곤란", "probability": 0.65, "is_primary": False},
                {"name": "두통", "probability": 0.6, "is_primary": False},
            ]
        },
        {
            "name": "탈수",
            "description": "체액 부족",
            "category": "기타질환",
            "symptoms": [
                {"name": "어지러움", "probability": 0.85, "is_primary": True},
                {"name": "피로감", "probability": 0.8, "is_primary": True},
                {"name": "두통", "probability": 0.7, "is_primary": False},
                {"name": "메스꺼움", "probability": 0.6, "is_primary": False},
            ]
        },
        {
            "name": "열사병",
            "description": "고온 환경에서 체온 조절 실패",
            "category": "기타질환",
            "symptoms": [
                {"name": "고열", "probability": 0.95, "is_primary": True},
                {"name": "의식저하", "probability": 0.85, "is_primary": True},
                {"name": "두통", "probability": 0.75, "is_primary": False},
                {"name": "메스꺼움", "probability": 0.7, "is_primary": False},
                {"name": "구토", "probability": 0.65, "is_primary": False},
            ]
        },
        {
            "name": "저체온증",
            "description": "체온 저하",
            "category": "기타질환",
            "symptoms": [
                {"name": "오한", "probability": 0.95, "is_primary": True},
                {"name": "경련", "probability": 0.8, "is_primary": True},
                {"name": "의식저하", "probability": 0.75, "is_primary": False},
                {"name": "피로감", "probability": 0.7, "is_primary": False},
            ]
        },
        {
            "name": "알코올중독",
            "description": "알코올 과다 섭취",
            "category": "기타질환",
            "symptoms": [
                {"name": "메스꺼움", "probability": 0.9, "is_primary": True},
                {"name": "구토", "probability": 0.85, "is_primary": True},
                {"name": "두통", "probability": 0.8, "is_primary": True},
                {"name": "어지러움", "probability": 0.75, "is_primary": False},
                {"name": "의식저하", "probability": 0.6, "is_primary": False},
            ]
        },
        {
            "name": "편타손상",
            "description": "목의 급작스러운 손상",
            "category": "기타질환",
            "symptoms": [
                {"name": "목통증", "probability": 0.95, "is_primary": True},
                {"name": "두통", "probability": 0.8, "is_primary": True},
                {"name": "뻣뻣함", "probability": 0.75, "is_primary": False},
                {"name": "어지러움", "probability": 0.6, "is_primary": False},
            ]
        },
        {
            "name": "염좌",
            "description": "인대의 손상",
            "category": "기타질환",
            "symptoms": [
                {"name": "관절통", "probability": 0.95, "is_primary": True},
                {"name": "부종", "probability": 0.9, "is_primary": True},
                {"name": "멍", "probability": 0.75, "is_primary": False},
                {"name": "운동제한", "probability": 0.85, "is_primary": False},
            ]
        },
    ]

    # 질병 생성 및 관계 설정
    disease_relations = []

    for idx, disease_data in enumerate(diseases_data, 1):
        # 질병 생성
        disease = Disease(
            name=disease_data["name"],
            description=disease_data["description"],
            category=disease_data.get("category", "기타질환")
        )
        db.add(disease)
        db.flush()  # ID 할당

        # 증상 관계 설정
        for symptom_data in disease_data["symptoms"]:
            symptom_id = symptom_map.get(symptom_data["name"])
            if symptom_id:
                relation = DiseaseSymptom(
                    disease_id=disease.id,
                    symptom_id=symptom_id,
                    probability=symptom_data["probability"],
                    is_primary=symptom_data["is_primary"]
                )
                disease_relations.append(relation)

        # 진행 상황 출력
        if idx % 10 == 0:
            print(f"  진행: {idx}/{len(diseases_data)} 질병 처리 완료")

    # 관계 일괄 저장
    db.bulk_save_objects(disease_relations)
    db.commit()

    print(f">> 질병 {len(diseases_data)}개 및 증상 관계 {len(disease_relations)}개 생성 완료")


def main():
    """메인 실행 함수"""
    print("=" * 60)
    print("질병 예측 시스템 대량 데이터 생성 시작")
    print("=" * 60)

    # 기존 테이블 삭제 후 재생성 (스키마 변경 반영)
    print("\n[0/3] 기존 테이블 삭제 및 재생성 중...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print(">> 테이블 재생성 완료")

    # DB 세션 생성
    db = SessionLocal()

    try:
        # 1. 기존 데이터 삭제
        clear_existing_data(db)

        # 2. 증상 생성
        symptom_map = create_symptoms(db)

        # 3. 질병 및 증상 관계 생성
        create_diseases_and_relations(db, symptom_map)

        # 최종 통계
        print("\n" + "=" * 60)
        print("[완료] 생성 완료 통계")
        print("=" * 60)
        print(f">> 증상: {db.query(Symptom).count()}개")
        print(f">> 질병: {db.query(Disease).count()}개")
        print(f">> 질병-증상 관계: {db.query(DiseaseSymptom).count()}개")
        print("=" * 60)
        print("모든 데이터 생성이 완료되었습니다!")

    except Exception as e:
        print(f"\n[ERROR] 에러 발생: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
