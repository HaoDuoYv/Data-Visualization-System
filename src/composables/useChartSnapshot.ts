// src/composables/useChartSnapshot.ts
import { ref, onMounted } from 'vue';
import type { ChartConfig } from '@/types';

const STORAGE_KEY = 'flexviz-chart-snapshots';

export interface ChartSnapshot {
  id: string;
  title: string;
  config: ChartConfig;
  savedAt: string;
}

export function useChartSnapshot() {
  const snapshots = ref<ChartSnapshot[]>([]);

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) snapshots.value = JSON.parse(raw);
    } catch { /* ignore */ }
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots.value));
  }

  function saveSnapshot(title: string, config: ChartConfig) {
    snapshots.value.push({
      id: crypto.randomUUID(),
      title,
      config: JSON.parse(JSON.stringify(config)),
      savedAt: new Date().toISOString(),
    });
    persist();
  }

  function loadSnapshot(id: string): ChartConfig | null {
    const snap = snapshots.value.find(s => s.id === id);
    return snap ? JSON.parse(JSON.stringify(snap.config)) : null;
  }

  function deleteSnapshot(id: string) {
    snapshots.value = snapshots.value.filter(s => s.id !== id);
    persist();
  }

  onMounted(load);

  return { snapshots, saveSnapshot, loadSnapshot, deleteSnapshot };
}
