'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DocumentDuplicateIcon,
  ScissorsIcon,
  ArchiveBoxArrowDownIcon,
  PhotoIcon,
  DocumentTextIcon,
  TableCellsIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  EyeSlashIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';

interface Tool {
  slug: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  keywords: string;
  keywordsEn: string;
  category: string;
  categoryEn: string;
  icon: string;
  benefits: string[];
  benefitsEn: string[];
}

interface ToolCardProps {
  tool: Tool;
}

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  'document-duplicate': DocumentDuplicateIcon,
  'scissors': ScissorsIcon,
  'archive-box-arrow-down': ArchiveBoxArrowDownIcon,
  'photo': PhotoIcon,
  'document-text': DocumentTextIcon,
  'table-cells': TableCellsIcon,
  'shield-check': ShieldCheckIcon,
  'lock-closed': LockClosedIcon,
  'eye-slash': EyeSlashIcon,
  'document': DocumentIcon
};

const categoryTranslations: { [key: string]: string } = {
  'edicion': 'Edición',
  'conversion': 'Conversión',
  'seguridad': 'Seguridad'
};

export default function ToolCard({ tool }: ToolCardProps) {
  const IconComponent = iconMap[tool.icon] || DocumentIcon;
  
  return (
    <Link href={`/${tool.slug}`} className="block">
      <Card className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <div className="text-blue-600 dark:text-blue-400">
              <IconComponent className="w-8 h-8" />
            </div>
            <Badge variant="secondary" className="text-xs">
              {categoryTranslations[tool.category] || tool.category}
            </Badge>
          </div>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            {tool.title}
          </CardTitle>
          <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
            {tool.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {tool.benefits.slice(0, 2).map((benefit, index) => (
              <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <svg
                  className="w-4 h-4 text-green-500 mr-2 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}