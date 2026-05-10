import { useState, TouchEvent } from 'react';

interface SwipeInput {
  onSwipedLeft?: () => void;
  onSwipedRight?: () => void;
  threshold?: number;
}

export function useSwipe({ onSwipedLeft, onSwipedRight, threshold = 50 }: SwipeInput) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  };

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > threshold;
    const isRightSwipe = distanceX < -threshold;

    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      if (isLeftSwipe && onSwipedLeft) {
        onSwipedLeft();
      }
      if (isRightSwipe && onSwipedRight) {
        onSwipedRight();
      }
    }
  };

  return { onTouchStart, onTouchMove, onTouchEnd };
}
