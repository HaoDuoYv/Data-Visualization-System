// src/stores/dashboard.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Dashboard, DashboardChart, DashboardLayout } from '@/types';
import { DEFAULT_DASHBOARD_LAYOUT, DEFAULT_CHART_CONFIG } from '@/types';

export const useDashboardStore = defineStore('dashboard', () => {
  const dashboards = ref<Dashboard[]>([]);
  const activeDashboardId = ref<string | null>(null);

  const activeDashboard = computed(() =>
    dashboards.value.find(d => d.id === activeDashboardId.value) || null
  );

  const chartCount = computed(() => activeDashboard.value?.charts.length || 0);

  function createDashboard(name: string): Dashboard {
    const dashboard: Dashboard = {
      id: crypto.randomUUID(),
      name,
      charts: [],
      layout: { ...DEFAULT_DASHBOARD_LAYOUT },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dashboards.value.push(dashboard);
    activeDashboardId.value = dashboard.id;
    saveToLocalStorage();
    return dashboard;
  }

  function addChart(chart: Omit<DashboardChart, 'id'>) {
    if (!activeDashboard.value) return;
    const newChart: DashboardChart = { ...chart, id: crypto.randomUUID() };
    activeDashboard.value.charts.push(newChart);
    activeDashboard.value.updatedAt = new Date().toISOString();
    saveToLocalStorage();
  }

  function updateChart(chartId: string, patch: Partial<DashboardChart>) {
    if (!activeDashboard.value) return;
    const idx = activeDashboard.value.charts.findIndex(c => c.id === chartId);
    if (idx === -1) return;
    const existing = activeDashboard.value.charts[idx];
    if (!existing) return;
    activeDashboard.value.charts[idx] = { ...existing, ...patch };
    activeDashboard.value.updatedAt = new Date().toISOString();
    saveToLocalStorage();
  }

  function removeChart(chartId: string) {
    if (!activeDashboard.value) return;
    activeDashboard.value.charts = activeDashboard.value.charts.filter(c => c.id !== chartId);
    activeDashboard.value.updatedAt = new Date().toISOString();
    saveToLocalStorage();
  }

  function updateLayout(layout: Partial<DashboardLayout>) {
    if (!activeDashboard.value) return;
    activeDashboard.value.layout = { ...activeDashboard.value.layout, ...layout };
    activeDashboard.value.updatedAt = new Date().toISOString();
    saveToLocalStorage();
  }

  function deleteDashboard(id: string) {
    dashboards.value = dashboards.value.filter(d => d.id !== id);
    if (activeDashboardId.value === id) {
      activeDashboardId.value = dashboards.value[0]?.id || null;
    }
    saveToLocalStorage();
  }

  function selectDashboard(id: string) {
    activeDashboardId.value = id;
  }

  function saveToLocalStorage() {
    localStorage.setItem('flexviz-dashboards', JSON.stringify(dashboards.value));
  }

  function loadFromLocalStorage() {
    const raw = localStorage.getItem('flexviz-dashboards');
    if (raw) {
      try {
        dashboards.value = JSON.parse(raw);
        const first = dashboards.value[0];
        if (first && !activeDashboardId.value) {
          activeDashboardId.value = first.id;
        }
      } catch { /* ignore */ }
    }
  }

  return {
    dashboards, activeDashboardId, activeDashboard, chartCount,
    createDashboard, addChart, updateChart, removeChart,
    updateLayout, deleteDashboard, selectDashboard, loadFromLocalStorage,
  };
});
