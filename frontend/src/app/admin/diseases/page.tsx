'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getDiseases,
  createDisease,
  updateDisease,
  deleteDisease,
  Disease,
  getSymptoms,
  Symptom,
  getDiseaseSymptoms,
  updateDiseaseSymptomsBulk,
  DiseaseSymptomUpdateItem
} from '@/lib/api';

interface SymptomSelection {
  symptom_id: number;
  checked: boolean;
  probability: number;
  is_primary: boolean;
}

export default function DiseasesPage() {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDisease, setEditingDisease] = useState<Disease | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  // 증상 관련 상태
  const [allSymptoms, setAllSymptoms] = useState<Symptom[]>([]);
  const [symptomSelections, setSymptomSelections] = useState<Map<number, SymptomSelection>>(new Map());
  const [loadingSymptoms, setLoadingSymptoms] = useState(false);
  const [diseaseSymptomsCount, setDiseaseSymptomsCount] = useState<Map<number, number>>(new Map());

  // 질병 목록 로드
  const loadDiseases = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDiseases();
      setDiseases(data);

      // 각 질병의 증상 개수 로드
      const counts = new Map<number, number>();
      for (const disease of data) {
        try {
          const diseaseSymptoms = await getDiseaseSymptoms(disease.id);
          counts.set(disease.id, diseaseSymptoms.symptoms.length);
        } catch {
          counts.set(disease.id, 0);
        }
      }
      setDiseaseSymptomsCount(counts);
    } catch (err) {
      setError(err instanceof Error ? err.message : '질병 목록을 불러올 수 없습니다');
    } finally {
      setLoading(false);
    }
  };

  // 전체 증상 목록 로드
  const loadAllSymptoms = async () => {
    try {
      const data = await getSymptoms();
      setAllSymptoms(data);
    } catch (err) {
      console.error('증상 목록 로드 실패:', err);
    }
  };

  useEffect(() => {
    loadDiseases();
    loadAllSymptoms();
  }, []);

  // 모달 열기 (생성/수정)
  const openModal = async (disease?: Disease) => {
    if (disease) {
      setEditingDisease(disease);
      setFormData({ name: disease.name, description: disease.description });

      // 질병의 증상 정보 로드
      setLoadingSymptoms(true);
      try {
        const diseaseSymptoms = await getDiseaseSymptoms(disease.id);

        // 증상 선택 상태 초기화
        const selections = new Map<number, SymptomSelection>();
        allSymptoms.forEach(symptom => {
          const linkedSymptom = diseaseSymptoms.symptoms.find(s => s.symptom_id === symptom.id);
          selections.set(symptom.id, {
            symptom_id: symptom.id,
            checked: !!linkedSymptom,
            probability: linkedSymptom ? linkedSymptom.probability * 100 : 0, // 0~1을 0~100으로 변환
            is_primary: linkedSymptom ? linkedSymptom.is_primary : false,
          });
        });
        setSymptomSelections(selections);
      } catch (err) {
        console.error('증상 정보 로드 실패:', err);
        // 실패 시 빈 선택 상태로 초기화
        const selections = new Map<number, SymptomSelection>();
        allSymptoms.forEach(symptom => {
          selections.set(symptom.id, {
            symptom_id: symptom.id,
            checked: false,
            probability: 0,
            is_primary: false,
          });
        });
        setSymptomSelections(selections);
      } finally {
        setLoadingSymptoms(false);
      }
    } else {
      setEditingDisease(null);
      setFormData({ name: '', description: '' });

      // 새 질병 생성 시 빈 선택 상태로 초기화
      const selections = new Map<number, SymptomSelection>();
      allSymptoms.forEach(symptom => {
        selections.set(symptom.id, {
          symptom_id: symptom.id,
          checked: false,
          probability: 0,
          is_primary: false,
        });
      });
      setSymptomSelections(selections);
    }
    setIsModalOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDisease(null);
    setFormData({ name: '', description: '' });
    setSymptomSelections(new Map());
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.description.trim()) {
      alert('모든 필드를 입력해주세요');
      return;
    }

    try {
      setSubmitting(true);

      let diseaseId: number;

      // 1. 질병 정보 저장
      if (editingDisease) {
        await updateDisease(editingDisease.id, formData);
        diseaseId = editingDisease.id;
      } else {
        const newDisease = await createDisease(formData);
        diseaseId = newDisease.id;
      }

      // 2. 증상 연결 정보 저장 (체크된 증상만)
      const symptomsToUpdate: DiseaseSymptomUpdateItem[] = [];
      symptomSelections.forEach((selection) => {
        if (selection.checked) {
          symptomsToUpdate.push({
            symptom_id: selection.symptom_id,
            probability: selection.probability / 100, // 0~100을 0~1로 변환
            is_primary: selection.is_primary,
          });
        }
      });

      if (symptomsToUpdate.length > 0) {
        await updateDiseaseSymptomsBulk(diseaseId, symptomsToUpdate);
      }

      await loadDiseases();
      closeModal();
    } catch (err) {
      alert(err instanceof Error ? err.message : '작업에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  // 삭제
  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`"${name}" 질병을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deleteDisease(id);
      await loadDiseases();
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제에 실패했습니다');
    }
  };

  // 증상 체크박스 토글
  const handleSymptomCheck = (symptomId: number, checked: boolean) => {
    const current = symptomSelections.get(symptomId);
    if (current) {
      const updated = new Map(symptomSelections);
      updated.set(symptomId, {
        ...current,
        checked,
        probability: checked ? current.probability || 50 : 0, // 체크 시 기본값 50%, 해제 시 0
      });
      setSymptomSelections(updated);
    }
  };

  // 증상 확률 변경
  const handleProbabilityChange = (symptomId: number, value: string) => {
    const current = symptomSelections.get(symptomId);
    if (current) {
      let probability = parseInt(value) || 0;
      probability = Math.max(0, Math.min(100, probability)); // 0~100 범위로 제한

      const updated = new Map(symptomSelections);
      updated.set(symptomId, {
        ...current,
        probability,
      });
      setSymptomSelections(updated);
    }
  };

  // 주증상 체크박스 토글
  const handlePrimaryCheck = (symptomId: number, checked: boolean) => {
    const current = symptomSelections.get(symptomId);
    if (current) {
      const updated = new Map(symptomSelections);
      updated.set(symptomId, {
        ...current,
        is_primary: checked,
      });
      setSymptomSelections(updated);
    }
  };

  // 체크된 증상 개수 계산
  const getSelectedCount = () => {
    return Array.from(symptomSelections.values()).filter(s => s.checked).length;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
              <h1 className="text-3xl font-bold text-gray-800 mb-2">질병 관리</h1>
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
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              새 질병 추가
            </button>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* 질병 목록 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {diseases.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                등록된 질병이 없습니다. 새 질병을 추가해주세요.
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
                        질병명
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        설명
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        연결된 증상
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        작업
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {diseases.map((disease) => (
                      <tr key={disease.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {disease.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {disease.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {disease.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {diseaseSymptomsCount.get(disease.id) || 0}개 증상
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => openModal(disease)}
                            className="text-blue-600 hover:text-blue-800 mr-4"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDelete(disease.id, disease.name)}
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
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingDisease ? '질병 수정' : '새 질병 추가'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4">
              {/* 기본 정보 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  질병명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="질병명을 입력하세요"
                  required
                  maxLength={100}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                  placeholder="질병 설명을 입력하세요"
                  required
                />
              </div>

              {/* 증상 연결 섹션 */}
              <div className="mb-6 border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">증상 연결</h3>
                  <span className="text-sm text-gray-600">
                    {getSelectedCount()}개 증상 선택됨
                  </span>
                </div>

                {loadingSymptoms ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">증상명</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500" style={{ width: '120px' }}>
                            확률 (%)
                          </th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500" style={{ width: '100px' }}>
                            주증상
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {allSymptoms.map((symptom) => {
                          const selection = symptomSelections.get(symptom.id);
                          if (!selection) return null;

                          return (
                            <tr key={symptom.id} className={selection.checked ? 'bg-blue-50' : ''}>
                              <td className="px-4 py-2">
                                <label className="flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={selection.checked}
                                    onChange={(e) => handleSymptomCheck(symptom.id, e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                  />
                                  <span className="ml-2 text-sm text-gray-900">{symptom.name}</span>
                                </label>
                              </td>
                              <td className="px-4 py-2 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={selection.probability}
                                  onChange={(e) => handleProbabilityChange(symptom.id, e.target.value)}
                                  disabled={!selection.checked}
                                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                                />
                              </td>
                              <td className="px-4 py-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={selection.is_primary}
                                  onChange={(e) => handlePrimaryCheck(symptom.id, e.target.checked)}
                                  disabled={!selection.checked}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-30"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* 버튼 */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? '처리중...' : editingDisease ? '수정' : '추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
