<!-- src/components/Dashboard/DashboardToolbar.vue -->
<template>
  <div class="glass-card p-4 mb-5">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button
          @click="$emit('back')"
          class="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 class="text-lg font-semibold text-gray-700">{{ activeDashboard?.name }}</h2>
      </div>
      <div class="flex items-center gap-2">
        <select
          :value="activeDashboard?.layout.columns || 2"
          @change="updateLayout({ columns: Number(($event.target as HTMLSelectElement).value) })"
          class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        >
          <option :value="2">2 列</option>
          <option :value="3">3 列</option>
          <option :value="4">4 列</option>
        </select>
        <button
          @click="updateLayout({ draggable: !activeDashboard?.layout.draggable })"
          class="px-3 py-1.5 text-sm rounded-lg transition-colors cursor-pointer flex items-center gap-1"
          :class="activeDashboard?.layout.draggable
            ? 'bg-primary-500 text-white'
            : 'text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100'"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
          </svg>
          自由布局
        </button>
        <div class="relative" ref="exportMenuRef">
          <button
            @click="showExportMenu = !showExportMenu"
            class="px-3 py-1.5 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer flex items-center gap-1"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            导出
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          <div
            v-if="showExportMenu"
            class="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[140px] overflow-hidden"
          >
            <button
              @click="handleExport('png')"
              class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >导出 PNG</button>
            <button
              @click="handleExport('pdf')"
              class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >导出 PDF</button>
          </div>
        </div>
        <button
          @click="$emit('add-chart')"
          class="px-4 py-1.5 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors cursor-pointer flex items-center gap-1"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          添加图表
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useDashboardStore } from '@/stores/dashboard';
import { storeToRefs } from 'pinia';
import { useExport } from '@/composables/useExport';

defineEmits<{ back: []; 'add-chart': [] }>();

const store = useDashboardStore();
const { activeDashboard } = storeToRefs(store);
const { updateLayout } = store;
const { exportDashboardAsPNG, exportDashboardAsPDF } = useExport();

const showExportMenu = ref(false);
const exportMenuRef = ref<HTMLElement | null>(null);

async function handleExport(format: 'png' | 'pdf') {
  showExportMenu.value = false;
  const container = document.querySelector('.dashboard-grid') as HTMLElement;
  if (!container) return;
  const name = activeDashboard.value?.name || 'dashboard';
  if (format === 'png') {
    await exportDashboardAsPNG(container, `${name}.png`);
  } else {
    await exportDashboardAsPDF(container, `${name}.pdf`);
  }
}

function onClickOutside(e: MouseEvent) {
  if (exportMenuRef.value && !exportMenuRef.value.contains(e.target as Node)) {
    showExportMenu.value = false;
  }
}

onMounted(() => document.addEventListener('click', onClickOutside));
onUnmounted(() => document.removeEventListener('click', onClickOutside));
</script>
