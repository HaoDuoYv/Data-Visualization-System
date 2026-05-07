<!-- src/views/HomeView.vue -->
<template>
  <div class="min-h-screen bg-surface flex flex-col">
    <!-- 顶部导航 -->
    <header class="glass-header sticky top-0 z-40 shrink-0">
      <div class="flex items-center justify-between px-4 py-2.5">
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-lg bg-primary-800 flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 class="text-base font-bold text-primary-900">FlexViz Lite</h1>
        </div>
        <div class="flex items-center gap-1.5">
          <button
            @click="showHelp = true"
            class="px-2.5 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors cursor-pointer"
          >
            使用说明
          </button>
          <router-link
            to="/dashboard"
            class="px-3 py-1 text-xs bg-primary-800 text-white rounded hover:bg-primary-700 transition-colors"
          >
            仪表盘
          </router-link>
        </div>
      </div>
    </header>

    <!-- 主体：左右分栏 -->
    <div class="flex flex-1 overflow-hidden" v-if="isInitialized">
      <!-- 左侧边栏 -->
      <aside class="sidebar bg-white border-r border-gray-200 p-3 flex flex-col gap-3 shrink-0">
        <!-- 状态指示 -->
        <div class="flex items-center gap-1.5 px-1">
          <div class="w-2 h-2 rounded-full bg-green-500" />
          <span class="text-xs text-gray-500">数据库已就绪</span>
        </div>

        <!-- 导入文件 -->
        <FileUploader @imported="handleImported" />

        <!-- 分隔线 -->
        <div class="h-px bg-gray-100" />

        <!-- 数据表列表 -->
        <div class="flex-1 overflow-y-auto">
          <TableList />
        </div>
      </aside>

      <!-- 右侧主内容 -->
      <main class="flex-1 overflow-y-auto p-4">
        <div class="max-w-5xl mx-auto space-y-4">
          <!-- 数据预览 -->
          <DataPreview />

          <!-- 查询区域（标签页切换） -->
          <QueryTabs />

          <!-- 查询结果 -->
          <QueryResults />

          <!-- 图表 -->
          <ChartPanel v-if="resultCount > 0" />
        </div>
      </main>
    </div>

    <!-- 未初始化状态 -->
    <div v-else-if="!isLoading" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-3">
          <svg class="w-7 h-7 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
          </svg>
        </div>
        <p class="text-gray-600 font-medium">正在初始化数据库...</p>
        <p class="text-gray-400 text-xs mt-1">DuckDB 将在浏览器中运行</p>
      </div>
    </div>

    <!-- 加载中 -->
    <div v-else class="flex-1 flex items-center justify-center">
      <svg class="w-8 h-8 text-primary-400 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <!-- 错误信息 -->
    <div v-if="error" class="fixed bottom-4 right-4 p-3 bg-red-50 border border-red-200 rounded-lg shadow-lg z-50 max-w-sm">
      <p class="text-red-600 text-sm">{{ error }}</p>
    </div>

    <!-- 使用说明模态框 -->
    <HelpModal :visible="showHelp" @close="showHelp = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useDuckDB } from '@/composables/useDuckDB';
import { useDuckDBStore } from '@/stores/duckdb';
import QueryTabs from '@/components/SQL/QueryTabs.vue';
import QueryResults from '@/components/Results/QueryResults.vue';
import FileUploader from '@/components/DataImport/FileUploader.vue';
import DataPreview from '@/components/DataImport/DataPreview.vue';
import TableList from '@/components/DataImport/TableList.vue';
import ChartPanel from '@/components/Chart/ChartPanel.vue';
import HelpModal from '@/components/Help/HelpModal.vue';

const store = useDuckDBStore();
const resultCount = computed(() => store.resultCount);

const { isInitialized, isLoading, error, initialize } = useDuckDB();
const showHelp = ref(false);

async function initializeDB() {
  await initialize();
}

function handleImported(tableName: string) {
  console.log('Table imported:', tableName);
}

onMounted(async () => {
  if (!isInitialized.value) {
    await initializeDB();
  }
});
</script>
