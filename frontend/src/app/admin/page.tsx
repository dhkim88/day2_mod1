import Link from 'next/link';

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">관리자 페이지</h1>

          <div className="grid md:grid-cols-2 gap-6">
            {/* 질병 관리 카드 */}
            <Link
              href="/admin/diseases"
              className="block bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 border border-gray-200"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">질병 관리</h2>
              </div>
              <p className="text-gray-600">질병 데이터를 추가, 수정, 삭제합니다</p>
            </Link>

            {/* 증상 관리 카드 */}
            <Link
              href="/admin/symptoms"
              className="block bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 border border-gray-200"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">증상 관리</h2>
              </div>
              <p className="text-gray-600">증상 데이터를 추가, 수정, 삭제합니다</p>
            </Link>
          </div>

          {/* 홈으로 돌아가기 */}
          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center text-gray-600 hover:text-gray-800 transition"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
