'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { LockClosedIcon, ArrowDownTrayIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import FileUploadSimple from '@/components/FileUploadSimple';
import { PDFProcessor, SecurityOptions } from '@/utils/pdfProcessing';
import { useProcessingHistory } from '@/hooks/useProcessingHistory';

export default function ProtectPDFTool() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pdfInfo, setPdfInfo] = useState<{ pageCount: number } | null>(null);
  
  // Configuración de seguridad
  const [userPassword, setUserPassword] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [showOwnerPassword, setShowOwnerPassword] = useState(false);
  
  // Permisos
  const [permissions, setPermissions] = useState({
    printing: true,
    modifying: false,
    copying: false,
    annotating: true
  });

  const { addToHistory } = useProcessingHistory();

  const handleFileSelect = async (selectedFiles: File[]) => {
    const selectedFile = selectedFiles[0];
    setFile(selectedFile);
    setError(null);
    setSuccess(null);
    setPdfInfo(null);

    if (selectedFile) {
      try {
        const info = await PDFProcessor.getPDFInfo(selectedFile);
        setPdfInfo({ pageCount: info.pageCount });
      } catch (error) {
        setError('Error al leer información del PDF');
      }
    }
  };

  const handlePermissionChange = (permission: keyof typeof permissions, checked: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [permission]: checked
    }));
  };

  const validatePasswords = (): { isValid: boolean; error?: string } => {
    if (!userPassword.trim()) {
      return { isValid: false, error: 'La contraseña de usuario es requerida' };
    }

    if (userPassword.length < 4) {
      return { isValid: false, error: 'La contraseña debe tener al menos 4 caracteres' };
    }

    if (ownerPassword && ownerPassword.length < 4) {
      return { isValid: false, error: 'La contraseña de propietario debe tener al menos 4 caracteres' };
    }

    return { isValid: true };
  };

  const handleProtectPDF = async () => {
    if (!file || !pdfInfo) {
      setError('Selecciona un archivo PDF válido');
      return;
    }

    const passwordValidation = validatePasswords();
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

      const securityOptions: SecurityOptions = {
        userPassword: userPassword.trim(),
        ownerPassword: ownerPassword.trim() || userPassword.trim(),
        permissions
      };

      const protectedPDF = await PDFProcessor.protectPDF(file, securityOptions);
      
      clearInterval(progressInterval);
      setProgress(100);

      // Generar nombre de archivo
      const filename = PDFProcessor.generateUniqueFilename('documento_protegido');
      
      // Descargar archivo
      PDFProcessor.downloadBlob(protectedPDF, filename);
      
      // Añadir al historial
      addToHistory({
        fileName: filename,
        tool: 'proteger-pdf',
        toolName: 'Proteger PDF',
        originalSize: file.size,
        resultSize: protectedPDF.length,
        status: 'success'
      });
      
      setSuccess(
        `PDF protegido exitosamente. El documento ahora requiere contraseña para abrirse. ` +
        `Archivo descargado: ${filename}`
      );
      
      // Limpiar después de un tiempo
      setTimeout(() => {
        setFile(null);
        setPdfInfo(null);
        setProgress(0);
        setSuccess(null);
        setUserPassword('');
        setOwnerPassword('');
      }, 5000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al proteger PDF';
      
      // Añadir error al historial
      if (file) {
        addToHistory({
          fileName: file.name,
          tool: 'proteger-pdf',
          toolName: 'Proteger PDF',
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
            <LockClosedIcon className="h-6 w-6 text-blue-600" />
            Proteger PDF Online
          </CardTitle>
          <CardDescription>
            Protege tus documentos PDF con una contraseña segura. Cifra archivos para 
            garantizar su privacidad y seguridad.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Subida de archivo */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Selecciona el archivo PDF</h3>
            <FileUploadSimple
              onFileSelect={handleFileSelect}
              acceptedFileTypes={['application/pdf']}
              maxFiles={1}
              maxSize={100 * 1024 * 1024} // 100MB
            />
          </div>

          {/* Información del PDF */}
          {pdfInfo && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Información del PDF
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
                <div>
                  <span className="font-medium">Páginas:</span> {pdfInfo.pageCount}
                </div>
                <div>
                  <span className="font-medium">Tamaño:</span> {file ? PDFProcessor.formatFileSize(file.size) : 'N/A'}
                </div>
              </div>
            </div>
          )}

          {/* Configuración de contraseñas */}
          {pdfInfo && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Configuración de Seguridad</h3>
              
              {/* Contraseña de usuario */}
              <div className="space-y-2">
                <Label htmlFor="user-password">
                  Contraseña de Usuario (Requerida)
                </Label>
                <div className="relative">
                  <Input
                    id="user-password"
                    type={showUserPassword ? 'text' : 'password'}
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    placeholder="Ingresa una contraseña segura"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowUserPassword(!showUserPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showUserPassword ? (
                      <EyeSlashIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Esta contraseña será requerida para abrir el PDF
                </p>
              </div>

              {/* Contraseña de propietario */}
              <div className="space-y-2">
                <Label htmlFor="owner-password">
                  Contraseña de Propietario (Opcional)
                </Label>
                <div className="relative">
                  <Input
                    id="owner-password"
                    type={showOwnerPassword ? 'text' : 'password'}
                    value={ownerPassword}
                    onChange={(e) => setOwnerPassword(e.target.value)}
                    placeholder="Contraseña para permisos avanzados"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOwnerPassword(!showOwnerPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showOwnerPassword ? (
                      <EyeSlashIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Permite modificar permisos del documento
                </p>
              </div>

              {/* Permisos */}
              <div className="space-y-4">
                <h4 className="font-medium">Permisos del Documento</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="printing"
                      checked={permissions.printing}
                      onCheckedChange={(checked) => handlePermissionChange('printing', checked as boolean)}
                    />
                    <Label htmlFor="printing" className="text-sm">
                      Permitir impresión
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="modifying"
                      checked={permissions.modifying}
                      onCheckedChange={(checked) => handlePermissionChange('modifying', checked as boolean)}
                    />
                    <Label htmlFor="modifying" className="text-sm">
                      Permitir modificación
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="copying"
                      checked={permissions.copying}
                      onCheckedChange={(checked) => handlePermissionChange('copying', checked as boolean)}
                    />
                    <Label htmlFor="copying" className="text-sm">
                      Permitir copia de texto
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="annotating"
                      checked={permissions.annotating}
                      onCheckedChange={(checked) => handlePermissionChange('annotating', checked as boolean)}
                    />
                    <Label htmlFor="annotating" className="text-sm">
                      Permitir anotaciones
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Advertencia sobre limitaciones */}
          {pdfInfo && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                ⚠️ Limitaciones Técnicas
              </h4>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                <li>• La protección con contraseña tiene limitaciones con pdf-lib</li>
                <li>• Algunos lectores de PDF pueden no respetar todos los permisos</li>
                <li>• Para máxima seguridad, usa herramientas especializadas</li>
                <li>• Esta función es experimental y puede no funcionar en todos los casos</li>
              </ul>
            </div>
          )}

          {/* Progreso */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Protegiendo PDF...</span>
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
            onClick={handleProtectPDF}
            disabled={!file || !pdfInfo || !userPassword.trim() || isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              'Protegiendo...'
            ) : (
              <>
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Proteger PDF con Contraseña
              </>
            )}
          </Button>

          {/* Beneficios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                🔒 Seguridad
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Protección con contraseña</li>
                <li>• Control de permisos</li>
                <li>• Procesamiento local</li>
                <li>• Sin subida a servidores</li>
              </ul>
            </div>
            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                ✨ Características
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Contraseñas de usuario y propietario</li>
                <li>• Permisos granulares</li>
                <li>• Interfaz intuitiva</li>
                <li>• Totalmente gratuito</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}