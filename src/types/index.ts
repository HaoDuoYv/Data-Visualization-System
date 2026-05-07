// src/types/index.ts

// DuckDB 查询结果类型
export interface QueryResult {
  [key: string]: any;
}

// 图表类型 re-export
export type {
  ChartType,
  ChartConfig,
  ChartInteraction,
  ColumnMeta,
  ColorTheme,
  LegendPosition,
  AxisStyle,
  ChartCustomization,
  FilterRule,
  SortConfig,
  AggregationType,
  AggregationConfig,
  DataTransform,
  Annotation,
  DerivedColumn,
  TrendLineConfig,
} from './chart';
export {
  DEFAULT_CHART_CONFIG,
  DEFAULT_CHART_CUSTOMIZATION,
  DEFAULT_CHART_INTERACTION,
  DEFAULT_DATA_TRANSFORM,
  DEFAULT_TREND_LINE,
  COLOR_PALETTES,
} from './chart';

// 仪表盘类型 re-export
export type { DashboardChart, DashboardLayout, Dashboard, CellPosition } from './dashboard';
export { DEFAULT_DASHBOARD_LAYOUT } from './dashboard';
