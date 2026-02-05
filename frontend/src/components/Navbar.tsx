'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <span className="text-3xl">🏥</span>
            <span className="text-2xl font-bold text-gray-800">AI 질병 예측</span>
          </Link>

          {/* 네비게이션 링크 */}
          <div className="flex gap-2">
            <Link
              href="/predict"
              className={`px-4 py-2 rounded-lg font-medium transition ${
                isActive('/predict')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              질병 예측
            </Link>
            <Link
              href="/hospital-map"
              className={`px-4 py-2 rounded-lg font-medium transition ${
                isActive('/hospital-map')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              🏥 병원
            </Link>
            <Link
              href="/pharmacy-map"
              className={`px-4 py-2 rounded-lg font-medium transition ${
                isActive('/pharmacy-map')
                  ? 'bg-green-600 text-white'
                  : 'text-gray-700 hover:bg-green-50 hover:text-green-600'
              }`}
            >
              💊 약국
            </Link>
            <Link
              href="/admin"
              className={`px-4 py-2 rounded-lg font-medium transition ${
                isActive('/admin')
                  ? 'bg-gray-600 text-white'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-600'
              }`}
            >
              관리자
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
