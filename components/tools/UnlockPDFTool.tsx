'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LockOpenIcon, ArrowDownTrayIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import FileUpload from '@/components/FileUpload';
import { PDFProcessor } from '@/utils/pdfProcessing';
import { useProcessingHistory } from '@/hooks/useProcessingHistory';

export default function UnlockPDFTool() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pdfInfo, setPdfInfo] = useState<{ pageCount: number } | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { addToHistory } = useProcessingHistory();

  const handleFileSelect = async (selectedFiles: File[]) => {
    const selectedFile = selectedFiles[0];
    setFile(selectedFile);
    setError(null);
    setSuccess(null);
    setPdfInfo(null);
    setPassword('');

    if (selectedFile) {
      try {
        // Intentar obtener información básica del PDF
        const info = await PDFProcessor.getPDFInfo(selectedFile);
        setPdfInfo({ pageCount: info.pageCount });
      } catch (error) {
        // Si falla, probablemente esté protegido
        setError('Este PDF parece estar protegido. Ingresa la contraseña para desbloquearlo.');
        setPdfInfo({ pageCount: 0 }); // Indicar que hay un archivo pero no se puede leer
      }
    }
  };

  const validatePassword = (): { isValid: boolean; error?: string } => {
    if (!password.trim()) {
      return { isValid: false, error: 'La contraseña es requerida para desbloquear el PDF' };
    }

    return { isValid: true };
  };

  const handleUnlockPDF = async () => {
    if (!file) {
      setError('Selecciona un archivo PDF válido');
      return;
    }

    const passwordValidation = validatePassword();
    if (!passwordValidation.isValid) {
      setError(passwordValidation.error || 'Error de validación');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setSuccess(null);

    try {
      // Simular progreso
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 15;
        });
      }, 200);

      const unlockedPDF = await PDFProcessor.unlockPDF(file, password.trim());
      
      clearInterval(progressInterval);
      setProgress(100);

      // Generar nombre de archivo
      const filename = PDFProcessor.generateUniqueFilename('documento_desbloqueado');
      
      // Descargar archivo
      PDFProcessor.downloadBlob(unlockedPDF, filename);
      
      // Añadir al historial
      addToHistory({
        fileName: filename,
        tool: 'desproteger-pdf',
        toolName: 'Desproteger PDF',
        originalSize: file.size,
        resultSize: unlockedPDF.length,
        status: 'success'
      });
      
      setSuccess(
        `PDF desbloqueado exitosamente. El documento ya no requiere contraseña. ` +
        `Archivo descargado: ${filename}`
      );
      
      // Limpiar después de un tiempo
      setTimeout(() => {
        setFile(null);
        setPdfInfo(null);
        setProgress(0);
        setSuccess(null);
        setPassword('');
      }, 5000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al desbloquear PDF';
      
      // Añadir error al historial
      if (file) {
        addToHistory({
          fileName: file.name,
          tool: 'desproteger-pdf',
          toolName: 'Desproteger PDF',
          originalSize: file.size,
          status: 'error',
          errorMessage
        });
      }
      
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LockOpenIcon className="h-6 w-6 text-blue-600" />
            Desproteger PDF Online
          </CardTitle>
          <CardDescription>
            Elimina la contraseña de un archivo PDF si tienes el permiso para hacerlo. 
            Desbloquea tus documentos para editarlos o imprimirlos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Subida de archivo */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Selecciona el archivo PDF protegido</h3>
            <FileUpload
              onFileSelect={handleFileSelect}
              acceptedFileTypes={['application/pdf']}
              maxFiles={1}
              maxSize={100 * 1024 * 1024} // 100MB
            />
          </div>

          {/* Información del PDF */}
          {file && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Información del PDF
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
                <div>
                  <span className="font-medium">Archivo:</span> {file.name}
                </div>
                <div>
                  <span className="font-medium">Tamaño:</span> {PDFProcessor.formatFileSize(file.size)}
                </div>
                {pdfInfo && pdfInfo.pageCount > 0 && (
                  <div>
                    <span className="font-medium">Páginas:</span> {pdfInfo.pageCount}
                  </div>
                )}
                <div>
                  <span className="font-medium">Estado:</span> 
                  <span className={pdfInfo && pdfInfo.pageCount > 0 ? 'text-green-600' : 'text-orange-600'}>
                    {pdfInfo && pdfInfo.pageCount > 0 ? ' No protegido' : ' Protegido'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Campo de contraseña */}
          {file && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contraseña del Documento</h3>
              
              <div className="space-y-2">
                <Label htmlFor="password">
                  Contraseña para desbloquear el PDF
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa la contraseña del PDF"
                    className="pr-10"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && password.trim()) {
                        handleUnlockPDF();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Ingresa la contraseña que se usó para proteger este PDF
                </p>
              </div>

              {/* Información sobre el proceso */}
              <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  ℹ️ Información Importante
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Solo puedes desbloquear PDFs si conoces la contraseña correcta</li>
                  <li>• El proceso se realiza completamente en tu navegador</li>
                  <li>• No almacenamos ni transmitimos tu contraseña</li>
                  <li>• El archivo desbloqueado se descargará automáticamente</li>
                </ul>
              </div>
            </div>
          )}

          {/* Advertencia sobre limitaciones */}
          {file && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                ⚠️ Limitaciones Técnicas
              </h4>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                <li>• Esta función tiene limitaciones con pdf-lib</li>
                <li>• Algunos tipos de protección pueden no ser compatibles</li>
                <li>• Solo funciona con PDFs protegidos con contraseña de usuario</li>
                <li>• Para casos complejos, usa herramientas especializadas</li>
              </ul>
            </div>
          )}

          {/* Progreso */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Desbloqueando PDF...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Mensajes de error y éxito */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Botón de acción */}
          <Button
            onClick={handleUnlockPDF}
            disabled={!file || !password.trim() || isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              'Desbloqueando...'
            ) : (
              <>
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Desbloquear PDF
              </>
            )}
          </Button>

          {/* Beneficios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                ✨ Características
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Desbloqueo instantáneo</li>
                <li>• Mantiene la calidad</li>
                <li>• Procesamiento seguro</li>
                <li>• Sin límites de uso</li>
              </ul>
            </div>
            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                🔒 Seguridad
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Procesamiento local</li>
                <li>• Sin subida a servidores</li>
                <li>• Contraseñas no almacenadas</li>
                <li>• Privacidad garantizada</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}