import { useEffect, useState } from 'react';
import { Film, Loader2, RotateCw } from 'lucide-react';

interface Movie {
  id: number;
  title: string;
  director: string;
  genre: string;
  description: string;
  year: string;
}

export default function Movies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = () => {
    setLoading(true);
    fetch('/api/recommendations/movies')
      .then((res) => res.json())
      .then((data) => {
        setMovies(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load movies', err);
        setLoading(false);
      });
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setLoading(true);
    try {
      const res = await fetch('/api/recommendations/movies/refresh', {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setMovies(data);
      } else {
        console.error('Failed to refresh movies');
      }
    } catch (error) {
      console.error('Failed to refresh movies', error);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  return (
    <div className="pb-24 pt-6 px-4 max-w-2xl lg:max-w-4xl mx-auto min-h-screen">
      <header className="mb-6 flex items-center justify-between border-b border-[#EAE4DD] pb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-[#1A1A1A]">명작 영화</h1>
          <p className="text-base text-gray-500 mt-1">영화사에 길이 남을 위대한 시네마 마스터피스 (AI 주간 추천)</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading || isRefreshing}
          className="flex items-center justify-center p-2.5 border border-[#EAE4DD] hover:border-[#4A90E2] text-[#1A1A1A] rounded-xl transition-all duration-200 cursor-pointer bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md active:scale-95"
          title="새로운 영화 추천받기"
        >
          {isRefreshing ? (
            <Loader2 className="w-5 h-5 animate-spin text-[#4A90E2]" />
          ) : (
            <RotateCw className="w-5 h-5 text-[#4A90E2]" />
          )}
        </button>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mb-4" />
          <p>AI가 명작 영화를 선정하고 있습니다...</p>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in-down" style={{ animationDuration: '0.4s' }}>
          {movies.map((movie) => (
            <div key={movie.id} className="bg-white p-6 rounded-2xl shadow-sm border border-[#EAE4DD] relative overflow-hidden transition-all duration-300">
              <span className="text-xs font-bold uppercase tracking-widest text-[#4A90E2] mb-2 block">
                Masterpiece
              </span>
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-2xl font-serif font-bold text-[#1A1A1A]">{movie.title}</h4>
              </div>
              <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                <span className="font-medium text-[#1A1A1A]">{movie.director}</span>
                <span>•</span>
                <span>{movie.year}</span>
                <span>•</span>
                <span className="font-bold text-[#4A90E2]">{movie.genre}</span>
              </div>
              <div className="h-px bg-[#EAE4DD] w-full mb-4"></div>
              <p className="text-base leading-relaxed text-gray-600 break-keep">
                {movie.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
