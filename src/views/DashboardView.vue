<!-- src/views/DashboardView.vue -->
<template>
  <div class="min-h-screen bg-surface">
    <main class="max-w-7xl mx-auto px-4 py-4">
      <!-- 仪表盘列表 -->
      <div v-if="!activeDashboard" class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-semibold text-gray-700">我的仪表盘</h2>
          <button
            @click="handleCreate"
            class="px-3 py-1.5 bg-primary-500 text-white text-xs rounded-lg hover:bg-primary-600 transition-colors cursor-pointer"
          >
            新建仪表盘
          </button>
        </div>

        <div v-if="dashboards.length === 0" class="text-center py-12">
          <div class="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
          </div>
          <p class="text-gray-500 text-sm">暂无仪表盘</p>
          <p class="text-gray-400 text-xs mt-0.5">点击"新建仪表盘"开始创建</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div
            v-for="d in dashboards"
            :key="d.id"
            class="glass-card p-4 cursor-pointer"
            @click="selectDashboard(d.id)"
          >
            <div class="flex items-start justify-between">
              <h3 class="font-semibold text-primary-900">{{ d.name }}</h3>
              <button
                @click.stop="handleDelete(d.id)"
                class="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                title="删除仪表盘"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            <p class="text-sm text-gray-500 mt-2">{{ d.charts.length }} 个图表</p>
            <p class="text-xs text-gray-400 mt-3">更新于 {{ formatDate(d.updatedAt) }}</p>
          </div>
        </div>
      </div>

      <!-- 仪表盘编辑 -->
      <div v-else>
        <DashboardToolbar
          @back="activeDashboardId = null"
          @add-chart="showAddModal = true"
        />

        <div v-if="chartCount === 0" class="text-center py-12">
          <div class="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <p class="text-gray-600 font-medium">仪表盘为空</p>
          <p class="text-gray-400 text-sm mt-1">点击"添加图表"开始构建</p>
        </div>

        <!-- 自由布局模式 -->
        <DashboardGrid
          v-if="activeDashboard.layout.draggable && activeDashboard.charts.length > 0"
          :charts="activeDashboard.charts"
          :columns="activeDashboard.layout.columns"
          :gap="activeDashboard.layout.gap || 16"
          @remove="removeChart"
          @update-position="handleUpdatePosition"
        />

        <!-- 固定网格模式 -->
        <div
          v-else-if="activeDashboard.charts.length > 0"
          class="grid gap-4 dashboard-grid"
          :style="{ gridTemplateColumns: `repeat(${activeDashboard.layout.columns}, 1fr)` }"
        >
          <DashboardCell
            v-for="chart in activeDashboard.charts"
            :key="chart.id"
            :chart="chart"
            @remove="removeChart(chart.id)"
            @update="(patch: any) => updateChart(chart.id, patch)"
          />
        </div>

        <AddChartModal
          :visible="showAddModal"
          @close="showAddModal = false"
          @add="handleAddChart"
        />
      </div>
    </main>

    <!-- 新建仪表盘弹窗 -->
    <Teleport to="body">
      <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="showCreateModal = false"></div>
        <div class="relative glass-card w-full max-w-sm mx-4 p-6">
          <h3 class="text-base font-semibold text-gray-800 mb-4">新建仪表盘</h3>
          <input
            ref="createInputRef"
            v-model="createName"
            type="text"
            placeholder="请输入仪表盘名称"
            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-colors"
            @keyup.enter="handleCreateConfirm"
          />
          <div class="flex justify-end gap-2 mt-4">
            <button
              @click="showCreateModal = false"
              class="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              @click="handleCreateConfirm"
              class="px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors cursor-pointer"
            >
              创建
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useDashboardStore } from '@/stores/dashboard';
import { storeToRefs } from 'pinia';
import DashboardToolbar from '@/components/Dashboard/DashboardToolbar.vue';
import DashboardCell from '@/components/Dashboard/DashboardCell.vue';
import DashboardGrid from '@/components/Dashboard/DashboardGrid.vue';
import AddChartModal from '@/components/Dashboard/AddChartModal.vue';
import { DEFAULT_CHART_CONFIG } from '@/types';
import type { ChartType, CellPosition } from '@/types';

const store = useDashboardStore();
const { dashboards, activeDashboard, activeDashboardId, chartCount } = storeToRefs(store);
const { createDashboard, selectDashboard, deleteDashboard, addChart, removeChart, updateChart, updateChartPosition, loadFromLocalStorage } = store;

const showAddModal = ref(false);
const showCreateModal = ref(false);
const createName = ref('');
const createInputRef = ref<HTMLInputElement>();

onMounted(() => {
  loadFromLocalStorage();
});

function handleAddChart(event: { title: string; querySQL: string; config: { type: ChartType; xAxisColumn: string; yAxisColumn: string; seriesColumn?: string } }) {
  addChart({
    title: event.title,
    querySQL: event.querySQL,
    config: {
      ...DEFAULT_CHART_CONFIG,
      type: event.config.type,
      xAxisColumn: event.config.xAxisColumn,
      yAxisColumn: event.config.yAxisColumn,
      seriesColumn: event.config.seriesColumn,
    },
  });
  showAddModal.value = false;
}

function handleCreate() {
  createName.value = '';
  showCreateModal.value = true;
  nextTick(() => createInputRef.value?.focus());
}

function handleCreateConfirm() {
  const name = createName.value.trim();
  if (name) {
    createDashboard(name);
    showCreateModal.value = false;
  }
}

function handleDelete(id: string) {
  if (confirm('确定删除此仪表盘？')) {
    deleteDashboard(id);
  }
}

function handleUpdatePosition(id: string, position: CellPosition) {
  updateChartPosition(id, position);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('zh-CN');
}
</script>
