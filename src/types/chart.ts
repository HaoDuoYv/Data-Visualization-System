// src/types/chart.ts

export type ChartType = 'bar' | 'line' | 'area' | 'pie' | 'scatter' | 'radar' | 'funnel' | 'gauge' | 'heatmap';

export type ColorTheme = 'default' | 'cool' | 'warm' | 'pastel' | 'dark' | 'earth';

export type LegendPosition = 'top' | 'bottom' | 'left' | 'right' | 'none';

export interface AxisStyle {
  showGrid: boolean;
  gridColor: string;
  labelRotation: number;
  axisLineColor: string;
  labelFontSize: number;
}

export interface ChartCustomization {
  colorTheme: ColorTheme;
  fontSize: number;
  legendPosition: LegendPosition;
  axisStyle: AxisStyle;
  backgroundColor: string;
}

export interface FilterRule {
  column: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'not_contains' | 'is_null' | 'is_not_null';
  value: string;
}

export interface SortConfig {
  column: string;
  direction: 'asc' | 'desc';
}

export type AggregationType = 'none' | 'sum' | 'avg' | 'count' | 'min' | 'max';

export interface AggregationConfig {
  groupBy: string[];
  aggregations: { column: string; type: AggregationType }[];
}

export interface DataTransform {
  filters: FilterRule[];
  sort: SortConfig | null;
  aggregation: AggregationConfig | null;
}

export interface ChartConfig {
  type: ChartType;
  title: string;
  xAxisColumn: string;
  yAxisColumn: string;
  seriesColumn?: string;
  customization: ChartCustomization;
  dataTransform: DataTransform;
}

export interface ColumnMeta {
  name: string;
  type: 'numeric' | 'string' | 'date' | 'unknown';
}

export const DEFAULT_CHART_CUSTOMIZATION: ChartCustomization = {
  colorTheme: 'default',
  fontSize: 14,
  legendPosition: 'bottom',
  axisStyle: {
    showGrid: true,
    gridColor: '#e5e7eb',
    labelRotation: 0,
    axisLineColor: '#6b7280',
    labelFontSize: 12,
  },
  backgroundColor: '#ffffff',
};

export const DEFAULT_DATA_TRANSFORM: DataTransform = {
  filters: [],
  sort: null,
  aggregation: null,
};

export const DEFAULT_CHART_CONFIG: ChartConfig = {
  type: 'bar',
  title: '',
  xAxisColumn: '',
  yAxisColumn: '',
  seriesColumn: undefined,
  customization: { ...DEFAULT_CHART_CUSTOMIZATION },
  dataTransform: { ...DEFAULT_DATA_TRANSFORM },
};

export const COLOR_PALETTES: Record<ColorTheme, string[]> = {
  default: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],
  cool: ['#2196F3', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#03A9F4', '#00ACC1', '#26A69A'],
  warm: ['#F44336', '#FF9800', '#FF5722', '#E91E63', '#FFC107', '#FF6F00', '#D84315', '#BF360C', '#FF8A65'],
  pastel: ['#A8D8EA', '#AA96DA', '#FCBAD3', '#FFFFD2', '#B5EAD7', '#C7CEEA', '#FFDAC1', '#E2F0CB', '#FFB7B2'],
  dark: ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51', '#606c38', '#283618', '#dda15e', '#bc6c25'],
  earth: ['#8D6E63', '#A1887F', '#607D8B', '#78909C', '#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', '#795548'],
};
