import { useState } from 'react';
import { classicsData } from '@/data/classics';
import { cn } from '@/lib/utils';
import { Quote, X } from 'lucide-react';

export default function Classics() {
  const [filter, setFilter] = useState<'전체' | '동양' | '서양'>('전체');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filteredClassics = filter === '전체' 
    ? classicsData 
    : classicsData.filter(c => c.category === filter);

  return (
    <div className="pb-24 pt-6 px-4 max-w-2xl lg:max-w-4xl mx-auto min-h-screen">
      <header className="mb-6 flex items-center justify-between border-b border-[#EAE4DD] pb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold tracking-tight text-[#1A1A1A]">고전 큐레이션</h1>
          <p className="text-sm text-gray-500 mt-1">시대를 초월한 지혜의 통찰</p>
        </div>
      </header>

      <div className="flex gap-4 mb-6">
        {['전체', '동양', '서양'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={cn(
              "px-1 py-1.5 text-sm font-medium transition-colors border-b-2 bg-transparent rounded-none",
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
        {filteredClassics.map((classic) => {
          const isExpanded = expandedId === classic.id;
          
          return (
          <div key={classic.id} className="bg-white p-6 rounded-2xl shadow-sm border border-[#EAE4DD] relative overflow-hidden transition-all duration-300">
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-widest mb-2 block",
              classic.category === '동양' ? "text-[#A67C52]" : "text-[#2C3E50]"
            )}>
              {classic.category} Classic
            </span>
            <div className="flex justify-between items-start">
              <h4 className="text-xl font-serif font-bold mb-1 text-[#1A1A1A]">{classic.title}</h4>
            </div>
            <p className="text-sm text-gray-500 mb-4 italic">
              "{classic.quote}"
            </p>
            <div className="h-px bg-[#EAE4DD] w-full mb-4"></div>
            <p className="text-sm leading-relaxed text-gray-600 mb-5">
              {classic.content}
            </p>
            
            {isExpanded && (classic as any).fullText && (
              <div className="mt-4 pt-4 border-t border-[#EAE4DD]/50">
                <p className="text-[15px] leading-relaxed text-[#1A1A1A] font-serif whitespace-pre-wrap">
                  {(classic as any).fullText}
                </p>
              </div>
            )}
            
            <div className="flex justify-between items-center mt-6">
              <span className="text-xs font-bold text-gray-500">{classic.author}</span>
              <button 
                onClick={() => setExpandedId(isExpanded ? null : classic.id)}
                className={cn(
                "text-xs font-bold border-b transition-colors",
                classic.category === '동양' ? "text-[#A67C52] border-[#A67C52] hover:text-[#8a6541] hover:border-[#8a6541]" : "text-[#2C3E50] border-[#2C3E50] hover:text-[#1a252f] hover:border-[#1a252f]"
              )}>
                {isExpanded ? "접기" : "전문 읽기"}
              </button>
            </div>
          </div>
        )})}
      </div>
    </div>
  );
}
