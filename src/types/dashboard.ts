// src/types/dashboard.ts
import type { ChartConfig } from './chart';

export interface CellPosition {
  col: number;
  row: number;
  w: number;
  h: number;
}

export interface DashboardChart {
  id: string;
  title: string;
  config: ChartConfig;
  querySQL: string;
  position?: CellPosition;
}

export interface DashboardLayout {
  columns: number;
  gap: number;
  draggable: boolean;
}

export interface Dashboard {
  id: string;
  name: string;
  charts: DashboardChart[];
  layout: DashboardLayout;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_DASHBOARD_LAYOUT: DashboardLayout = {
  columns: 2,
  gap: 16,
  draggable: false,
};
