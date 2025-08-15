'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import ToolCard from '../components/ToolCard';
import ProcessingHistory from '../components/ProcessingHistory';
import toolsData from '../data/tools.json';
import { useLanguage } from '../contexts/LanguageContext';
import {
  BoltIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  GlobeAltIcon,
  DocumentIcon,
  UsersIcon,
  StarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { language, t } = useLanguage();

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(toolsData.map(tool => tool.category)));
    return cats;
  }, []);

  // Filter tools based on search and category
  const filteredTools = useMemo(() => {
    return toolsData.filter(tool => {
      // Use appropriate language fields
      const title = language === 'en' ? tool.titleEn : tool.title;
      const description = language === 'en' ? tool.descriptionEn : tool.description;
      const keywords = language === 'en' ? tool.keywordsEn : tool.keywords;
      const category = language === 'en' ? tool.categoryEn : tool.category;
      
      const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           keywords.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, language]);

  // Estadísticas simuladas (en una app real vendrían de analytics)
  const stats = {
    totalTools: toolsData.length,
    documentsProcessed: '50,000+',
    usersServed: '10,000+',
    averageRating: 4.8
  };

  // Testimonios
  const testimonials = language === 'en' ? [
    {
      name: "Maria González",
      role: "Graphic Designer",
      content: "SwiftPDF has saved me hours of work. The PDF merge tool is incredibly fast.",
      rating: 5
    },
    {
      name: "Carlos Rodriguez",
      role: "Student",
      content: "Perfect for compressing my documents before uploading. And it's completely free!",
      rating: 5
    },
    {
      name: "Ana Martinez",
      role: "Lawyer",
      content: "Privacy is essential in my work. I love that everything is processed locally.",
      rating: 5
    }
  ] : [
    {
      name: "María González",
      role: "Diseñadora Gráfica",
      content: "SwiftPDF me ha ahorrado horas de trabajo. La herramienta de unir PDFs es increíblemente rápida.",
      rating: 5
    },
    {
      name: "Carlos Rodríguez",
      role: "Estudiante",
      content: "Perfecto para comprimir mis documentos antes de subirlos. Y es completamente gratis!",
      rating: 5
    },
    {
      name: "Ana Martínez",
      role: "Abogada",
      content: "La privacidad es fundamental en mi trabajo. Me encanta que todo se procese localmente.",
      rating: 5
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
                {t('hero.title')}
              </span>
              <br />
              <span className="text-3xl md:text-4xl">
                {t('hero.subtitle')}
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              {t('hero.description')}
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-sm">
                <BoltIcon className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {t('features.fast')}
                </span>
              </div>
              <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-sm">
                <ShieldCheckIcon className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {t('features.private')}
                </span>
              </div>
              <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-sm">
                <RocketLaunchIcon className="h-5 w-5 text-purple-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {t('features.free')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-20" id="tools">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Herramientas PDF
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
              Selecciona la herramienta que necesitas para procesar tus archivos PDF de forma rápida y segura.
            </p>

            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>

          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onChange={setSelectedCategory}
          />

          {/* Results Info */}
          {searchTerm && (
            <div className="text-center mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                {filteredTools.length} resultados para &quot;{searchTerm}&quot;
              </p>
            </div>
          )}

          {/* Tools Grid */}
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <GlobeAltIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                No se encontraron resultados
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Intenta con otros términos de búsqueda o explora todas las herramientas.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Ver todas las herramientas
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Processing History Section */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <ProcessingHistory />
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              SwiftPDF en Números
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Confiado por miles de usuarios en todo el mundo
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {stats.totalTools}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Herramientas PDF
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                {stats.documentsProcessed}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Documentos Procesados
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {stats.usersServed}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Usuarios Satisfechos
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                {stats.averageRating}★
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Calificación Promedio
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              ¿Por qué elegir SwiftPDF?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Diseñado pensando en tu privacidad, velocidad y facilidad de uso.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <RocketLaunchIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Gratuito
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Todas las herramientas son completamente gratuitas sin límites de uso.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Privado
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Tus archivos se procesan localmente en tu navegador, nunca se envían a servidores.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BoltIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Rápido
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Procesamiento instantáneo de archivos PDF sin esperas ni colas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-green-50 dark:from-slate-800 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Lo que dicen nuestros usuarios
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Miles de personas confían en SwiftPDF para sus necesidades de procesamiento PDF
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4 italic">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div className="border-t pt-4">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 dark:bg-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ¿Listo para procesar tus PDFs?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Comienza ahora mismo con nuestras herramientas gratuitas y seguras
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#tools"
              className="inline-flex items-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              <DocumentIcon className="h-5 w-5 mr-2" />
              Ver Herramientas
            </a>
            <Link
              href="/unir-pdf"
              className="inline-flex items-center px-8 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-400 transition-colors"
            >
              <RocketLaunchIcon className="h-5 w-5 mr-2" />
              Empezar Ahora
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-gray-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex items-center justify-center space-x-3">
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
              <span className="text-gray-700 dark:text-gray-300">
                100% Procesamiento Local
              </span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
              <span className="text-gray-700 dark:text-gray-300">
                Sin Registro Requerido
              </span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
              <span className="text-gray-700 dark:text-gray-300">
                Completamente Gratuito
              </span>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}