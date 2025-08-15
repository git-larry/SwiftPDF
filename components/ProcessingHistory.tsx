'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ClockIcon, 
  DocumentIcon, 
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useProcessingHistory, ProcessingHistoryItem } from '@/hooks/useProcessingHistory';
import { PDFProcessor } from '@/utils/pdfProcessing';

interface ProcessingHistoryProps {
  className?: string;
}

export default function ProcessingHistory({ className = '' }: ProcessingHistoryProps) {
  const {
    history,
    removeFromHistory,
    clearHistory,
    getProcessingStats
  } = useProcessingHistory();

  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const stats = getProcessingStats();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusBadge = (status: 'success' | 'error') => {
    if (status === 'success') {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
          <CheckCircleIcon className="h-3 w-3 mr-1" />
          Exitoso
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
          <XCircleIcon className="h-3 w-3 mr-1" />
          Error
        </Badge>
      );
    }
  };

  const handleClearHistory = () => {
    clearHistory();
    setShowConfirmClear(false);
  };

  if (history.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5" />
            Historial de Procesamiento
          </CardTitle>
          <CardDescription>
            Aquí aparecerán los archivos que hayas procesado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <DocumentIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No has procesado ningún archivo aún
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Usa cualquiera de nuestras herramientas para comenzar
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5" />
              Historial de Procesamiento
            </CardTitle>
            <CardDescription>
              {history.length} archivo{history.length !== 1 ? 's' : ''} procesado{history.length !== 1 ? 's' : ''}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfirmClear(true)}
            className="text-red-600 hover:text-red-700"
          >
            <TrashIcon className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.total}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Total
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.successful}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Exitosos
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.failed}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Errores
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.successRate.toFixed(0)}%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Éxito
            </div>
          </div>
        </div>

        {/* Confirmación de limpieza */}
        {showConfirmClear && (
          <Alert className="border-red-200 bg-red-50 text-red-800">
            <AlertDescription>
              <div className="flex justify-between items-center">
                <span>¿Estás seguro de que quieres limpiar todo el historial?</span>
                <div className="space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowConfirmClear(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleClearHistory}
                  >
                    Confirmar
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Lista de archivos */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {history.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <DocumentIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {item.fileName}
                    </p>
                    {getStatusBadge(item.status)}
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>{item.toolName}</span>
                    <span>{formatDate(item.processedAt)}</span>
                    <span>{PDFProcessor.formatFileSize(item.originalSize)}</span>
                    {item.resultSize && (
                      <span>→ {PDFProcessor.formatFileSize(item.resultSize)}</span>
                    )}
                  </div>
                  {item.status === 'error' && item.errorMessage && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {item.errorMessage}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFromHistory(item.id)}
                className="text-gray-400 hover:text-red-500 flex-shrink-0"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {history.length >= 10 && (
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Mostrando los últimos {Math.min(history.length, 50)} archivos procesados
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}