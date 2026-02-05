'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSymptoms, Symptom } from '@/lib/api';


// 증상을 카테고리별로 그룹화하는 함수
function groupSymptomsByCategory(symptoms: Symptom[]): Record<string, Symptom[]> {
  const grouped: Record<string, Symptom[]> = {
    "전신 증상": [],
    "호흡기 증상": [],
    "소화기 증상": [],
    "피부 증상": [],
    "신경계 증상": [],
    "기타": [],
  };

  symptoms.forEach((symptom) => {
    const name = symptom.name.toLowerCase();

    if (name.includes('발열') || name.includes('오한') || name.includes('피로') || name.includes('권태감')) {
      grouped["전신 증상"].push(symptom);
    } else if (name.includes('기침') || name.includes('콧물') || name.includes('코막힘') || name.includes('인후통') || name.includes('호흡')) {
      grouped["호흡기 증상"].push(symptom);
    } else if (name.includes('복통') || name.includes('설사') || name.includes('구토') || name.includes('메스꺼움') || name.includes('소화')) {
      grouped["소화기 증상"].push(symptom);
    } else if (name.includes('발진') || name.includes('가려움') || name.includes('피부') || name.includes('두드러기')) {
      grouped["피부 증상"].push(symptom);
    } else if (name.includes('두통') || name.includes('어지러움') || name.includes('경련') || name.includes('마비')) {
      grouped["신경계 증상"].push(symptom);
    } else {
      grouped["기타"].push(symptom);
    }
  });

  // 빈 카테고리 제거
  return Object.fromEntries(
    Object.entries(grouped).filter(([_, symptoms]) => symptoms.length > 0)
  );
}

export default function PredictPage() {
  const router = useRouter();

  // State
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [selectedSymptomIds, setSelectedSymptomIds] = useState<number[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 증상 목록 로드
  useEffect(() => {
    loadSymptoms();
  }, []);

  const loadSymptoms = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSymptoms();
      setSymptoms(data);

      // 초기에 모든 카테고리 펼치기
      const categories = Object.keys(groupSymptomsByCategory(data));
      const expanded: Record<string, boolean> = {};
      categories.forEach((cat) => {
        expanded[cat] = true;
      });
      setExpandedCategories(expanded);
    } catch (err) {
      setError(err instanceof Error ? err.message : '증상 목록 로드 실패');
    } finally {
      setLoading(false);
    }
  };

  // 증상 선택/해제 토글
  const toggleSymptom = (symptomId: number) => {
    setSelectedSymptomIds((prev) =>
      prev.includes(symptomId)
        ? prev.filter((id) => id !== symptomId)
        : [...prev, symptomId]
    );
  };

  // 카테고리 펼치기/접기 토글
  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // 질병 예측 실행
  const handlePredict = () => {
    if (selectedSymptomIds.length === 0) {
      setError('최소 1개 이상의 증상을 선택해주세요');
      return;
    }

    // 결과 페이지로 이동
    router.push(`/result?symptoms=${selectedSymptomIds.join(',')}`);
  };

  // 초기화
  const handleReset = () => {
    setSelectedSymptomIds([]);
    setError(null);
  };

  // 로딩 중
  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </main>
    );
  }

  const groupedSymptoms = groupSymptomsByCategory(symptoms);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-5xl font-bold text-gray-800 mb-3">질병 예측 시스템</h1>
          <p className="text-lg text-gray-600">증상을 선택하면 가능성 있는 질병을 예측합니다</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* 왼쪽: 증상 선택 (2/5) */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">증상 선택</h2>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                {selectedSymptomIds.length}개 선택
              </span>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
                {error}
              </div>
            )}

            {/* 카테고리별 증상 목록 */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto mb-4 pr-2">
              {Object.entries(groupedSymptoms).map(([category, categorySymptoms]) => (
                <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* 카테고리 헤더 */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">{category}</span>
                      <span className="text-xs text-gray-500">
                        ({categorySymptoms.filter((s) => selectedSymptomIds.includes(s.id)).length}/
                        {categorySymptoms.length})
                      </span>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-600 transition-transform ${
                        expandedCategories[category] ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* 카테고리 증상 목록 */}
                  {expandedCategories[category] && (
                    <div className="p-2 space-y-1">
                      {categorySymptoms.map((symptom) => (
                        <label
                          key={symptom.id}
                          className={`flex items-center p-2 rounded-lg cursor-pointer transition ${
                            selectedSymptomIds.includes(symptom.id)
                              ? 'bg-indigo-50 border border-indigo-300'
                              : 'hover:bg-gray-50 border border-transparent'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedSymptomIds.includes(symptom.id)}
                            onChange={() => toggleSymptom(symptom.id)}
                            className="w-4 h-4 text-indigo-600 rounded mr-2"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-800">{symptom.name}</div>
                            {symptom.description && (
                              <div className="text-xs text-gray-500">{symptom.description}</div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={handlePredict}
                disabled={selectedSymptomIds.length === 0}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition shadow-md hover:shadow-lg"
              >
                진단하기
              </button>
              <button
                onClick={handleReset}
                className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                초기화
              </button>
            </div>
          </div>

          {/* 오른쪽: 안내 메시지 (3/5) */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center animate-slide-up">
              <svg
                className="mx-auto h-24 w-24 mb-6 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              <p className="text-xl text-gray-400">증상을 선택하고 진단 버튼을 눌러주세요</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
