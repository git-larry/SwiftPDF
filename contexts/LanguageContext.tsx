'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Traducciones embebidas para evitar problemas de carga
const translations = {
  es: {
    'navigation.home': 'Inicio',
    'navigation.tools': 'Herramientas',
    'navigation.language': 'Español',
    'site.title': 'SwiftPDF',
    'site.tagline': 'Herramientas PDF Online',
    'site.description': 'Convierte y edita archivos PDF de forma rápida y segura. Todas las herramientas que necesitas en un solo lugar.',
    'hero.title': 'SwiftPDF',
    'hero.subtitle': 'Herramientas PDF Online',
    'hero.description': 'Convierte y edita archivos PDF de forma rápida y segura. Todas las herramientas que necesitas en un solo lugar.',
    'hero.cta': 'Ver Herramientas',
    'features.fast': 'Rápido',
    'features.private': 'Privado',
    'features.free': 'Gratuito',
    'features.free.title': 'Gratuito',
    'features.free.description': 'Todas las herramientas son completamente gratuitas sin límites de uso.',
    'features.private.title': 'Privado',
    'features.private.description': 'Tus archivos se procesan localmente en tu navegador, nunca se envían a servidores.',
    'features.fast.title': 'Rápido',
    'features.fast.description': 'Procesamiento instantáneo de archivos PDF sin esperas ni colas.',
    'stats.title': 'SwiftPDF en Números',
    'stats.description': 'Confiado por miles de usuarios en todo el mundo',
    'stats.tools': 'Herramientas PDF',
    'stats.documents': 'Documentos Procesados',
    'stats.users': 'Usuarios Satisfechos',
    'stats.rating': 'Calificación Promedio',
    'testimonials.title': 'Lo que dicen nuestros usuarios',
    'testimonials.description': 'Miles de personas confían en SwiftPDF para sus necesidades de procesamiento PDF',
    'cta.title': '¿Listo para procesar tus PDFs?',
    'cta.description': 'Comienza ahora mismo con nuestras herramientas gratuitas y seguras',
    'cta.tools': 'Ver Herramientas',
    'cta.start': 'Empezar Ahora',
    'trust.local': '100% Procesamiento Local',
    'trust.noregister': 'Sin Registro Requerido',
    'trust.free': 'Completamente Gratuito',
    'tools.title': 'Herramientas PDF',
    'tools.description': 'Selecciona la herramienta que necesitas para procesar tus archivos PDF de forma rápida y segura.',
    'search.placeholder': 'Buscar herramientas...',
    'search.results': 'resultados para',
    'search.noResults': 'No se encontraron resultados',
    'search.tryAgain': 'Intenta con otros términos de búsqueda o explora todas las herramientas.',
    'search.viewAll': 'Ver todas las herramientas',
    'categories.all': 'Todas',
    'categories.conversion': 'Conversión',
    'categories.edicion': 'Edición',
    'categories.seguridad': 'Seguridad',
    'history.title': 'Historial de Procesamiento',
    'history.description': 'Aquí aparecerán los archivos que hayas procesado',
    'history.empty': 'No has procesado ningún archivo aún',
    'history.emptyDescription': 'Usa cualquiera de nuestras herramientas para comenzar',
    'history.clear': 'Limpiar',
    'history.total': 'Total',
    'history.successful': 'Exitosos',
    'history.errors': 'Errores',
    'history.success': 'Éxito',
    'history.confirmClear': '¿Estás seguro de que quieres limpiar todo el historial?',
    'history.cancel': 'Cancelar',
    'history.confirm': 'Confirmar',
    'history.statusSuccess': 'Exitoso',
    'history.statusError': 'Error',
    'history.showing': 'Mostrando los últimos',
    'history.files': 'archivos procesados'
  },
  en: {
    'navigation.home': 'Home',
    'navigation.tools': 'Tools',
    'navigation.language': 'English',
    'site.title': 'SwiftPDF',
    'site.tagline': 'PDF Tools Online',
    'site.description': 'Convert and edit PDF files quickly and securely. All the tools you need in one place.',
    'hero.title': 'SwiftPDF',
    'hero.subtitle': 'PDF Tools Online',
    'hero.description': 'Convert and edit PDF files quickly and securely. All the tools you need in one place.',
    'hero.cta': 'View Tools',
    'features.fast': 'Fast',
    'features.private': 'Private',
    'features.free': 'Free',
    'features.free.title': 'Free',
    'features.free.description': 'All tools are completely free with no usage limits.',
    'features.private.title': 'Private',
    'features.private.description': 'Your files are processed locally in your browser, never sent to servers.',
    'features.fast.title': 'Fast',
    'features.fast.description': 'Instant PDF file processing with no waiting or queues.',
    'stats.title': 'SwiftPDF in Numbers',
    'stats.description': 'Trusted by thousands of users worldwide',
    'stats.tools': 'PDF Tools',
    'stats.documents': 'Documents Processed',
    'stats.users': 'Satisfied Users',
    'stats.rating': 'Average Rating',
    'testimonials.title': 'What our users say',
    'testimonials.description': 'Thousands of people trust SwiftPDF for their PDF processing needs',
    'cta.title': 'Ready to process your PDFs?',
    'cta.description': 'Start right now with our free and secure tools',
    'cta.tools': 'View Tools',
    'cta.start': 'Start Now',
    'trust.local': '100% Local Processing',
    'trust.noregister': 'No Registration Required',
    'trust.free': 'Completely Free',
    'tools.title': 'PDF Tools',
    'tools.description': 'Select the tool you need to process your PDF files quickly and securely.',
    'search.placeholder': 'Search tools...',
    'search.results': 'results for',
    'search.noResults': 'No results found',
    'search.tryAgain': 'Try other search terms or explore all tools.',
    'search.viewAll': 'View all tools',
    'categories.all': 'All',
    'categories.conversion': 'Conversion',
    'categories.editing': 'Editing',
    'categories.security': 'Security',
    'history.title': 'Processing History',
    'history.description': 'Files you have processed will appear here',
    'history.empty': 'You haven\'t processed any files yet',
    'history.emptyDescription': 'Use any of our tools to get started',
    'history.clear': 'Clear',
    'history.total': 'Total',
    'history.successful': 'Successful',
    'history.errors': 'Errors',
    'history.success': 'Success',
    'history.confirmClear': 'Are you sure you want to clear all history?',
    'history.cancel': 'Cancel',
    'history.confirm': 'Confirm',
    'history.statusSuccess': 'Successful',
    'history.statusError': 'Error',
    'history.showing': 'Showing the last',
    'history.files': 'processed files'
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>('es');

  // Cargar idioma del localStorage al inicializar
  useEffect(() => {
    const savedLanguage = localStorage.getItem('swiftpdf_language') as Language;
    if (savedLanguage && (savedLanguage === 'es' || savedLanguage === 'en')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Guardar idioma en localStorage cuando cambie
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('swiftpdf_language', lang);
  };

  // Función de traducción
  const t = (key: string): string => {
    const translation = translations[language][key as keyof typeof translations[typeof language]];
    return translation || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}