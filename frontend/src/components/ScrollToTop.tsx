// components/ScrollToTop.tsx
import { useEffect, useState } from 'react';
import { ArrowUpIcon } from '@heroicons/react/24/solid';
import { useSecretAccess } from '../hooks/useSecretAccess';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useSecretAccess('admin-trigger');

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      id='admin-trigger'
      className={`fixed bottom-6 right-6 z-50 p-3 rounded-full shadow-lg bg-gray-800 text-white transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      aria-label="Scroll to top"
    >
      <ArrowUpIcon className="w-5 h-5" />
    </button>
  );
}
