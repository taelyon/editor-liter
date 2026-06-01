import { useEffect, useState } from 'react';
import { BookText, Loader2, RotateCw } from 'lucide-react';

interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  description: string;
  year: string;
}

export default function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = () => {
    setLoading(true);
    fetch('/api/recommendations/books')
      .then((res) => res.json())
      .then((data) => {
        setBooks(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load books', err);
        setLoading(false);
      });
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setLoading(true);
    try {
      const res = await fetch('/api/recommendations/books/refresh', {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setBooks(data);
      } else {
        console.error('Failed to refresh books');
      }
    } catch (error) {
      console.error('Failed to refresh books', error);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  return (
    <div className="pb-24 pt-6 px-4 max-w-2xl lg:max-w-4xl mx-auto min-h-screen">
      <header className="mb-6 flex items-center justify-between border-b border-[#EAE4DD] pb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-[#1A1A1A]">문학의 고전</h1>
          <p className="text-base text-gray-500 mt-1">인류의 지성과 감성을 일깨운 영원한 베스트셀러 (AI 주간 추천)</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading || isRefreshing}
          className="flex items-center justify-center p-2.5 border border-[#EAE4DD] hover:border-[#A67C52] text-[#1A1A1A] rounded-xl transition-all duration-200 cursor-pointer bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md active:scale-95"
          title="새로운 도서 추천받기"
        >
          {isRefreshing ? (
            <Loader2 className="w-5 h-5 animate-spin text-[#A67C52]" />
          ) : (
            <RotateCw className="w-5 h-5 text-[#A67C52]" />
          )}
        </button>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mb-4" />
          <p>AI가 명작 도서를 선정하고 있습니다...</p>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in-down" style={{ animationDuration: '0.4s' }}>
          {books.map((book) => (
            <div key={book.id} className="bg-white p-6 rounded-2xl shadow-sm border border-[#EAE4DD] relative overflow-hidden transition-all duration-300">
              <span className="text-xs font-bold uppercase tracking-widest text-[#A67C52] mb-2 block">
                Masterpiece
              </span>
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-2xl font-serif font-bold text-[#1A1A1A]">{book.title}</h4>
              </div>
              <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                <span className="font-medium text-[#1A1A1A]">{book.author}</span>
                <span>•</span>
                <span>{book.year}</span>
                <span>•</span>
                <span className="font-bold text-[#A67C52]">{book.genre}</span>
              </div>
              <div className="h-px bg-[#EAE4DD] w-full mb-4"></div>
              <p className="text-base leading-relaxed text-gray-600 break-keep whitespace-pre-line">
                {book.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
