import { useState, useEffect } from 'react';
import { BellRing, Check, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSwipe } from '../lib/useSwipe';

export default function Settings() {
  const navigate = useNavigate();
  const tabSwipeHandlers = useSwipe({
    onSwipedRight: () => navigate('/classics'),
  });

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    // Check Notification permission on mount
    if ('Notification' in window && Notification.permission === 'granted') {
      setIsSubscribed(localStorage.getItem('isSubscribed') === 'true');
    }
  }, []);

  const handleSubscribe = async () => {
    if (!('Notification' in window)) {
      alert('이 브라우저는 알림을 지원하지 않습니다.');
      return;
    }

    if (Notification.permission === 'granted') {
      toggleSubscription(!isSubscribed);
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toggleSubscription(true);
      }
    } else {
      alert('브라우저 설정에서 알림 권한을 허용해주세요.');
    }
  };

  const toggleSubscription = (status: boolean) => {
    setIsSubscribed(status);
    localStorage.setItem('isSubscribed', status ? 'true' : 'false');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);

    if (status && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification('사설과 고전 구독 완료', {
          body: '매일 아침 새로운 사설과 고전 큐레이션을 알려드릴게요.',
          icon: '/vite.svg',
        });
      });
    }
  };

  return (
    <div 
      className="pb-24 pt-6 px-4 max-w-2xl lg:max-w-4xl mx-auto min-h-screen"
      {...tabSwipeHandlers}
    >
      <header className="mb-6 flex items-center justify-between border-b border-[#EAE4DD] pb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-[#1A1A1A]">구독 설정</h1>
          <p className="text-base text-gray-500 mt-1">알림을 통해 매일 지식을 채워보세요.</p>
        </div>
      </header>

      <div className="bg-white rounded-2xl border border-[#EAE4DD] overflow-hidden">
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-[#F0EBE5] p-3 rounded-full flex items-center justify-center">
              <BellRing className="w-5 h-5 text-[#4A90E2]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1A1A1A]">사설 및 고전 알림</h2>
              <p className="text-sm text-gray-500 mt-1">업데이트 될 때 기기로 알림을 받습니다.</p>
            </div>
          </div>
          <button
            onClick={handleSubscribe}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              isSubscribed ? 'bg-[#4A90E2]' : 'bg-[#EAE4DD]'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isSubscribed ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-400 text-center">
        PWA 알림(Push Notification)은 모바일 브라우저 환경에 따라 지원이 제한될 수 있습니다.<br/>
        iOS는 '홈 화면에 추가' 후 설정에서 허용해야 합니다.
      </div>

      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-full text-base flex items-center gap-2 shadow-lg animate-fade-in-down z-50">
          <Check className="w-4 h-4" />
          {isSubscribed ? '알림이 설정되었습니다.' : '알림이 해제되었습니다.'}
        </div>
      )}
    </div>
  );
}
