<!-- src/views/HomeView.vue -->
<template>
  <div class="min-h-screen bg-gray-100">
    <!-- 顶部导航 -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">FlexViz Lite</h1>
          <p class="text-sm text-gray-500 mt-1">浏览器端数据可视化工具</p>
        </div>
        <router-link
          to="/dashboard"
          class="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          仪表盘
        </router-link>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="max-w-7xl mx-auto px-4 py-6">
      <!-- 初始化状态 -->
      <div class="mb-6 p-4 rounded-lg" :class="statusClass">
        <div class="flex items-center justify-between">
          <div>
            <span class="font-medium">数据库状态：</span>
            <span v-if="isInitialized" class="text-green-600">已就绪</span>
            <span v-else-if="isLoading" class="text-blue-600">初始化中...</span>
            <span v-else class="text-gray-600">未初始化</span>
          </div>
          <button
            v-if="!isInitialized && !isLoading"
            @click="initializeDB"
            class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600
                   transition-colors duration-200"
          >
            初始化数据库
          </button>
        </div>
      </div>

      <!-- 错误信息 -->
      <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-red-600">{{ error }}</p>
      </div>

      <!-- SQL 编辑器和结果 -->
      <div v-if="isInitialized" class="space-y-6">
        <!-- 数据导入 -->
        <FileUploader @imported="handleImported" />
        <DataPreview />

        <!-- SQL 编辑器 -->
        <SQLEditor />
        <QueryResults />

        <!-- 图表可视化 -->
        <ChartPanel v-if="resultCount > 0" />
      </div>

      <!-- 未初始化时的提示 -->
      <div v-else-if="!isLoading" class="text-center py-12">
        <p class="text-gray-500 text-lg">请先初始化数据库以开始使用</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useDuckDB } from '@/composables/useDuckDB';
import { useDuckDBStore } from '@/stores/duckdb';
import SQLEditor from '@/components/SQL/SQLEditor.vue';
import QueryResults from '@/components/Results/QueryResults.vue';
import FileUploader from '@/components/DataImport/FileUploader.vue';
import DataPreview from '@/components/DataImport/DataPreview.vue';
import ChartPanel from '@/components/Chart/ChartPanel.vue';

const store = useDuckDBStore();
const resultCount = computed(() => store.resultCount);

const { isInitialized, isLoading, error, initialize } = useDuckDB();

const statusClass = computed(() => {
  if (isInitialized.value) return 'bg-green-50 border border-green-200';
  if (isLoading.value) return 'bg-blue-50 border border-blue-200';
  return 'bg-gray-50 border border-gray-200';
});

async function initializeDB() {
  await initialize();
}

function handleImported(tableName: string) {
  console.log('Table imported:', tableName);
}

// 页面加载时自动初始化
onMounted(async () => {
  if (!isInitialized.value) {
    await initializeDB();
  }
});
</script>
