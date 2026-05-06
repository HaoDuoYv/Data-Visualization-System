// src/types/index.ts

// DuckDB 查询结果类型
export interface QueryResult {
  [key: string]: any;
}

// DuckDB 状态类型
export interface DuckDBState {
  tables: string[];
  queryResults: QueryResult[];
  currentQuery: string;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
}

// 图表类型 re-export
export type { ChartType, ChartConfig, ColumnMeta } from './chart';
export { DEFAULT_CHART_CONFIG } from './chart';
