<!-- src/components/Dashboard/AddChartModal.vue -->
<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- 遮罩 -->
      <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="$emit('close')"></div>
      <!-- 模态框 -->
      <div class="relative glass-card w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <svg class="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            添加图表
          </h3>
          <button
            @click="$emit('close')"
            class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- 标题 -->
        <div class="mb-4">
          <label class="block text-xs font-medium text-gray-500 mb-1">图表标题</label>
          <input
            v-model="title"
            type="text"
            placeholder="输入图表标题"
            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                   focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-colors"
          />
        </div>

        <!-- 数据表选择 -->
        <div class="mb-4">
          <label class="block text-xs font-medium text-gray-500 mb-1">数据表</label>
          <select
            v-model="selectedTable"
            @change="handleTableChange"
            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white
                   focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-colors"
          >
            <option value="" disabled>选择数据表</option>
            <option v-for="t in availableTables" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>

        <!-- 列选择 -->
        <div v-if="tableColumns.length > 0" class="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">X 轴（标签）</label>
            <select
              v-model="xColumn"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white
                     focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-colors"
            >
              <option v-for="col in tableColumns" :key="col.name" :value="col.name">
                {{ col.name }} ({{ col.type === 'numeric' ? '数值' : '文本' }})
              </option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Y 轴（数值）</label>
            <select
              v-model="yColumn"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white
                     focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-colors"
            >
              <option v-for="col in tableColumns" :key="col.name" :value="col.name">
                {{ col.name }} ({{ col.type === 'numeric' ? '数值' : '文本' }})
              </option>
            </select>
          </div>
        </div>

        <!-- 分系列 -->
        <div v-if="tableColumns.length > 0" class="mb-4">
          <label class="block text-xs font-medium text-gray-500 mb-1">分系列（可选）</label>
          <select
            v-model="seriesCol"
            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white
                   focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-colors"
          >
            <option value="">不分组</option>
            <option v-for="col in tableColumns" :key="col.name" :value="col.name">
              {{ col.name }}
            </option>
          </select>
        </div>

        <!-- 图表类型 -->
        <div class="mb-6">
          <label class="block text-xs font-medium text-gray-500 mb-2">图表类型</label>
          <div class="grid grid-cols-3 gap-1.5">
            <button
              v-for="t in chartTypes"
              :key="t.value"
              @click="chartType = t.value"
              class="px-3 py-2 text-xs rounded-lg transition-all cursor-pointer"
              :class="chartType === t.value
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100'"
            >
              {{ t.label }}
            </button>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex justify-end gap-3">
          <button
            @click="$emit('close')"
            class="px-4 py-2 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >取消</button>
          <button
            @click="handleAdd"
            :disabled="!canAdd"
            class="px-4 py-2 text-sm text-white bg-primary-500 rounded-lg hover:bg-primary-600
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >添加图表</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useDuckDB } from '@/composables/useDuckDB';
import { useDuckDBStore } from '@/stores/duckdb';
import type { ChartType, ColumnMeta } from '@/types';

defineProps<{ visible: boolean }>();
const emit = defineEmits<{
  close: [];
  add: [chart: { title: string; querySQL: string; config: { type: ChartType; xAxisColumn: string; yAxisColumn: string; seriesColumn?: string } }];
}>();

const { query } = useDuckDB();
const store = useDuckDBStore();

const title = ref('');
const selectedTable = ref('');
const xColumn = ref('');
const yColumn = ref('');
const seriesCol = ref('');
const chartType = ref<ChartType>('bar');
const tableColumns = ref<ColumnMeta[]>([]);

const availableTables = computed(() => store.tables);

const chartTypes = [
  { value: 'bar' as const, label: '柱状图' },
  { value: 'line' as const, label: '折线图' },
  { value: 'area' as const, label: '面积图' },
  { value: 'pie' as const, label: '饼图' },
  { value: 'scatter' as const, label: '散点图' },
  { value: 'radar' as const, label: '雷达图' },
  { value: 'funnel' as const, label: '漏斗图' },
  { value: 'gauge' as const, label: '仪表盘' },
  { value: 'heatmap' as const, label: '热力图' },
];

const canAdd = computed(() => title.value.trim() && selectedTable.value && xColumn.value && yColumn.value);

async function handleTableChange() {
  tableColumns.value = [];
  xColumn.value = '';
  yColumn.value = '';
  if (!selectedTable.value) return;

  const results = await query(`SELECT * FROM "${selectedTable.value}" LIMIT 5`);
  if (!results || results.length === 0) return;

  const firstRow = results[0]!;
  const cols: ColumnMeta[] = Object.keys(firstRow).map(key => ({
    name: key,
    type: typeof firstRow[key] === 'number' ? 'numeric' as const : 'string' as const,
  }));
  tableColumns.value = cols;

  const stringCol = cols.find(c => c.type === 'string');
  const numericCol = cols.find(c => c.type === 'numeric');
  xColumn.value = stringCol?.name || cols[0]?.name || '';
  yColumn.value = numericCol?.name || cols[1]?.name || cols[0]?.name || '';
}

function handleAdd() {
  if (!canAdd.value) return;
  const series = seriesCol.value || undefined;
  const sql = series
    ? `SELECT "${xColumn.value}", "${yColumn.value}", "${series}" FROM "${selectedTable.value}" LIMIT 1000`
    : `SELECT "${xColumn.value}", "${yColumn.value}" FROM "${selectedTable.value}" LIMIT 1000`;

  emit('add', {
    title: title.value.trim(),
    querySQL: sql,
    config: {
      type: chartType.value,
      xAxisColumn: xColumn.value,
      yAxisColumn: yColumn.value,
      seriesColumn: series,
    },
  });

  title.value = '';
  selectedTable.value = '';
  xColumn.value = '';
  yColumn.value = '';
  seriesCol.value = '';
  chartType.value = 'bar';
  tableColumns.value = [];
}

watch(() => selectedTable.value, () => {});
</script>
