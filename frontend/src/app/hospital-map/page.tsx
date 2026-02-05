'use client';

import { useRouter } from 'next/navigation';
import HospitalFinder from '@/components/HospitalFinder';

export default function HospitalMapPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* 헤더 */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">🏥 병원 찾기</h1>
          <p className="text-lg text-gray-600">근처 병원을 지도에서 찾아보세요</p>
        </div>

        {/* HospitalFinder 컴포넌트 */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <HospitalFinder category="기타질환" diseaseName="일반 진료" />
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-4 max-w-2xl mx-auto mt-8">
          <button
            onClick={() => router.push('/')}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            ← 홈으로
          </button>
          <button
            onClick={() => router.push('/pharmacy-map')}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            약국 찾기 →
          </button>
        </div>
      </div>
    </div>
  );
}
