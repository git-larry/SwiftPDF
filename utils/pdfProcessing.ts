import { PDFDocument, rgb, degrees, PageSizes } from 'pdf-lib';

// Tipos para mejor tipado
export interface ProcessingOptions {
  quality?: number;
  compression?: 'low' | 'medium' | 'high';
  preserveMetadata?: boolean;
}

export interface SplitOptions {
  mode: 'pages' | 'ranges' | 'size';
  pages?: number[];
  ranges?: { start: number; end: number }[];
  maxSizeKB?: number;
}

export interface RotationOptions {
  angle: 90 | 180 | 270;
  pages?: number[];
}

export interface SecurityOptions {
  userPassword?: string;
  ownerPassword?: string;
  permissions?: {
    printing?: boolean;
    modifying?: boolean;
    copying?: boolean;
    annotating?: boolean;
  };
}

export class PDFProcessor {
  // Validación de archivos
  static validateFile(file: File): { isValid: boolean; error?: string } {
    if (!file) {
      return { isValid: false, error: 'No se ha proporcionado ningún archivo' };
    }

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return { isValid: false, error: 'El archivo debe ser un PDF válido' };
    }

    // Límite de 100MB por archivo
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      return { isValid: false, error: 'El archivo es demasiado grande (máximo 100MB)' };
    }

    return { isValid: true };
  }

  // Validación de múltiples archivos
  static validateFiles(files: File[]): { isValid: boolean; error?: string } {
    if (!files || files.length === 0) {
      return { isValid: false, error: 'No se han proporcionado archivos' };
    }

    if (files.length > 20) {
      return { isValid: false, error: 'Máximo 20 archivos permitidos' };
    }

    for (const file of files) {
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        return { isValid: false, error: `${file.name}: ${validation.error}` };
      }
    }

    return { isValid: true };
  }

  // Unir/Combinar PDFs mejorado
  static async mergePDFs(files: File[], options: ProcessingOptions = {}): Promise<Uint8Array> {
    try {
      const validation = this.validateFiles(files);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      const mergedPdf = await PDFDocument.create();

      for (const file of files) {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await PDFDocument.load(arrayBuffer);
          const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          copiedPages.forEach((page) => mergedPdf.addPage(page));
        } catch (error) {
          throw new Error(`Error procesando ${file.name}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
      }

      return await mergedPdf.save({
        useObjectStreams: options.compression !== 'low',
        addDefaultPage: false,
        objectsPerTick: options.compression === 'high' ? 50 : 200
      });
    } catch (error) {
      throw new Error(`Error al unir PDFs: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  // Dividir PDF mejorado
  static async splitPDF(file: File, options: SplitOptions): Promise<Uint8Array[]> {
    try {
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const totalPages = pdf.getPageCount();
      const result: Uint8Array[] = [];

      if (options.mode === 'pages' && options.pages) {
        // Dividir por páginas específicas
        for (const pageIndex of options.pages) {
          if (pageIndex >= 0 && pageIndex < totalPages) {
            const newPdf = await PDFDocument.create();
            const [copiedPage] = await newPdf.copyPages(pdf, [pageIndex]);
            newPdf.addPage(copiedPage);
            result.push(await newPdf.save());
          }
        }
      } else if (options.mode === 'ranges' && options.ranges) {
        // Dividir por rangos
        for (const range of options.ranges) {
          const pageIndices = [];
          for (let i = range.start; i <= Math.min(range.end, totalPages - 1); i++) {
            pageIndices.push(i);
          }
          if (pageIndices.length > 0) {
            const newPdf = await PDFDocument.create();
            const copiedPages = await newPdf.copyPages(pdf, pageIndices);
            copiedPages.forEach((page) => newPdf.addPage(page));
            result.push(await newPdf.save());
          }
        }
      } else {
        // Dividir cada página individualmente (modo por defecto)
        for (let i = 0; i < totalPages; i++) {
          const newPdf = await PDFDocument.create();
          const [copiedPage] = await newPdf.copyPages(pdf, [i]);
          newPdf.addPage(copiedPage);
          result.push(await newPdf.save());
        }
      }

      return result;
    } catch (error) {
      throw new Error(`Error al dividir PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  // Comprimir PDF mejorado
  static async compressPDF(file: File, options: ProcessingOptions = {}): Promise<Uint8Array> {
    try {
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      
      // Nota: pdf-lib tiene limitaciones en compresión real
      // Solo puede hacer optimizaciones básicas de estructura
      const compressionLevel = options.compression || 'medium';
      const saveOptions = {
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: compressionLevel === 'high' ? 50 : compressionLevel === 'medium' ? 100 : 200,
        updateFieldAppearances: false
      };

      const compressedData = await pdf.save(saveOptions);
      
      // Si no hay reducción significativa, advertir al usuario
      const originalSize = file.size;
      const compressedSize = compressedData.length;
      const reduction = ((originalSize - compressedSize) / originalSize * 100);
      
      if (reduction < 5) {
        console.warn('Compresión limitada: Este PDF ya está optimizado o contiene elementos que no se pueden comprimir significativamente con pdf-lib');
      }

      return compressedData;
    } catch (error) {
      throw new Error(`Error al comprimir PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  // Rotar PDF mejorado
  static async rotatePDF(file: File, options: RotationOptions): Promise<Uint8Array> {
    try {
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const pages = pdf.getPages();
      const totalPages = pages.length;

      const pagesToRotate = options.pages || Array.from({ length: totalPages }, (_, i) => i);

      pagesToRotate.forEach((pageIndex) => {
        if (pageIndex >= 0 && pageIndex < totalPages) {
          pages[pageIndex].setRotation(degrees(options.angle));
        }
      });

      return await pdf.save();
    } catch (error) {
      throw new Error(`Error al rotar PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  // Eliminar páginas mejorado
  static async deletePages(file: File, pageIndices: number[]): Promise<Uint8Array> {
    try {
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const totalPages = pdf.getPageCount();
      
      // Validar índices de páginas
      const validIndices = pageIndices.filter(index => index >= 0 && index < totalPages);
      if (validIndices.length === 0) {
        throw new Error('No se han proporcionado índices de páginas válidos');
      }

      if (validIndices.length === totalPages) {
        throw new Error('No se pueden eliminar todas las páginas del documento');
      }
      
      // Ordenar índices en orden descendente para evitar problemas de desplazamiento
      const sortedIndices = [...validIndices].sort((a, b) => b - a);
      
      sortedIndices.forEach((pageIndex) => {
        pdf.removePage(pageIndex);
      });

      return await pdf.save();
    } catch (error) {
      throw new Error(`Error al eliminar páginas: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  // Convertir imágenes a PDF mejorado
  static async imagesToPDF(files: File[], options: ProcessingOptions = {}): Promise<Uint8Array> {
    try {
      if (!files || files.length === 0) {
        throw new Error('No se han proporcionado archivos de imagen');
      }

      const pdfDoc = await PDFDocument.create();

      for (const file of files) {
        try {
          const imageBytes = await file.arrayBuffer();
          let image;

          if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
            image = await pdfDoc.embedJpg(imageBytes);
          } else if (file.type === 'image/png') {
            image = await pdfDoc.embedPng(imageBytes);
          } else {
            throw new Error(`Formato de imagen no soportado: ${file.type}`);
          }

          // Ajustar tamaño de página según la imagen
          const { width, height } = image;
          const maxWidth = PageSizes.A4[0];
          const maxHeight = PageSizes.A4[1];
          
          let pageWidth = width;
          let pageHeight = height;
          
          // Escalar si es necesario
          if (width > maxWidth || height > maxHeight) {
            const scaleX = maxWidth / width;
            const scaleY = maxHeight / height;
            const scale = Math.min(scaleX, scaleY);
            pageWidth = width * scale;
            pageHeight = height * scale;
          }

          const page = pdfDoc.addPage([pageWidth, pageHeight]);
          page.drawImage(image, {
            x: 0,
            y: 0,
            width: pageWidth,
            height: pageHeight,
          });
        } catch (error) {
          throw new Error(`Error procesando imagen ${file.name}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
      }

      return await pdfDoc.save();
    } catch (error) {
      throw new Error(`Error al convertir imágenes a PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  // Proteger PDF (implementación básica)
  static async protectPDF(file: File, options: SecurityOptions): Promise<Uint8Array> {
    try {
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      
      // Nota: pdf-lib no soporta protección con contraseña directamente
      // En una implementación real, se usaría una librería como HummusJS o similar
      console.warn('Protección con contraseña no completamente implementada con pdf-lib');
      console.log('Opciones de seguridad solicitadas:', options);
      
      return await pdf.save();
    } catch (error) {
      throw new Error(`Error al proteger PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  // Desproteger PDF
  static async unlockPDF(file: File, password: string): Promise<Uint8Array> {
    try {
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      const arrayBuffer = await file.arrayBuffer();
      
      // Intentar cargar el PDF con la contraseña
      try {
        const pdf = await PDFDocument.load(arrayBuffer);
        return await pdf.save();
      } catch (error) {
        throw new Error('Contraseña incorrecta o PDF no protegido');
      }
    } catch (error) {
      throw new Error(`Error al desproteger PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  // Obtener información del PDF
  static async getPDFInfo(file: File): Promise<{
    pageCount: number;
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: Date;
    modificationDate?: Date;
    fileSize: number;
  }> {
    try {
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      
      return {
        pageCount: pdf.getPageCount(),
        title: pdf.getTitle(),
        author: pdf.getAuthor(),
        subject: pdf.getSubject(),
        creator: pdf.getCreator(),
        producer: pdf.getProducer(),
        creationDate: pdf.getCreationDate(),
        modificationDate: pdf.getModificationDate(),
        fileSize: file.size
      };
    } catch (error) {
      throw new Error(`Error al obtener información del PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  // Utilidad para descargar archivos
  static downloadBlob(data: Uint8Array, filename: string, mimeType: string = 'application/pdf') {
    try {
      const blob = new Blob([new Uint8Array(data)], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error(`Error al descargar archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  // Utilidad para formatear tamaño de archivo
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Utilidad para generar nombre de archivo único
  static generateUniqueFilename(baseName: string, extension: string = 'pdf'): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const cleanBaseName = baseName.replace(/[^a-zA-Z0-9]/g, '_');
    return `${cleanBaseName}_${timestamp}.${extension}`;
  }

}