'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { predictDisease, DiseasePredictor } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// 카테고리별 색상 매핑
const categoryColors: Record<string, string> = {
  "호흡기질환": "#3B82F6",  // 파랑
  "소화기질환": "#10B981",  // 초록
  "피부질환": "#F59E0B",    // 주황
  "감염성질환": "#EF4444",  // 빨강
  "심혈관질환": "#8B5CF6",  // 보라
  "신경계질환": "#EC4899",  // 핑크
  "근골격계질환": "#06B6D4",// 시안
  "내분비질환": "#F97316",  // 진한 주황
  "비뇨기질환": "#14B8A6",  // 틸
  "안과질환": "#A855F7",    // 보라2
};

// 기본 색상 (카테고리가 없을 때)
const defaultColor = "#6B7280"; // 회색

export default function ResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const symptomIdsParam = searchParams.get('symptoms');

  const [predictions, setPredictions] = useState<DiseasePredictor[]>([]);
  const [totalDiseasesChecked, setTotalDiseasesChecked] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symptomIdsParam) {
      router.push('/predict');
      return;
    }

    const symptomIds = symptomIdsParam.split(',').map(Number).filter(id => !isNaN(id));

    if (symptomIds.length === 0) {
      router.push('/predict');
      return;
    }

    // API 호출하여 예측 결과 가져오기
    const fetchPredictions = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await predictDisease(symptomIds);
        setPredictions(result.predictions);
        setTotalDiseasesChecked(result.total_diseases_checked);
      } catch (err) {
        setError(err instanceof Error ? err.message : '질병 예측 실패');
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, [symptomIdsParam, router]);

  // 로딩 중
  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">AI가 질병을 예측하고 있습니다...</p>
        </div>
      </main>
    );
  }

  // 에러 발생
  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="text-red-600 text-6xl mb-4 text-center">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-4">예측 실패</h1>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button
            onClick={() => router.push('/predict')}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            다시 시도하기
          </button>
        </div>
      </main>
    );
  }

  // 차트 데이터 준비 (상위 5개)
  const chartData = predictions.slice(0, 5).map((pred) => ({
    name: pred.disease_name.length > 10 ? pred.disease_name.slice(0, 10) + '...' : pred.disease_name,
    fullName: pred.disease_name,
    확률: parseFloat((pred.probability * 100).toFixed(1)),
    category: pred.category || "기타",
  }));

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-5xl font-bold text-gray-800 mb-3">예측 결과</h1>
          <p className="text-lg text-gray-600">
            총 {totalDiseasesChecked}개 질병 검사 완료 | 상위 {predictions.length}개 표시
          </p>
        </div>

        {/* 차트 섹션 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 animate-fade-in">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">확률 차트</h2>

          {/* 막대 차트 */}
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
              <XAxis
                dataKey="name"
                angle={-15}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                label={{ value: '확률 (%)', angle: -90, position: 'insideLeft' }}
                domain={[0, 100]}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                        <p className="font-semibold text-gray-800">{data.fullName}</p>
                        <p className="text-sm text-gray-600">
                          확률: <span className="font-bold">{data.확률}%</span>
                        </p>
                        {data.category && (
                          <p className="text-xs text-gray-500 mt-1">
                            카테고리: {data.category}
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="확률" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={categoryColors[entry.category] || defaultColor}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 결과 카드 목록 */}
        <div className="space-y-4 mb-8">
          {predictions.map((pred, idx) => {
            const color = categoryColors[pred.category || ""] || defaultColor;

            return (
              <div
                key={pred.disease_id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow animate-slide-up border-l-4"
                style={{
                  borderColor: color,
                  animationDelay: `${idx * 0.1}s`,
                }}
              >
                {/* 순위 및 카테고리 */}
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-full font-bold text-white text-lg shadow"
                    style={{ backgroundColor: color }}
                  >
                    {pred.rank}
                  </div>
                  {pred.category && (
                    <span
                      className="px-3 py-1 text-sm font-medium rounded-full text-white shadow-sm"
                      style={{ backgroundColor: color }}
                    >
                      {pred.category}
                    </span>
                  )}
                </div>

                {/* 질병명 */}
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{pred.disease_name}</h3>

                {/* 확률 프로그레스 바 */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">일치 확률</span>
                    <span className="text-xl font-bold" style={{ color }}>
                      {(pred.probability * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                    <div
                      className="h-4 rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${pred.probability * 100}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>

                {/* 일치하는 증상 */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    일치하는 증상 ({pred.matched_symptoms.length}개)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {pred.matched_symptoms.map((symptom) => (
                      <span
                        key={symptom.id}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-white shadow-sm"
                        style={{ backgroundColor: color, opacity: 0.9 }}
                      >
                        {symptom.name}
                        <span className="text-xs opacity-80">
                          ({(symptom.probability * 100).toFixed(0)}%)
                        </span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* 설명 */}
                <p className="text-gray-600 leading-relaxed mb-4">{pred.description}</p>

                {/* 치료 방법 보기 버튼 */}
                <button
                  onClick={() => router.push(`/treatment?disease=${pred.disease_id}&category=${encodeURIComponent(pred.category || '기타질환')}&name=${encodeURIComponent(pred.disease_name)}`)}
                  className="w-full px-6 py-3 text-white rounded-lg font-bold transition shadow-md hover:shadow-lg"
                  style={{ backgroundColor: color }}
                >
                  이 질병 치료 방법 보기 →
                </button>
              </div>
            );
          })}
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-4 max-w-2xl mx-auto">
          <button
            onClick={() => router.push('/predict')}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            다시 진단하기
          </button>
        </div>
      </div>
    </main>
  );
}
