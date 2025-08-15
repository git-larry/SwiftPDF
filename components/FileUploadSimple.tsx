'use client';

import React, { useRef, useState } from 'react';
import { CloudArrowUpIcon, DocumentIcon, XMarkIcon, EyeIcon } from '@heroicons/react/24/outline';
import PDFPreview from './PDFPreview';
import { usePDFPreview } from '@/hooks/usePDFPreview';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  acceptedFileTypes: string[];
  maxFiles?: number;
  maxSize?: number; // in bytes
  showPreview?: boolean;
}

export default function FileUploadSimple({
  onFileSelect,
  acceptedFileTypes,
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024, // 50MB
  showPreview = false
}: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isPreviewOpen, previewFile, openPreview, closePreview } = usePDFPreview();

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const validFiles: File[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validar tipo de archivo
      const isValidType = acceptedFileTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        return file.type === type;
      });
      
      // Validar tamaño
      const isValidSize = file.size <= maxSize;
      
      if (isValidType && isValidSize) {
        validFiles.push(file);
      }
    }

    const newFiles = [...selectedFiles, ...validFiles].slice(0, maxFiles);
    setSelectedFiles(newFiles);
    onFileSelect(newFiles);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    return <DocumentIcon className="h-8 w-8 text-gray-400" />;
  };

  return (
    <div className="w-full">
      {/* Zona de carga */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive 
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          hover:bg-gray-50 dark:hover:bg-slate-700/50
        `}
      >
        <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {isDragActive ? 'Suelta los archivos aquí' : 'Arrastra archivos aquí o haz clic para seleccionar'}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Máximo {maxFiles} archivo{maxFiles > 1 ? 's' : ''} • Hasta {formatFileSize(maxSize)} por archivo
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple={maxFiles > 1}
          accept={acceptedFileTypes.join(',')}
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {/* Lista de archivos seleccionados */}
      {selectedFiles.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Archivos seleccionados ({selectedFiles.length})
          </h4>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getFileIcon(file)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {/* Botón de vista previa para PDFs */}
                  {showPreview && file.type === 'application/pdf' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreviewFile(file);
                      }}
                      className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Vista previa"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  )}
                  
                  {/* Botón eliminar */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    title="Eliminar archivo"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de vista previa PDF */}
      {isPreviewOpen && previewFile && (
        <PDFPreview
          file={previewFile}
          isOpen={isPreviewOpen}
          onClose={closePreview}
        />
      )}
    </div>
  );
}