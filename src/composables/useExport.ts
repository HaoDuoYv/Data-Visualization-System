// src/composables/useExport.ts
import type { ECharts } from 'echarts';
import type { QueryResult } from '@/types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export function useExport() {
  function exportAsPNG(chartInstance: ECharts, filename = 'chart.png') {
    try {
      const url = chartInstance.getDataURL({
        type: 'png',
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });
      downloadDataURL(url, filename);
    } catch (e) {
      console.error('PNG export failed:', e);
      alert('导出 PNG 失败');
    }
  }

  function exportAsSVG(chartInstance: ECharts, filename = 'chart.svg') {
    try {
      const url = chartInstance.getDataURL({
        type: 'svg',
        backgroundColor: '#ffffff',
      });
      downloadDataURL(url, filename);
    } catch (e) {
      console.error('SVG export failed:', e);
      alert('导出 SVG 失败');
    }
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

  function escapeCSVField(value: unknown): string {
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

  async function exportDashboardAsPNG(element: HTMLElement, filename = 'dashboard.png') {
    try {
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#f3f4f6' });
      const url = canvas.toDataURL('image/png');
      downloadDataURL(url, filename);
    } catch (e) {
      console.error('Dashboard PNG export failed:', e);
      alert('导出仪表盘 PNG 失败');
    }
  }

  async function exportDashboardAsPDF(element: HTMLElement, filename = 'dashboard.pdf') {
    try {
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#f3f4f6' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(filename);
    } catch (e) {
      console.error('Dashboard PDF export failed:', e);
      alert('导出仪表盘 PDF 失败');
    }
  }

  return { exportAsPNG, exportAsSVG, exportAsCSV, exportDashboardAsPNG, exportDashboardAsPDF };
}
