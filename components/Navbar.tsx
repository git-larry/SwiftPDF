'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { HomeIcon, WrenchScrewdriverIcon, LanguageIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const handleHomeClick = () => {
    router.push('/');
    setIsMenuOpen(false);
  };

  const handleToolsClick = () => {
    // Si estamos en la página principal, hacer scroll a herramientas
    if (window.location.pathname === '/') {
      scrollToSection('tools');
    } else {
      // Si estamos en otra página, ir a la principal y luego scroll
      router.push('/#tools');
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                SwiftPDF
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" onClick={handleHomeClick} className="flex items-center gap-2">
              <HomeIcon className="h-4 w-4" />
              {t('navigation.home')}
            </Button>
            <Button variant="ghost" onClick={handleToolsClick} className="flex items-center gap-2">
              <WrenchScrewdriverIcon className="h-4 w-4" />
              {t('navigation.tools')}
            </Button>
            
            {/* Language Selector */}
            <div className="relative">
              <Button
                variant="ghost"
                className="flex items-center gap-2"
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
              >
                <LanguageIcon className="h-4 w-4" />
                {t('navigation.language')}
                <ChevronDownIcon className="h-3 w-3" />
              </Button>
              
              {isLanguageMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md shadow-lg z-50">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setLanguage('es');
                        setIsLanguageMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-700 ${
                        language === 'es' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      🇪🇸 Español
                    </button>
                    <button
                      onClick={() => {
                        setLanguage('en');
                        setIsLanguageMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-700 ${
                        language === 'en' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      🇺🇸 English
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Button
                variant="ghost"
                className="w-full text-left flex items-center gap-2"
                onClick={handleHomeClick}
              >
                <HomeIcon className="h-4 w-4" />
                {t('navigation.home')}
              </Button>
              <Button
                variant="ghost"
                className="w-full text-left flex items-center gap-2"
                onClick={handleToolsClick}
              >
                <WrenchScrewdriverIcon className="h-4 w-4" />
                {t('navigation.tools')}
              </Button>
              
              {/* Mobile Language Options */}
              <div className="pt-2 border-t border-gray-200 dark:border-slate-700">
                <p className="px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('navigation.language')}
                </p>
                <button
                  onClick={() => {
                    setLanguage('es');
                    setIsMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm ${
                    language === 'es' ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  🇪🇸 Español
                </button>
                <button
                  onClick={() => {
                    setLanguage('en');
                    setIsMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm ${
                    language === 'en' ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  🇺🇸 English
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}