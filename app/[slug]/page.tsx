'use client';

import { useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import toolsData from '@/data/tools.json';
import MergePDFTool from '@/components/tools/MergePDFTool';
import SplitPDFTool from '@/components/tools/SplitPDFTool';
import CompressPDFTool from '@/components/tools/CompressPDFTool';
import ImageToPDFTool from '@/components/tools/ImageToPDFTool';
import RotatePDFTool from '@/components/tools/RotatePDFTool';
import DeletePagesPDFTool from '@/components/tools/DeletePagesPDFTool';
import ProtectPDFTool from '@/components/tools/ProtectPDFTool';
import UnlockPDFTool from '@/components/tools/UnlockPDFTool';
import WordToPDFTool from '@/components/tools/WordToPDFTool';
import ExcelToPDFTool from '@/components/tools/ExcelToPDFTool';
import OCRTool from '@/components/tools/OCRTool';
import WatermarkTool from '@/components/tools/WatermarkTool';
import MetadataTool from '@/components/tools/MetadataTool';

export default function ToolPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const tool = toolsData.find(t => t.slug === slug);

  if (!tool) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Herramienta no encontrada
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              La herramienta que buscas no existe.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // Renderizar componente específico según el slug
  const renderToolComponent = () => {
    switch (slug) {
      case 'unir-pdf':
        return <MergePDFTool />;
      case 'dividir-pdf':
        return <SplitPDFTool />;
      case 'comprimir-pdf':
        return <CompressPDFTool />;
      case 'convertir-jpg-a-pdf':
        return <ImageToPDFTool />;
      case 'rotar-pdf':
        return <RotatePDFTool />;
      case 'borrar-paginas-pdf':
        return <DeletePagesPDFTool />;
      case 'proteger-pdf':
        return <ProtectPDFTool />;
      case 'desproteger-pdf':
        return <UnlockPDFTool />;
      case 'convertir-word-a-pdf':
        return <WordToPDFTool />;
      case 'convertir-excel-a-pdf':
        return <ExcelToPDFTool />;
      case 'extraccion-ocr':
        return <OCRTool />;
      case 'marca-agua':
        return <WatermarkTool />;
      case 'metadatos-pdf':
        return <MetadataTool />;
      default:
        return (
          <div className="max-w-4xl mx-auto p-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {tool.title}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                {tool.description}
              </p>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {tool.category}
              </div>
              <div className="mt-8 p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-200">
                  Esta herramienta está en desarrollo. Pronto estará disponible.
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <Layout>
      {renderToolComponent()}
    </Layout>
  );
}