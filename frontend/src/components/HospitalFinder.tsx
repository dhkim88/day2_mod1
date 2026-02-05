'use client';

import { useEffect, useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

interface HospitalFinderProps {
  category: string;
  diseaseName: string;
}

// 카테고리별 병원 전문과 매핑
const categoryToSpecialty: Record<string, string[]> = {
  "호흡기질환": ["내과", "이비인후과", "호흡기내과"],
  "소화기질환": ["내과", "소화기내과", "외과"],
  "피부질환": ["피부과"],
  "감염성질환": ["감염내과", "내과"],
  "심혈관질환": ["순환기내과", "심장내과"],
  "내분비대사질환": ["내분비내과", "내과"],
  "근골격계질환": ["정형외과", "재활의학과"],
  "신경계질환": ["신경과", "신경외과"],
  "비뇨기질환": ["비뇨기과"],
  "안과질환": ["안과"],
  "이비인후과질환": ["이비인후과"],
  "정신과질환": ["정신건강의학과"],
  "기타질환": ["내과", "가정의학과"],
};

// Mock 병원 데이터 (API 키가 없을 때 사용)
const mockHospitals = [
  {
    name: "서울대학교병원",
    vicinity: "서울시 종로구 대학로 101",
    rating: 4.5,
    user_ratings_total: 1234,
    opening_hours: { open_now: true },
    place_id: "mock1"
  },
  {
    name: "삼성서울병원",
    vicinity: "서울시 강남구 일원로 81",
    rating: 4.7,
    user_ratings_total: 2345,
    opening_hours: { open_now: true },
    place_id: "mock2"
  },
  {
    name: "세브란스병원",
    vicinity: "서울시 서대문구 연세로 50-1",
    rating: 4.6,
    user_ratings_total: 1890,
    opening_hours: { open_now: false },
    place_id: "mock3"
  },
  {
    name: "서울아산병원",
    vicinity: "서울시 송파구 올림픽로 43길 88",
    rating: 4.5,
    user_ratings_total: 2100,
    opening_hours: { open_now: true },
    place_id: "mock4"
  },
  {
    name: "강남세브란스병원",
    vicinity: "서울시 강남구 언주로 211",
    rating: 4.4,
    user_ratings_total: 987,
    opening_hours: { open_now: true },
    place_id: "mock5"
  },
];

export default function HospitalFinder({ category, diseaseName }: HospitalFinderProps) {
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [useMockData, setUseMockData] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: ['places'],
  });

  // 사용자 위치 가져오기
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("위치 정보를 가져올 수 없습니다:", error);
          // 기본 위치 (서울 시청)
          setUserLocation({ lat: 37.5665, lng: 126.9780 });
        }
      );
    } else {
      setUserLocation({ lat: 37.5665, lng: 126.9780 });
    }
  }, []);

  // 병원 검색
  const searchHospitals = useCallback(() => {
    if (!map || !userLocation || !apiKey) {
      setUseMockData(true);
      setHospitals(mockHospitals);
      return;
    }

    setLoading(true);
    const service = new google.maps.places.PlacesService(map);
    const specialties = categoryToSpecialty[category] || ["병원"];

    service.nearbySearch(
      {
        location: userLocation,
        radius: 5000,
        type: 'hospital',
        keyword: specialties.join(' '),
      },
      (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          setHospitals(results.slice(0, 10));
          setUseMockData(false);
        } else {
          console.error("병원 검색 실패:", status);
          setHospitals(mockHospitals);
          setUseMockData(true);
        }
        setLoading(false);
      }
    );
  }, [map, userLocation, category, apiKey]);

  // 지도 로드 시 병원 검색
  useEffect(() => {
    if (apiKey && map && userLocation) {
      searchHospitals();
    } else if (!apiKey && userLocation) {
      setUseMockData(true);
      setHospitals(mockHospitals);
    }
  }, [map, userLocation, apiKey, searchHospitals]);

  if (!isLoaded && !useMockData) {
    return <div className="text-center py-4">지도를 불러오는 중...</div>;
  }

  const specialties = categoryToSpecialty[category] || ["내과", "가정의학과"];

  return (
    <div className="mt-8 border-t pt-8">
      <h2 className="text-2xl font-bold mb-4">🏥 근처 병원 찾기</h2>

      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>{diseaseName}</strong> 치료를 위해 <strong>{specialties.join(', ')}</strong> 전문의를 찾아보세요.
        </p>
      </div>

      {!apiKey && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ Google Maps API 키가 설정되지 않았습니다. 샘플 데이터를 표시합니다.
            <br />
            실제 병원 정보를 보려면 <code className="bg-yellow-100 px-1 rounded">.env.local</code> 파일에 API 키를 추가하세요.
          </p>
        </div>
      )}

      {/* 지도 */}
      {isLoaded && apiKey ? (
        <div className="mb-4 rounded-lg overflow-hidden shadow-lg">
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '400px' }}
            center={userLocation || { lat: 37.5665, lng: 126.9780 }}
            zoom={14}
            onLoad={setMap}
          >
            {/* 사용자 위치 마커 */}
            {userLocation && (
              <Marker
                position={userLocation}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: '#4285F4',
                  fillOpacity: 1,
                  strokeColor: '#fff',
                  strokeWeight: 2,
                }}
              />
            )}

            {/* 병원 마커 */}
            {hospitals.map((hospital, index) => {
              const lat = hospital.geometry?.location?.lat?.() || 37.5665;
              const lng = hospital.geometry?.location?.lng?.() || 126.9780;

              return (
                <Marker
                  key={index}
                  position={{ lat, lng }}
                  title={hospital.name}
                />
              );
            })}
          </GoogleMap>
        </div>
      ) : (
        <div className="mb-4 p-8 bg-gray-100 rounded-lg text-center">
          <p className="text-gray-600">지도가 로드되지 않았습니다. 아래 병원 목록을 참고하세요.</p>
        </div>
      )}

      {/* 병원 리스트 */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">병원을 검색하는 중...</p>
          </div>
        ) : hospitals.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">근처에 병원을 찾을 수 없습니다.</p>
          </div>
        ) : (
          hospitals.map((hospital, index) => (
            <div key={index} className="border rounded-lg p-4 hover:shadow-md transition bg-white">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{hospital.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{hospital.vicinity}</p>

                  {hospital.rating && (
                    <div className="flex items-center mt-2">
                      <span className="text-yellow-500">⭐</span>
                      <span className="ml-1 text-sm font-medium">{hospital.rating}</span>
                      {hospital.user_ratings_total && (
                        <span className="ml-1 text-sm text-gray-500">
                          ({hospital.user_ratings_total}개 리뷰)
                        </span>
                      )}
                    </div>
                  )}

                  {hospital.opening_hours && (
                    <span className={`inline-block mt-2 px-2 py-1 text-xs rounded font-medium ${
                      hospital.opening_hours.open_now
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {hospital.opening_hours.open_now ? '영업 중' : '영업 종료'}
                    </span>
                  )}
                </div>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.name)}&query_place_id=${hospital.place_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm font-medium whitespace-nowrap"
                >
                  길찾기
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {useMockData && (
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            💡 샘플 데이터입니다. 실제 병원 정보는 Google Maps API 키 설정 후 확인할 수 있습니다.
          </p>
        </div>
      )}
    </div>
  );
}
