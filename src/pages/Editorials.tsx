import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import DOMPurify from 'dompurify';
import { ArrowLeft, ExternalLink } from 'lucide-react';

interface Editorial {
  id: string;
  publisher: string;
  title: string;
  link: string;
  pubDate: string;
  contentSnippet: string;
}

interface ArticleDetail {
  title: string;
  content: string;
  byline: string;
  originalUrl: string;
}

export default function Editorials() {
  const [editorials, setEditorials] = useState<Editorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [readArticles, setReadArticles] = useState<Set<string>>(new Set());
  
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedPublisher, setSelectedPublisher] = useState<string>('all');

  // Use effect to update selectedDate when editorials load if the current selectedDate isn't in the available dates
  useEffect(() => {
    if (editorials.length > 0) {
      const availableDates = Array.from(new Set(editorials.map(e => format(new Date(e.pubDate), 'yyyy-MM-dd'))));
      if (!availableDates.includes(selectedDate) && availableDates.length > 0) {
        // Find the most recent date available
        availableDates.sort((a, b) => b.localeCompare(a));
        setSelectedDate(availableDates[0]);
      }
    }
  }, [editorials, selectedDate]);
  const [selectedArticle, setSelectedArticle] = useState<Editorial | null>(null);
  const [articleDetail, setArticleDetail] = useState<ArticleDetail | null>(null);
  const [articleLoading, setArticleLoading] = useState(false);
  const [articleError, setArticleError] = useState('');
  
  const lastFetchTime = useRef<number>(Date.now());

  useEffect(() => {
    // Load read articles from localStorage
    const savedRead = localStorage.getItem('readEditorials');
    if (savedRead) {
      try {
        setReadArticles(new Set(JSON.parse(savedRead)));
      } catch (e) {
        console.error('Failed to parse read articles', e);
      }
    }

    const fetchEditorials = () => {
      setFetchFailed(false);
      fetch('/api/editorials')
        .then(async res => {
          if (!res.ok) {
             const errData = await res.json().catch(() => null);
             throw new Error(errData?.details || 'API failed');
          }
          return res.json();
        })
        .then(data => {
          setEditorials(data);
          setLoading(false);
          lastFetchTime.current = Date.now();
        })
        .catch(err => {
          console.error("error fetching", err);
          setLoading(false);
          setFetchFailed(true);
          setErrorMessage(err.message);
        });
    };

    fetchEditorials();

    // 1시간(60분 * 60초 * 1000밀리초) 주기로 자동 갱신
    const interval = setInterval(fetchEditorials, 60 * 60 * 1000);

    // 모바일 등에서 화면이 켜지거나(잠금 해제) 앱/탭으로 돌아왔을 때 확인
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        // 마지막 업데이트 이후 1시간(또는 일정 시간)이 지났으면 즉시 갱신
        if (now - lastFetchTime.current >= 60 * 60 * 1000) {
          fetchEditorials();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const openArticle = async (article: Editorial) => {
    setSelectedArticle(article);
    setArticleLoading(true);
    setArticleError('');
    setArticleDetail(null);
    
    // Mark as read
    setReadArticles(prev => {
      const next = new Set(prev);
      next.add(article.link);
      localStorage.setItem('readEditorials', JSON.stringify(Array.from(next)));
      return next;
    });
    
    try {
      const res = await fetch(`/api/article?url=${encodeURIComponent(article.link)}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || errorData?.details || 'Failed to load article');
      }
      const data = await res.json();
      setArticleDetail(data);
    } catch (err: any) {
      console.error(err);
      setArticleError(`본문을 불러오는 데 실패했습니다. (${err.message})`);
    } finally {
      setArticleLoading(false);
    }
  };

  const closeArticle = () => {
    setSelectedArticle(null);
    setArticleDetail(null);
  };

  if (selectedArticle) {
    return (
      <div className="fixed inset-0 z-50 bg-[#FCFAF7] overflow-y-auto w-full h-full pb-24">
        <header className="sticky top-0 bg-[#FCFAF7]/90 backdrop-blur-sm border-b border-[#EAE4DD] p-4 flex items-center justify-between z-10 w-full mb-6 text-[#1A1A1A]">
          <button onClick={closeArticle} className="p-2 -ml-2 rounded-full hover:bg-black/5" aria-label="Go back">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="text-base font-bold truncate mx-4 flex-1 text-center">
            {selectedArticle.publisher}
          </div>
          {articleDetail?.originalUrl ? (
             <a href={articleDetail.originalUrl} target="_blank" rel="noopener noreferrer" className="p-2 -mr-2 rounded-full hover:bg-black/5" aria-label="Open original">
              <ExternalLink className="w-5 h-5" />
             </a>
          ) : <div className="w-9" />}
        </header>

        <article className="px-4 max-w-2xl lg:max-w-4xl mx-auto">
          <div className="border-b border-[#EAE4DD] pb-6 mb-6 mt-4">
            <h1 className="text-3xl font-serif leading-snug font-bold text-[#1A1A1A] mb-3">
              {articleDetail ? articleDetail.title : selectedArticle.title}
            </h1>
            <div className="text-base text-gray-500 font-mono tracking-tighter">
              {format(new Date(selectedArticle.pubDate), 'yyyy-MM-dd HH:mm')}
            </div>
          </div>

          {articleLoading && (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-[#F5F1ED] rounded w-full"></div>
              <div className="h-4 bg-[#F5F1ED] rounded w-11/12"></div>
              <div className="h-4 bg-[#F5F1ED] rounded w-full"></div>
              <div className="h-4 bg-[#F5F1ED] rounded w-5/6"></div>
              <div className="h-4 bg-[#F5F1ED] rounded w-full"></div>
            </div>
          )}

          {articleError && (
            <div className="text-center py-10">
              <p className="text-red-500 mb-4">{articleError}</p>
              <a href={selectedArticle.link} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 bg-[#1A1A1A] text-white rounded font-medium">원문 사이트에서 보기</a>
            </div>
          )}

          {articleDetail && articleDetail.content && (
            <div 
              className="prose prose-stone max-w-none text-[17px] leading-[1.8] font-serif text-[#333] [&_p]:mb-6 [&_p:empty]:hidden [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md [&_img]:!m-0 [&_figure]:!m-0 [&_figcaption]:!mt-2 [&_figcaption]:!mb-8 [&_figcaption]:text-[15px] [&_figcaption]:text-gray-500 [&_figcaption]:leading-snug [&_em]:block [&_em]:mb-8 [&_em]:not-italic [&_em]:text-[15px] [&_em]:text-gray-500 [&_.img_desc]:block [&_.img_desc]:!mt-2 [&_.img_desc]:mb-8 [&_div:has(>picture)]:!m-0 [&_div:has(>img)]:!m-0 [&_a]:text-blue-600 [&_picture]:block [&_picture_img]:!m-0"
              dangerouslySetInnerHTML={{ 
                __html: DOMPurify.sanitize(articleDetail.content, {
                  ADD_ATTR: ['referrerpolicy', 'loading', 'data-src', 'data-original', 'org-src', 'data-lazy-src', 'data-actual-src', 'data-alt-src', 'style']
                }) 
              }}
            />
          )}
        </article>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-6 px-4 max-w-2xl lg:max-w-4xl mx-auto min-h-screen">
      <header className="mb-6 flex flex-col gap-4 border-b border-[#EAE4DD] pb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-[#1A1A1A]">오늘의 사설</h1>
          <p className="text-base text-gray-500 mt-1">
            {format(new Date(), 'yyyy년 M월 d일 eeee', { locale: ko })}
          </p>
        </div>
        {!loading && editorials.length > 0 && (
          <div className="flex flex-wrap gap-2 text-sm">
            <select 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-[#F5F1ED] border-none rounded px-3 py-2 text-[#1A1A1A] font-medium outline-none"
            >
              {Array.from(new Set(editorials.map(e => format(new Date(e.pubDate), 'yyyy-MM-dd'))))
                .sort((a, b) => b.localeCompare(a))
                .map(date => (
                <option key={date} value={date}>{date}</option>
              ))}
            </select>
            <select
              value={selectedPublisher}
              onChange={(e) => setSelectedPublisher(e.target.value)}
              className="bg-[#F5F1ED] border-none rounded px-3 py-2 text-[#1A1A1A] font-medium outline-none"
            >
              <option value="all">모든 언론사</option>
              {Array.from(new Set(editorials.map(e => e.publisher)))
                .sort()
                .map(pub => (
                <option key={pub} value={pub}>{pub}</option>
              ))}
            </select>
          </div>
        )}
      </header>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse border-b border-[#EAE4DD] pb-6">
              <div className="h-4 bg-[#F5F1ED] rounded w-1/4 mb-3"></div>
              <div className="h-6 bg-[#F5F1ED] rounded w-3/4 mb-4"></div>
              <div className="h-12 bg-[#F5F1ED] rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : (() => {
        const filteredEditorials = editorials.filter(article => {
          const articleDate = format(new Date(article.pubDate), 'yyyy-MM-dd');
          const dateMatch = articleDate === selectedDate;
          const publisherMatch = selectedPublisher === 'all' || article.publisher === selectedPublisher;
          return dateMatch && publisherMatch;
        });
        
        if (filteredEditorials.length > 0) {
          return (
            <div className="space-y-6">
              {filteredEditorials.map(article => (
                <div 
                  key={article.id} 
                  onClick={() => openArticle(article)}
                  className="block border-b border-[#EAE4DD] pb-6 last:border-0 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs px-2 py-0.5 bg-[#1A1A1A] text-white rounded font-bold">
                      {article.publisher}
                    </span>
                    <span className="text-sm text-gray-500 font-mono tracking-tighter">
                      {format(new Date(article.pubDate), 'yyyy-MM-dd HH:mm')}
                    </span>
                  </div>
                  <h2 className={`text-xl font-serif leading-snug font-bold transition-colors ${
                    readArticles.has(article.link) ? 'text-gray-400' : 'text-[#1A1A1A]'
                  }`}>
                    {article.title}
                  </h2>
                </div>
              ))}
            </div>
          );
        } else if (fetchFailed) {
          return (
            <div className="text-center text-red-500 mt-20">
              데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
              {errorMessage && <p className="text-sm mt-2 opacity-70">Error: {errorMessage}</p>}
            </div>
          );
        } else {
          return (
            <div className="text-center text-gray-500 mt-20">
              현재 등록된 오늘의 사설이 없습니다.
            </div>
          );
        }
      })()}
    </div>
  );
}
