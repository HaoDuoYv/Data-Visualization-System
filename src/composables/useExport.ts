// src/composables/useExport.ts
import type { ECharts } from 'echarts';
import type { QueryResult } from '@/types';

export function useExport() {
  function exportAsPNG(chartInstance: ECharts, filename = 'chart.png') {
    const url = chartInstance.getDataURL({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: '#ffffff',
    });
    downloadDataURL(url, filename);
  }

  function exportAsSVG(chartInstance: ECharts, filename = 'chart.svg') {
    const url = chartInstance.getDataURL({
      type: 'svg',
      backgroundColor: '#ffffff',
    });
    downloadDataURL(url, filename);
  }

  function exportAsCSV(data: QueryResult[], filename = 'data.csv') {
    if (data.length === 0) return;
    const cols = Object.keys(data[0]!);
    const header = cols.map(escapeCSVField).join(',');
    const rows = data.map(row => cols.map(col => escapeCSVField(row[col])).join(','));
    const csv = [header, ...rows].join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    downloadBlob(blob, filename);
  }

  function escapeCSVField(value: any): string {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  }

  function downloadDataURL(dataURL: string, filename: string) {
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    downloadDataURL(url, filename);
    URL.revokeObjectURL(url);
  }

  return { exportAsPNG, exportAsSVG, exportAsCSV };
}
