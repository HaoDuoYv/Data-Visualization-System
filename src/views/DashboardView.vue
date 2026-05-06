<!-- src/views/DashboardView.vue -->
<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">仪表盘</h1>
          <p class="text-sm text-gray-500 mt-1">创建和管理数据可视化仪表盘</p>
        </div>
        <router-link
          to="/"
          class="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          返回编辑器
        </router-link>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-6">
      <!-- 仪表盘列表 -->
      <div v-if="!activeDashboard" class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-700">我的仪表盘</h2>
          <button
            @click="handleCreate"
            class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            新建仪表盘
          </button>
        </div>

        <div v-if="dashboards.length === 0" class="text-center py-12 text-gray-400">
          <p>暂无仪表盘</p>
          <p class="text-sm mt-1">点击"新建仪表盘"开始创建</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="d in dashboards"
            :key="d.id"
            class="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
            @click="selectDashboard(d.id)"
          >
            <h3 class="font-semibold text-gray-700">{{ d.name }}</h3>
            <p class="text-sm text-gray-500 mt-1">{{ d.charts.length }} 个图表</p>
            <p class="text-xs text-gray-400 mt-2">更新于 {{ formatDate(d.updatedAt) }}</p>
            <button
              @click.stop="handleDelete(d.id)"
              class="mt-2 text-xs text-red-500 hover:text-red-700"
            >删除</button>
          </div>
        </div>
      </div>

      <!-- 仪表盘编辑 -->
      <div v-else>
        <DashboardToolbar @back="activeDashboardId = null" />

        <div v-if="chartCount === 0" class="text-center py-12 text-gray-400">
          <p>仪表盘为空</p>
          <p class="text-sm mt-1">点击"添加图表"开始构建</p>
        </div>

        <div
          v-else
          class="grid gap-4"
          :style="{ gridTemplateColumns: `repeat(${activeDashboard.layout.columns}, 1fr)` }"
        >
          <DashboardCell
            v-for="chart in activeDashboard.charts"
            :key="chart.id"
            :chart="chart"
            @remove="removeChart(chart.id)"
            @update="(patch) => updateChart(chart.id, patch)"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useDashboardStore } from '@/stores/dashboard';
import { storeToRefs } from 'pinia';
import DashboardToolbar from '@/components/Dashboard/DashboardToolbar.vue';
import DashboardCell from '@/components/Dashboard/DashboardCell.vue';

const store = useDashboardStore();
const { dashboards, activeDashboard, activeDashboardId, chartCount } = storeToRefs(store);
const { createDashboard, selectDashboard, deleteDashboard, removeChart, updateChart, loadFromLocalStorage } = store;

onMounted(() => {
  loadFromLocalStorage();
});

function handleCreate() {
  const name = prompt('请输入仪表盘名称：');
  if (name) createDashboard(name);
}

function handleDelete(id: string) {
  if (confirm('确定删除此仪表盘？')) {
    deleteDashboard(id);
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('zh-CN');
}
</script>
