'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSymptoms, createSymptom, updateSymptom, deleteSymptom, Symptom } from '@/lib/api';

export default function SymptomsPage() {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSymptom, setEditingSymptom] = useState<Symptom | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  // 증상 목록 로드
  const loadSymptoms = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSymptoms();
      setSymptoms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '증상 목록을 불러올 수 없습니다');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSymptoms();
  }, []);

  // 모달 열기 (생성/수정)
  const openModal = (symptom?: Symptom) => {
    if (symptom) {
      setEditingSymptom(symptom);
      setFormData({ name: symptom.name, description: symptom.description || '' });
    } else {
      setEditingSymptom(null);
      setFormData({ name: '', description: '' });
    }
    setIsModalOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSymptom(null);
    setFormData({ name: '', description: '' });
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('증상명을 입력해주세요');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name,
        description: formData.description.trim() || undefined,
      };

      if (editingSymptom) {
        await updateSymptom(editingSymptom.id, payload);
      } else {
        await createSymptom(payload);
      }
      await loadSymptoms();
      closeModal();
    } catch (err) {
      alert(err instanceof Error ? err.message : '작업에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  // 삭제
  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`"${name}" 증상을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deleteSymptom(id);
      await loadSymptoms();
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제에 실패했습니다');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">증상 관리</h1>
              <Link
                href="/admin"
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 transition"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                관리자 페이지로
              </Link>
            </div>
            <button
              onClick={() => openModal()}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              새 증상 추가
            </button>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* 증상 목록 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {symptoms.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                등록된 증상이 없습니다. 새 증상을 추가해주세요.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        증상명
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        설명
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        작업
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {symptoms.map((symptom) => (
                      <tr key={symptom.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {symptom.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {symptom.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {symptom.description || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => openModal(symptom)}
                            className="text-green-600 hover:text-green-800 mr-4"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDelete(symptom.id, symptom.name)}
                            className="text-red-600 hover:text-red-800"
                          >
                            삭제
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingSymptom ? '증상 수정' : '새 증상 추가'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  증상명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="증상명을 입력하세요"
                  required
                  maxLength={100}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명 <span className="text-gray-400">(선택)</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-24 resize-none"
                  placeholder="증상 설명을 입력하세요 (선택사항)"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  disabled={submitting}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? '처리중...' : editingSymptom ? '수정' : '추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
