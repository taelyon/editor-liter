import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useSwipe } from '../lib/useSwipe';

interface Classic {
  id: number;
  category: string;
  title: string;
  author: string;
  quote: string;
  content: string;
  fullText?: string;
}

export default function Classics() {
  const navigate = useNavigate();
  const tabSwipeHandlers = useSwipe({
    onSwipedLeft: () => navigate('/settings'),
    onSwipedRight: () => navigate('/'),
  });

  const [filter, setFilter] = useState<'전체' | '동양' | '서양'>('전체');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [classics, setClassics] = useState<Classic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClassics = async () => {
      try {
        const res = await fetch('/api/classics');
        const data = await res.json();
        if (Array.isArray(data)) {
          setClassics(data);
        }
      } catch (error) {
        console.error('Failed to fetch classics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClassics();
  }, []);

  const filteredClassics = filter === '전체' 
    ? classics 
    : classics.filter(c => c.category === filter);

  return (
    <div 
      className="pb-24 pt-6 px-4 max-w-2xl lg:max-w-4xl mx-auto min-h-screen"
      {...tabSwipeHandlers}
    >
      <header className="mb-6 flex items-center justify-between border-b border-[#EAE4DD] pb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-[#1A1A1A]">오늘의 고전</h1>
          <p className="text-base text-gray-500 mt-1">인공지능이 매일 새롭게 큐레이션하는 지혜</p>
        </div>
      </header>

      <div className="flex gap-4 mb-6">
        {['전체', '동양', '서양'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={cn(
              "px-1 py-1.5 text-base font-medium transition-colors border-b-2 bg-transparent rounded-none",
              filter === f 
                ? "text-[#1A1A1A] border-[#1A1A1A]" 
                : "text-gray-400 border-transparent hover:text-[#1A1A1A]"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {isLoading ? (
          <div className="space-y-8 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-[#EAE4DD] relative overflow-hidden h-64">
                <div className="h-4 bg-gray-200 rounded w-16 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
                <div className="h-6 bg-gray-100 rounded w-full mb-2"></div>
                <div className="h-6 bg-gray-100 rounded w-3/4 mb-4"></div>
                <div className="h-px bg-[#EAE4DD] w-full mb-4"></div>
                <div className="h-24 bg-gray-50 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : (
          filteredClassics.map((classic) => {
            const isExpanded = expandedId === classic.id;
            
            return (
            <div key={classic.id} className="bg-white p-6 rounded-2xl shadow-sm border border-[#EAE4DD] relative overflow-hidden transition-all duration-300">
              <span className={cn(
                "text-xs font-bold uppercase tracking-widest mb-2 block",
                classic.category === '동양' ? "text-[#A67C52]" : "text-[#2C3E50]"
              )}>
                {classic.category} Classic
              </span>
              <div className="flex justify-between items-start">
                <h4 className="text-2xl font-serif font-bold mb-1 text-[#1A1A1A]">{classic.title}</h4>
              </div>
              <p className="text-base text-gray-500 mb-4 italic leading-relaxed">
                "{classic.quote}"
              </p>
              <div className="h-px bg-[#EAE4DD] w-full mb-4"></div>
              <p className="text-base leading-relaxed text-gray-600 mb-5 break-keep">
                {classic.content}
              </p>
              
              {isExpanded && classic.fullText && (
                <div className="mt-4 pt-4 border-t border-[#EAE4DD]/50 animate-fade-in">
                  <p className="text-[17px] leading-relaxed text-[#1A1A1A] font-serif whitespace-pre-wrap break-keep">
                    {classic.fullText}
                  </p>
                </div>
              )}
              
              <div className="flex justify-between items-center mt-6">
                <span className="text-sm font-bold text-gray-500">{classic.author}</span>
                {classic.fullText && (
                  <button 
                    onClick={() => setExpandedId(isExpanded ? null : classic.id)}
                    className={cn(
                    "text-sm font-bold border-b transition-colors",
                    classic.category === '동양' ? "text-[#A67C52] border-[#A67C52] hover:text-[#8a6541] hover:border-[#8a6541]" : "text-[#2C3E50] border-[#2C3E50] hover:text-[#1a252f] hover:border-[#1a252f]"
                  )}>
                    {isExpanded ? "접기" : "전문 읽기"}
                  </button>
                )}
              </div>
            </div>
          )})
        )}
        
        {!isLoading && filteredClassics.length === 0 && (
          <div className="text-center py-12 text-gray-400 font-medium">
            오늘의 고전 데이터를 불러오지 못했습니다.
          </div>
        )}
      </div>
    </div>
  );
}
