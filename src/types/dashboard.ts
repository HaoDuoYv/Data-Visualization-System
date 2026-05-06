// src/types/dashboard.ts
import type { ChartConfig } from './chart';

export interface DashboardChart {
  id: string;
  title: string;
  config: ChartConfig;
  querySQL: string;
}

export interface DashboardLayout {
  columns: number;
  gap: number;
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
};
