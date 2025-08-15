'use client';

import { useState, useCallback } from 'react';

interface PDFPreviewState {
  isOpen: boolean;
  file: File | null;
}

export function usePDFPreview() {
  const [previewState, setPreviewState] = useState<PDFPreviewState>({
    isOpen: false,
    file: null
  });

  const openPreview = useCallback((file: File) => {
    // Validar que sea un archivo PDF
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error('Solo se pueden previsualizar archivos PDF');
    }

    setPreviewState({
      isOpen: true,
      file
    });
  }, []);

  const closePreview = useCallback(() => {
    setPreviewState({
      isOpen: false,
      file: null
    });
  }, []);

  return {
    isPreviewOpen: previewState.isOpen,
    previewFile: previewState.file,
    openPreview,
    closePreview
  };
}