// API 호출 함수

// 타입 정의
export interface Symptom {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
}

export interface Disease {
  id: number;
  name: string;
  description: string;
  category?: string;
  created_at?: string;
}

export interface MatchedSymptom {
  id: number;
  name: string;
  probability: number;
}

export interface DiseasePredictor {
  disease_id: number;
  disease_name: string;
  description: string;
  category?: string;
  probability: number;
  rank: number;
  matched_symptoms: MatchedSymptom[];
}

export interface PredictResponse {
  predictions: DiseasePredictor[];
  total_diseases_checked: number;
}

export interface DiseaseSymptomDetail {
  symptom_id: number;
  symptom_name: string;
  probability: number;
  is_primary: boolean;
}

export interface DiseaseSymptomResponse {
  disease_id: number;
  disease_name: string;
  symptoms: DiseaseSymptomDetail[];
}

export interface DiseaseSymptomUpdateItem {
  symptom_id: number;
  probability: number;
  is_primary: boolean;
}

// API 함수

/**
 * 모든 증상 목록 조회
 */
export async function getSymptoms(): Promise<Symptom[]> {
  const response = await fetch('/api/symptoms/');
  if (!response.ok) {
    throw new Error('증상 목록을 불러오는데 실패했습니다');
  }
  return response.json();
}

/**
 * 질병 예측 요청
 */
export async function predictDisease(symptomIds: number[]): Promise<PredictResponse> {
  const response = await fetch('/api/predict', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      symptom_ids: symptomIds,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || '질병 예측에 실패했습니다');
  }

  return response.json();
}

// ==================== 질병 CRUD ====================

/**
 * 모든 질병 목록 조회
 */
export async function getDiseases(): Promise<Disease[]> {
  const response = await fetch('/api/diseases/');
  if (!response.ok) {
    throw new Error('질병 목록을 불러오는데 실패했습니다');
  }
  return response.json();
}

/**
 * 특정 질병 조회
 */
export async function getDisease(id: number): Promise<Disease> {
  const response = await fetch(`/api/diseases/${id}`);
  if (!response.ok) {
    throw new Error('질병을 불러오는데 실패했습니다');
  }
  return response.json();
}

/**
 * 질병 생성
 */
export async function createDisease(data: {
  name: string;
  description: string;
}): Promise<Disease> {
  const response = await fetch('/api/diseases/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || '질병 생성에 실패했습니다');
  }

  return response.json();
}

/**
 * 질병 수정
 */
export async function updateDisease(
  id: number,
  data: { name?: string; description?: string }
): Promise<Disease> {
  const response = await fetch(`/api/diseases/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || '질병 수정에 실패했습니다');
  }

  return response.json();
}

/**
 * 질병 삭제
 */
export async function deleteDisease(id: number): Promise<void> {
  const response = await fetch(`/api/diseases/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || '질병 삭제에 실패했습니다');
  }
}

// ==================== 증상 CRUD ====================

/**
 * 특정 증상 조회
 */
export async function getSymptom(id: number): Promise<Symptom> {
  const response = await fetch(`/api/symptoms/${id}`);
  if (!response.ok) {
    throw new Error('증상을 불러오는데 실패했습니다');
  }
  return response.json();
}

/**
 * 증상 생성
 */
export async function createSymptom(data: {
  name: string;
  description?: string;
}): Promise<Symptom> {
  const response = await fetch('/api/symptoms/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || '증상 생성에 실패했습니다');
  }

  return response.json();
}

/**
 * 증상 수정
 */
export async function updateSymptom(
  id: number,
  data: { name?: string; description?: string }
): Promise<Symptom> {
  const response = await fetch(`/api/symptoms/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || '증상 수정에 실패했습니다');
  }

  return response.json();
}

/**
 * 증상 삭제
 */
export async function deleteSymptom(id: number): Promise<void> {
  const response = await fetch(`/api/symptoms/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || '증상 삭제에 실패했습니다');
  }
}

// ==================== 질병-증상 연결 ====================

/**
 * 질병의 증상 조회
 */
export async function getDiseaseSymptoms(diseaseId: number): Promise<DiseaseSymptomResponse> {
  const response = await fetch(`/api/diseases/${diseaseId}/symptoms`);
  if (!response.ok) {
    throw new Error('질병의 증상 목록을 불러오는데 실패했습니다');
  }
  return response.json();
}

/**
 * 질병의 증상 일괄 업데이트
 */
export async function updateDiseaseSymptomsBulk(
  diseaseId: number,
  symptoms: DiseaseSymptomUpdateItem[]
): Promise<any> {
  const response = await fetch(`/api/diseases/${diseaseId}/symptoms/bulk`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ symptoms }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || '증상 연결 업데이트에 실패했습니다');
  }

  return response.json();
}
