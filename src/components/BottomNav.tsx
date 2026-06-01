import { BookOpen, Newspaper, Bell, Film, BookText } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function BottomNav() {
  const navItems = [
    { name: '사설', path: '/', icon: Newspaper },
    { name: '고전', path: '/classics', icon: BookOpen },
    { name: '영화', path: '/movies', icon: Film },
    { name: '도서', path: '/books', icon: BookText },
    { name: '구독', path: '/settings', icon: Bell },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#EAE4DD] pb-safe pt-2 px-6 safe-area-bottom">
      <ul className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => (
          <li key={item.path} className="flex-1">
            <NavLink
              to={item.path}
              className={({ isActive }) => cn(
                "flex flex-col items-center p-2 transition-colors",
                isActive ? "text-[#4A90E2]" : "text-gray-400 hover:text-[#1A1A1A]"
              )}
            >
              <item.icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.name}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
