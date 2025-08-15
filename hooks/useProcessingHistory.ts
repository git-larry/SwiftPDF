'use client';

import { useState, useEffect } from 'react';

export interface ProcessingHistoryItem {
  id: string;
  fileName: string;
  tool: string;
  toolName: string;
  processedAt: Date;
  originalSize: number;
  resultSize?: number;
  status: 'success' | 'error';
  errorMessage?: string;
}

const STORAGE_KEY = 'swiftpdf_processing_history';
const MAX_HISTORY_ITEMS = 50;

export function useProcessingHistory() {
  const [history, setHistory] = useState<ProcessingHistoryItem[]>([]);

  // Cargar historial del localStorage al inicializar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convertir fechas de string a Date
        const historyWithDates = parsed.map((item: any) => ({
          ...item,
          processedAt: new Date(item.processedAt)
        }));
        setHistory(historyWithDates);
      }
    } catch (error) {
      console.error('Error loading processing history:', error);
    }
  }, []);

  // Guardar historial en localStorage cuando cambie
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving processing history:', error);
    }
  }, [history]);

  const addToHistory = (item: Omit<ProcessingHistoryItem, 'id' | 'processedAt'>) => {
    const newItem: ProcessingHistoryItem = {
      ...item,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      processedAt: new Date()
    };

    setHistory(prev => {
      const updated = [newItem, ...prev];
      // Mantener solo los últimos MAX_HISTORY_ITEMS elementos
      return updated.slice(0, MAX_HISTORY_ITEMS);
    });

    return newItem.id;
  };

  const removeFromHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const getHistoryByTool = (tool: string) => {
    return history.filter(item => item.tool === tool);
  };

  const getSuccessfulProcessings = () => {
    return history.filter(item => item.status === 'success');
  };

  const getFailedProcessings = () => {
    return history.filter(item => item.status === 'error');
  };

  const getTotalProcessedFiles = () => {
    return history.length;
  };

  const getTotalDataProcessed = () => {
    return history.reduce((total, item) => total + item.originalSize, 0);
  };

  const getProcessingStats = () => {
    const total = history.length;
    const successful = getSuccessfulProcessings().length;
    const failed = getFailedProcessings().length;
    const totalDataProcessed = getTotalDataProcessed();

    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      totalDataProcessed
    };
  };

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
    getHistoryByTool,
    getSuccessfulProcessings,
    getFailedProcessings,
    getTotalProcessedFiles,
    getTotalDataProcessed,
    getProcessingStats
  };
}