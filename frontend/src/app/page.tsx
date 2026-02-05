import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* 헤더 */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 text-gray-800">🏥 AI 질병 예측 시스템</h1>
          <p className="text-xl text-gray-600">
            증상을 입력하면 AI가 질병을 예측하고 치료 방법을 안내합니다
          </p>
        </div>

        {/* 4개의 메인 카드 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto mb-16">
          {/* 질병 예측 카드 */}
          <Link href="/predict">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition cursor-pointer border-2 border-transparent hover:border-blue-500 h-full">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold mb-3 text-gray-800">질병 예측</h2>
              <p className="text-gray-600 mb-4">
                증상을 선택하면 AI가 가능한 질병을 예측해드립니다
              </p>
              <div className="text-blue-600 font-bold">시작하기 →</div>
            </div>
          </Link>

          {/* 병원 찾기 카드 */}
          <Link href="/hospital-map">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition cursor-pointer border-2 border-transparent hover:border-blue-500 h-full">
              <div className="text-6xl mb-4">🏥</div>
              <h2 className="text-2xl font-bold mb-3 text-gray-800">병원 찾기</h2>
              <p className="text-gray-600 mb-4">
                근처 병원을 지도에서 찾아보세요
              </p>
              <div className="text-blue-600 font-bold">지도 보기 →</div>
            </div>
          </Link>

          {/* 약국 찾기 카드 */}
          <Link href="/pharmacy-map">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition cursor-pointer border-2 border-transparent hover:border-green-500 h-full">
              <div className="text-6xl mb-4">💊</div>
              <h2 className="text-2xl font-bold mb-3 text-gray-800">약국 찾기</h2>
              <p className="text-gray-600 mb-4">
                근처 약국을 지도에서 찾아보세요
              </p>
              <div className="text-green-600 font-bold">지도 보기 →</div>
            </div>
          </Link>

          {/* 비대면 진료 카드 */}
          <Link href="/telemedicine-info">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition cursor-pointer border-2 border-transparent hover:border-purple-500 h-full">
              <div className="text-6xl mb-4">📹</div>
              <h2 className="text-2xl font-bold mb-3 text-gray-800">비대면 진료</h2>
              <p className="text-gray-600 mb-4">
                집에서 편하게 화상으로 의사와 상담하세요
              </p>
              <div className="text-purple-600 font-bold">예약하기 →</div>
            </div>
          </Link>
        </div>

        {/* 사용 방법 */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8 text-gray-800">사용 방법</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="text-4xl mb-2">1️⃣</div>
              <p className="font-bold mb-1 text-gray-800">증상 입력</p>
              <p className="text-sm text-gray-600">불편한 증상 선택</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="text-4xl mb-2">2️⃣</div>
              <p className="font-bold mb-1 text-gray-800">질병 예측</p>
              <p className="text-sm text-gray-600">AI가 질병 분석</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="text-4xl mb-2">3️⃣</div>
              <p className="font-bold mb-1 text-gray-800">치료 선택</p>
              <p className="text-sm text-gray-600">대면/비대면 선택</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="text-4xl mb-2">4️⃣</div>
              <p className="font-bold mb-1 text-gray-800">병원/약국</p>
              <p className="text-sm text-gray-600">근처 의료기관</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

