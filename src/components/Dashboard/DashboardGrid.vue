<!-- src/components/Dashboard/DashboardGrid.vue -->
<template>
  <div
    ref="gridRef"
    class="dashboard-grid"
    :style="gridStyle"
    @dragover.prevent
    @drop="handleDrop"
  >
    <div
      v-for="chart in charts"
      :key="chart.id"
      class="dashboard-cell-wrapper"
      :style="cellStyle(chart)"
      draggable="true"
      @dragstart="handleDragStart($event, chart.id)"
      @dragend="handleDragEnd"
    >
      <!-- 拖拽手柄 -->
      <div class="cell-drag-handle" @mousedown.stop>
        <svg class="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
        </svg>
      </div>
      <!-- 大小调整按钮 -->
      <div class="cell-resize-controls">
        <button
          v-for="size in cellSizes"
          :key="size.label"
          @click.stop="handleResize(chart.id, size)"
          class="px-1 py-0.5 text-xs bg-white/80 border border-gray-200 rounded hover:bg-primary-50 hover:border-primary-300 cursor-pointer"
          :title="size.label"
        >
          {{ size.label }}
        </button>
      </div>
      <DashboardCell
        :chart="chart"
        @remove="$emit('remove', chart.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import DashboardCell from './DashboardCell.vue';
import type { DashboardChart, CellPosition } from '@/types';

const props = defineProps<{
  charts: DashboardChart[];
  columns: number;
  gap: number;
}>();

const emit = defineEmits<{
  (e: 'remove', id: string): void;
  (e: 'updatePosition', id: string, position: CellPosition): void;
}>();

const gridRef = ref<HTMLElement>();
const draggingId = ref<string | null>(null);

const cellSizes = [
  { label: '1×1', w: 1, h: 1 },
  { label: '2×1', w: 2, h: 1 },
  { label: '1×2', w: 1, h: 2 },
  { label: '2×2', w: 2, h: 2 },
];

const gridStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${props.columns}, 1fr)`,
  gap: `${props.gap}px`,
}));

function cellStyle(chart: DashboardChart) {
  const pos = chart.position;
  if (!pos) return {};
  return {
    gridColumn: `span ${Math.min(pos.w, props.columns)}`,
    gridRow: `span ${pos.h}`,
  };
}

function handleDragStart(e: DragEvent, id: string) {
  draggingId.value = id;
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move';
  }
}

function handleDragEnd() {
  draggingId.value = null;
}

function handleDrop(e: DragEvent) {
  e.preventDefault();
  draggingId.value = null;
}

function handleResize(id: string, size: { w: number; h: number }) {
  emit('updatePosition', id, { col: 0, row: 0, w: size.w, h: size.h });
}
</script>

<style scoped>
.dashboard-cell-wrapper {
  position: relative;
  min-height: 0;
}

.cell-drag-handle {
  position: absolute;
  top: 4px;
  left: 4px;
  z-index: 10;
  padding: 2px 4px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  cursor: grab;
  opacity: 0;
  transition: opacity 0.2s;
}

.dashboard-cell-wrapper:hover .cell-drag-handle {
  opacity: 1;
}

.cell-resize-controls {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 10;
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.2s;
}

.dashboard-cell-wrapper:hover .cell-resize-controls {
  opacity: 1;
}
</style>
