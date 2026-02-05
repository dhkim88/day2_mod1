'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function TelemedicinePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const category = searchParams.get('category') || '기타질환';
  const diseaseName = searchParams.get('name') || '질병';

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    preferredDate: '',
    preferredTime: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const bookingData = {
        ...formData,
        diseaseName,
        category,
        createdAt: new Date().toISOString(),
      };

      // TODO: 실제 백엔드 API 호출
      // await fetch('/api/telemedicine/booking', {
      //   method: 'POST',
      //   body: JSON.stringify(bookingData),
      // });

      console.log('비대면 진료 예약:', bookingData);

      setTimeout(() => {
        setSubmitted(true);
        setLoading(false);

        // 3초 후 약국 페이지로 자동 이동
        setTimeout(() => {
          router.push('/pharmacy');
        }, 3000);
      }, 1000);
    } catch (error) {
      console.error('예약 실패:', error);
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-12 px-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-3xl font-bold text-green-800 mb-4">
              비대면 진료 예약 완료!
            </h2>
            <p className="text-green-700 mb-6">
              담당 의료진이 확인 후 {formData.phone}로 연락드립니다.
            </p>

            <div className="bg-gray-50 rounded-lg p-6 text-left mb-6">
              <h3 className="font-bold text-lg mb-4 text-gray-800">예약 정보</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">이름:</span> {formData.name}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">연락처:</span> {formData.phone}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">희망 일시:</span> {formData.preferredDate} {formData.preferredTime}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">증상:</span> {diseaseName}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              3초 후 약국 찾기 페이지로 이동합니다...
            </p>

            <button
              onClick={() => router.push('/pharmacy')}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition"
            >
              약국 찾기 →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* 헤더 */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">비대면 진료 예약</h1>
          <p className="text-lg text-gray-600">화상 진료로 편안하게 의사와 상담하세요</p>
        </div>

        {/* 질병 정보 */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-8 shadow-md">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">📹</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{diseaseName}</h2>
              <p className="text-gray-600">카테고리: {category}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded p-4">
              <div className="text-3xl mb-2">🏠</div>
              <p className="font-bold text-sm text-gray-800">집에서 편하게</p>
              <p className="text-xs text-gray-600">방문 없이 화상으로</p>
            </div>
            <div className="bg-white rounded p-4">
              <div className="text-3xl mb-2">⏰</div>
              <p className="font-bold text-sm text-gray-800">빠른 예약</p>
              <p className="text-xs text-gray-600">당일 예약 가능</p>
            </div>
            <div className="bg-white rounded p-4">
              <div className="text-3xl mb-2">💊</div>
              <p className="font-bold text-sm text-gray-800">처방전 발급</p>
              <p className="text-xs text-gray-600">약국에서 수령</p>
            </div>
          </div>
        </div>

        {/* 예약 폼 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <h3 className="font-bold text-2xl mb-6 text-gray-800">예약 정보 입력</h3>

          {/* 이름 */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="홍길동"
            />
          </div>

          {/* 연락처 */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              연락처 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="010-0000-0000"
            />
          </div>

          {/* 이메일 */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              이메일
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="example@email.com"
            />
          </div>

          {/* 희망 날짜 및 시간 */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                희망 날짜 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.preferredDate}
                onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                희망 시간 <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.preferredTime}
                onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">선택</option>
                <option value="09:00">09:00</option>
                <option value="10:00">10:00</option>
                <option value="11:00">11:00</option>
                <option value="14:00">14:00</option>
                <option value="15:00">15:00</option>
                <option value="16:00">16:00</option>
                <option value="17:00">17:00</option>
                <option value="18:00">18:00</option>
              </select>
            </div>
          </div>

          {/* 추가 메시지 */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              추가 메시지
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={4}
              placeholder="의사에게 전달할 추가 정보를 입력해주세요"
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 transition shadow-md hover:shadow-lg"
            >
              {loading ? '예약 중...' : '예약 완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
