// src/types/chart.ts

export type ChartType = 'bar' | 'line' | 'pie' | 'scatter';

export interface ChartConfig {
  type: ChartType;
  title: string;
  xAxisColumn: string;
  yAxisColumn: string;
  seriesColumn?: string;
}

export interface ColumnMeta {
  name: string;
  type: 'numeric' | 'string' | 'date' | 'unknown';
}

export const DEFAULT_CHART_CONFIG: ChartConfig = {
  type: 'bar',
  title: '',
  xAxisColumn: '',
  yAxisColumn: '',
  seriesColumn: undefined,
};
