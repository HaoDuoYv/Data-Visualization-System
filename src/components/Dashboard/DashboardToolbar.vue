<!-- src/components/Dashboard/DashboardToolbar.vue -->
<template>
  <div class="flex items-center justify-between mb-4 bg-white rounded-lg shadow-md p-4">
    <div class="flex items-center gap-4">
      <button
        @click="$emit('back')"
        class="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
      >
        ← 返回
      </button>
      <h2 class="text-lg font-semibold text-gray-700">{{ activeDashboard?.name }}</h2>
    </div>
    <div class="flex items-center gap-3">
      <select
        :value="activeDashboard?.layout.columns || 2"
        @change="updateLayout({ columns: Number(($event.target as HTMLSelectElement).value) })"
        class="px-3 py-1.5 text-sm border rounded-md"
      >
        <option :value="2">2 列</option>
        <option :value="3">3 列</option>
        <option :value="4">4 列</option>
      </select>
      <button
        @click="handleAddChart"
        class="px-4 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
      >
        添加图表
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDashboardStore } from '@/stores/dashboard';
import { storeToRefs } from 'pinia';
import { DEFAULT_CHART_CONFIG } from '@/types';

defineEmits<{ back: [] }>();

const store = useDashboardStore();
const { activeDashboard } = storeToRefs(store);
const { addChart, updateLayout } = store;

function handleAddChart() {
  const title = prompt('请输入图表标题：');
  if (!title) return;

  const sql = prompt('请输入 SQL 查询语句：', 'SELECT * FROM test_data');
  if (!sql) return;

  addChart({
    title,
    config: { ...DEFAULT_CHART_CONFIG },
    querySQL: sql,
  });
}
</script>
