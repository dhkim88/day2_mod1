'use client';

import { useRouter } from 'next/navigation';

export default function TelemedicineInfoPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="text-7xl mb-4">📹</div>
          <h1 className="text-5xl font-bold mb-4 text-gray-800">비대면 진료</h1>
          <p className="text-xl text-gray-600">
            집에서 편하게 전문 의료진과 화상 상담하세요
          </p>
        </div>

        {/* 장점 */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-5xl mb-4">🏠</div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">집에서 편하게</h3>
            <p className="text-gray-600">
              병원 방문 없이 화상 통화로 진료
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-5xl mb-4">⏰</div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">빠른 예약</h3>
            <p className="text-gray-600">
              당일 예약 가능, 대기 시간 없음
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-5xl mb-4">💊</div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">처방전 발급</h3>
            <p className="text-gray-600">
              진료 후 처방전을 근처 약국에서 수령
            </p>
          </div>
        </div>

        {/* 이용 방법 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">이용 방법</h2>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1 text-gray-800">증상 진단</h3>
                <p className="text-gray-600">
                  증상을 선택하고 AI가 질병을 예측합니다
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1 text-gray-800">비대면 진료 선택</h3>
                <p className="text-gray-600">
                  예측 결과에서 비대면 진료를 선택합니다
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1 text-gray-800">예약 완료</h3>
                <p className="text-gray-600">
                  예약 정보를 입력하고 의료진이 연락을 기다립니다
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1 text-gray-800">처방전 수령</h3>
                <p className="text-gray-600">
                  진료 후 근처 약국에서 처방전을 받습니다
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 시작 버튼 */}
        <div className="text-center">
          <button
            onClick={() => router.push('/predict')}
            className="px-12 py-4 bg-purple-600 text-white text-xl font-bold rounded-xl hover:bg-purple-700 transition shadow-lg"
          >
            증상 진단하고 비대면 진료 예약하기
          </button>
        </div>

        {/* 뒤로가기 */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-gray-800 underline"
          >
            ← 메인으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
