'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudArrowUpIcon, DocumentIcon, XMarkIcon, EyeIcon } from '@heroicons/react/24/outline';
import PDFPreview from './PDFPreview';
import { usePDFPreview } from '@/hooks/usePDFPreview';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  acceptedFileTypes: string[];
  maxFiles?: number;
  maxSize?: number; // in bytes
  showPreview?: boolean; // Nueva prop para habilitar vista previa
}

export default function FileUpload({
  onFileSelect,
  acceptedFileTypes,
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024, // 50MB
  showPreview = false
}: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { isPreviewOpen, previewFile, openPreview, closePreview } = usePDFPreview();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = [...selectedFiles, ...acceptedFiles].slice(0, maxFiles);
    setSelectedFiles(newFiles);
    onFileSelect(newFiles);
  }, [selectedFiles, maxFiles, onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    multiple: maxFiles > 1
  });

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFileSelect(newFiles);
  };

  const handlePreviewFile = (file: File) => {
    try {
      openPreview(file);
    } catch (error) {
      console.error('Error al abrir vista previa:', error);
    }
  };

  const isPDFFile = (file: File): boolean => {
    return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-slate-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-slate-700/50'
        }`}
      >
        <input {...getInputProps()} />
        
        <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
            {isDragActive ? 'Suelta los archivos aquí' : 'Arrastra y suelta archivos aquí'}
          </p>
          <p className="text-gray-500 dark:text-gray-400">o</p>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Seleccionar archivos
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          <p>Formatos soportados: {acceptedFileTypes.join(', ')}</p>
          <p>Tamaño máximo: {Math.round(maxSize / 1024 / 1024)}MB por archivo</p>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
            Archivos seleccionados ({selectedFiles.length})
          </h3>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <DocumentIcon className="h-8 w-8 text-blue-500" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {showPreview && isPDFFile(file) && (
                    <button
                      onClick={() => handlePreviewFile(file)}
                      className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                      title="Vista previa"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Eliminar archivo"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vista previa de PDF */}
      {isPreviewOpen && previewFile && (
        <PDFPreview file={previewFile} onClose={closePreview} />
      )}
    </div>
  );
}