'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TelemedicineBookingProps {
  diseaseName: string;
  category: string;
  symptoms: string[]; // 선택한 증상들
}

export default function TelemedicineBooking({ diseaseName, category, symptoms }: TelemedicineBookingProps) {
  const router = useRouter();
  const [showBookingForm, setShowBookingForm] = useState(false);
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

    // 백엔드 API 호출 (또는 로컬 저장)
    try {
      const bookingData = {
        ...formData,
        diseaseName,
        category,
        symptoms,
        createdAt: new Date().toISOString(),
      };

      // TODO: 실제 백엔드 API 호출
      // await fetch('/api/telemedicine/booking', {
      //   method: 'POST',
      //   body: JSON.stringify(bookingData),
      // });

      // 현재는 로컬 저장
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
      <div className="mt-8 border-t pt-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-2xl font-bold text-green-800 mb-2">
            비대면 진료 예약 완료!
          </h3>
          <p className="text-green-700 mb-4">
            담당 의료진이 확인 후 {formData.phone}로 연락드립니다.
          </p>
          <div className="bg-white rounded p-4 text-left mb-4">
            <h4 className="font-bold mb-2">예약 정보</h4>
            <p className="text-sm text-gray-600">이름: {formData.name}</p>
            <p className="text-sm text-gray-600">연락처: {formData.phone}</p>
            <p className="text-sm text-gray-600">희망 일시: {formData.preferredDate} {formData.preferredTime}</p>
            <p className="text-sm text-gray-600">증상: {diseaseName}</p>
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
    );
  }

  return (
    <div className="mt-8 border-t pt-8">
      <h2 className="text-2xl font-bold mb-4">📹 비대면 진료</h2>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
        <h3 className="font-bold text-lg mb-2">병원 방문이 어려우신가요?</h3>
        <p className="text-sm text-gray-700 mb-4">
          화상 진료를 통해 편안한 곳에서 의사와 상담하실 수 있습니다.
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white rounded p-3">
            <div className="text-2xl mb-2">🏠</div>
            <p className="font-bold text-sm">집에서 편하게</p>
            <p className="text-xs text-gray-600">방문 없이 화상으로</p>
          </div>
          <div className="bg-white rounded p-3">
            <div className="text-2xl mb-2">⏰</div>
            <p className="font-bold text-sm">빠른 예약</p>
            <p className="text-xs text-gray-600">당일 예약 가능</p>
          </div>
          <div className="bg-white rounded p-3">
            <div className="text-2xl mb-2">💊</div>
            <p className="font-bold text-sm">처방전 발급</p>
            <p className="text-xs text-gray-600">약국에서 수령</p>
          </div>
        </div>

        {!showBookingForm ? (
          <button
            onClick={() => setShowBookingForm(true)}
            className="w-full py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition"
          >
            비대면 진료 예약하기
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 space-y-4">
            <h3 className="font-bold text-lg mb-4">예약 정보 입력</h3>

            {/* 질병 정보 */}
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-600">진료 질환</p>
              <p className="font-bold">{diseaseName} ({category})</p>
              <p className="text-xs text-gray-500 mt-1">
                증상: {symptoms.join(', ')}
              </p>
            </div>

            {/* 이름 */}
            <div>
              <label className="block text-sm font-medium mb-1">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full border rounded px-3 py-2"
                placeholder="홍길동"
              />
            </div>

            {/* 연락처 */}
            <div>
              <label className="block text-sm font-medium mb-1">
                연락처 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full border rounded px-3 py-2"
                placeholder="010-0000-0000"
              />
            </div>

            {/* 이메일 */}
            <div>
              <label className="block text-sm font-medium mb-1">
                이메일
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full border rounded px-3 py-2"
                placeholder="example@email.com"
              />
            </div>

            {/* 희망 날짜 */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  희망 날짜 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.preferredDate}
                  onChange={(e) => setFormData({...formData, preferredDate: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  희망 시간 <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.preferredTime}
                  onChange={(e) => setFormData({...formData, preferredTime: e.target.value})}
                  className="w-full border rounded px-3 py-2"
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
              <label className="block text-sm font-medium mb-1">
                추가 메시지
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full border rounded px-3 py-2"
                rows={3}
                placeholder="의사에게 전달할 추가 정보를 입력해주세요"
              />
            </div>

            {/* 버튼 */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowBookingForm(false)}
                className="flex-1 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? '예약 중...' : '예약 완료'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
