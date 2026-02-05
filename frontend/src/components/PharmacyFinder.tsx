'use client';

import { useEffect, useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

interface PharmacyFinderProps {
  diseaseName: string;
}

// Mock 약국 데이터 (API 키가 없을 때 사용)
const mockPharmacies = [
  {
    name: "24시 온누리약국",
    vicinity: "서울시 강남구 역삼동 123-45",
    rating: 4.5,
    user_ratings_total: 120,
    opening_hours: { open_now: true },
    place_id: "mock1",
    is_24_hour: true,
    geometry: {
      location: {
        lat: () => 37.5000,
        lng: () => 127.0400
      }
    }
  },
  {
    name: "서울약국",
    vicinity: "서울시 종로구 청진동 67-8",
    rating: 4.3,
    user_ratings_total: 85,
    opening_hours: { open_now: true },
    place_id: "mock2",
    is_24_hour: false,
    geometry: {
      location: {
        lat: () => 37.5700,
        lng: () => 126.9850
      }
    }
  },
  {
    name: "중앙약국",
    vicinity: "서울시 중구 명동 12-3",
    rating: 4.6,
    user_ratings_total: 200,
    opening_hours: { open_now: false },
    place_id: "mock3",
    is_24_hour: false,
    geometry: {
      location: {
        lat: () => 37.5630,
        lng: () => 126.9820
      }
    }
  },
  {
    name: "24시 건강약국",
    vicinity: "서울시 송파구 잠실동 89-12",
    rating: 4.4,
    user_ratings_total: 95,
    opening_hours: { open_now: true },
    place_id: "mock4",
    is_24_hour: true,
    geometry: {
      location: {
        lat: () => 37.5140,
        lng: () => 127.1030
      }
    }
  },
  {
    name: "새빛약국",
    vicinity: "서울시 마포구 합정동 34-5",
    rating: 4.2,
    user_ratings_total: 67,
    opening_hours: { open_now: true },
    place_id: "mock5",
    is_24_hour: false,
    geometry: {
      location: {
        lat: () => 37.5490,
        lng: () => 126.9140
      }
    }
  },
];

export default function PharmacyFinder({ diseaseName }: PharmacyFinderProps) {
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [pharmacies, setPharmacies] = useState<any[]>([]);
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

  // 약국 검색
  const searchPharmacies = useCallback(() => {
    if (!map || !userLocation || !apiKey) {
      setUseMockData(true);
      setPharmacies(mockPharmacies);
      return;
    }

    setLoading(true);
    const service = new google.maps.places.PlacesService(map);

    service.nearbySearch(
      {
        location: userLocation,
        radius: 3000, // 3km 반경 (병원보다 가까운 거리)
        type: 'pharmacy',
        keyword: '약국',
      },
      (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          // 24시간 약국을 위로 정렬하고 상위 15개만 표시
          const sortedResults = results
            .map((r: any) => ({
              ...r,
              is_24_hour: r.name?.includes('24') || r.name?.includes('24시간') || r.opening_hours?.open_now
            }))
            .sort((a: any, b: any) => {
              if (a.is_24_hour && !b.is_24_hour) return -1;
              if (!a.is_24_hour && b.is_24_hour) return 1;
              return 0;
            })
            .slice(0, 15);

          setPharmacies(sortedResults);
          setUseMockData(false);
        } else {
          console.error("약국 검색 실패:", status);
          setPharmacies(mockPharmacies);
          setUseMockData(true);
        }
        setLoading(false);
      }
    );
  }, [map, userLocation, apiKey]);

  // 지도 로드 시 약국 검색
  useEffect(() => {
    if (apiKey && map && userLocation) {
      searchPharmacies();
    } else if (!apiKey && userLocation) {
      setUseMockData(true);
      setPharmacies(mockPharmacies);
    }
  }, [map, userLocation, apiKey, searchPharmacies]);

  if (!isLoaded && !useMockData) {
    return <div className="text-center py-4">지도를 불러오는 중...</div>;
  }

  return (
    <div className="mt-8 border-t pt-8">
      <h2 className="text-2xl font-bold mb-4">💊 근처 약국 찾기</h2>

      <div className="mb-4 p-4 bg-green-50 rounded-lg">
        <p className="text-sm text-green-800">
          <strong>{diseaseName}</strong> 치료를 위한 처방전을 받으실 수 있는 근처 약국입니다.
        </p>
        <p className="text-xs text-green-600 mt-1">
          ⏰ <span className="font-bold text-red-600">24시간 약국</span>은 야간/휴일에도 이용 가능합니다.
        </p>
      </div>

      {!apiKey && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ Google Maps API 키가 설정되지 않았습니다. 샘플 데이터를 표시합니다.
            <br />
            실제 약국 정보를 보려면 <code className="bg-yellow-100 px-1 rounded">.env.local</code> 파일에 API 키를 추가하세요.
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
                  fillColor: '#10B981',
                  fillOpacity: 1,
                  strokeColor: '#fff',
                  strokeWeight: 2,
                }}
              />
            )}

            {/* 약국 마커 */}
            {pharmacies.map((pharmacy, index) => {
              const lat = pharmacy.geometry?.location?.lat?.() || 37.5665;
              const lng = pharmacy.geometry?.location?.lng?.() || 126.9780;

              return (
                <Marker
                  key={index}
                  position={{ lat, lng }}
                  title={pharmacy.name}
                  icon={{
                    url: pharmacy.is_24_hour
                      ? 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                      : 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
                  }}
                />
              );
            })}
          </GoogleMap>
        </div>
      ) : (
        <div className="mb-4 p-8 bg-gray-100 rounded-lg text-center">
          <p className="text-gray-600">지도가 로드되지 않았습니다. 아래 약국 목록을 참고하세요.</p>
        </div>
      )}

      {/* 약국 리스트 */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">약국을 검색하는 중...</p>
          </div>
        ) : pharmacies.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">근처에 약국을 찾을 수 없습니다.</p>
          </div>
        ) : (
          pharmacies.map((pharmacy, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 hover:shadow-md transition ${
                pharmacy.is_24_hour ? 'border-red-300 bg-red-50' : 'bg-white'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{pharmacy.name}</h3>
                    {pharmacy.is_24_hour && (
                      <span className="px-2 py-1 bg-red-600 text-white text-xs rounded font-bold">
                        24시간
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{pharmacy.vicinity}</p>

                  {pharmacy.rating && (
                    <div className="flex items-center mt-2">
                      <span className="text-yellow-500">⭐</span>
                      <span className="ml-1 text-sm font-medium">{pharmacy.rating}</span>
                      {pharmacy.user_ratings_total && (
                        <span className="ml-1 text-sm text-gray-500">
                          ({pharmacy.user_ratings_total}개 리뷰)
                        </span>
                      )}
                    </div>
                  )}

                  {pharmacy.opening_hours && (
                    <span className={`inline-block mt-2 px-2 py-1 text-xs rounded font-medium ${
                      pharmacy.opening_hours.open_now
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {pharmacy.opening_hours.open_now ? '영업 중' : '영업 종료'}
                    </span>
                  )}
                </div>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pharmacy.name)}&query_place_id=${pharmacy.place_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm font-medium whitespace-nowrap"
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
            💡 샘플 데이터입니다. 실제 약국 정보는 Google Maps API 키 설정 후 확인할 수 있습니다.
          </p>
        </div>
      )}
    </div>
  );
}
