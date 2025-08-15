'use client';

import React from 'react';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onChange: (category: string) => void;
}

const categoryTranslations: { [key: string]: string } = {
  'all': 'Todas',
  'edicion': 'Edición',
  'conversion': 'Conversión',
  'seguridad': 'Seguridad',
  'avanzado': 'Avanzado'
};

export default function CategoryFilter({ categories, selectedCategory, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-8">
      <button
        onClick={() => onChange('all')}
        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
          selectedCategory === 'all'
            ? 'bg-blue-600 text-white shadow-lg'
            : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-slate-600'
        }`}
      >
        {categoryTranslations['all']}
      </button>
      
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onChange(category)}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            selectedCategory === category
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-slate-600'
          }`}
        >
          {categoryTranslations[category] || category}
        </button>
      ))}
    </div>
  );
}