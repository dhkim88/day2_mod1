'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function TreatmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const diseaseId = searchParams.get('disease');
  const category = searchParams.get('category') || '기타질환';
  const diseaseName = searchParams.get('name') || '질병';

  if (!diseaseId) {
    router.push('/predict');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* 헤더 */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">치료 방법 선택</h1>
          <p className="text-lg text-gray-600">원하시는 진료 방식을 선택해주세요</p>
        </div>

        {/* 질병 정보 */}
        <div className="bg-blue-50 rounded-lg p-6 mb-12 shadow-md animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="text-5xl">🏥</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{diseaseName}</h2>
              <p className="text-gray-600">카테고리: {category}</p>
            </div>
          </div>
        </div>

        {/* 2개의 큰 선택 카드 */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* 대면 진료 */}
          <div
            onClick={() => router.push(`/hospital?disease=${diseaseId}&category=${encodeURIComponent(category)}&name=${encodeURIComponent(diseaseName)}`)}
            className="bg-white border-2 rounded-xl p-8 cursor-pointer hover:border-blue-500 hover:shadow-2xl transition transform hover:-translate-y-1 animate-slide-up"
          >
            <div className="text-6xl mb-6 text-center">🏥</div>
            <h3 className="text-2xl font-bold mb-4 text-center text-gray-800">대면 진료</h3>
            <p className="text-gray-600 mb-6 text-center">
              병원을 직접 방문하여 의사에게 진료를 받습니다
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center text-gray-700">
                <span className="text-green-500 mr-2">✓</span>
                <span>정확한 진단</span>
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-green-500 mr-2">✓</span>
                <span>즉시 검사 가능</span>
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-green-500 mr-2">✓</span>
                <span>근처 병원 안내</span>
              </li>
            </ul>
            <div className="text-center text-blue-600 font-bold text-lg">
              병원 찾기 →
            </div>
          </div>

          {/* 비대면 진료 */}
          <div
            onClick={() => router.push(`/telemedicine?disease=${diseaseId}&category=${encodeURIComponent(category)}&name=${encodeURIComponent(diseaseName)}`)}
            className="bg-white border-2 rounded-xl p-8 cursor-pointer hover:border-purple-500 hover:shadow-2xl transition transform hover:-translate-y-1 animate-slide-up"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="text-6xl mb-6 text-center">📹</div>
            <h3 className="text-2xl font-bold mb-4 text-center text-gray-800">비대면 진료</h3>
            <p className="text-gray-600 mb-6 text-center">
              화상 통화로 집에서 편하게 진료를 받습니다
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center text-gray-700">
                <span className="text-purple-500 mr-2">✓</span>
                <span>집에서 편하게</span>
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-purple-500 mr-2">✓</span>
                <span>빠른 예약</span>
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-purple-500 mr-2">✓</span>
                <span>처방전 발급</span>
              </li>
            </ul>
            <div className="text-center text-purple-600 font-bold text-lg">
              비대면 진료 예약 →
            </div>
          </div>
        </div>

        {/* 뒤로 가기 버튼 */}
        <div className="text-center">
          <button
            onClick={() => router.back()}
            className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            ← 이전으로
          </button>
        </div>
      </div>
    </div>
  );
}
