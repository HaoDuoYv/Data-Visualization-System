<!-- src/views/HomeView.vue -->
<template>
  <div class="flex flex-1 overflow-hidden" style="height: calc(100vh - 49px)">
    <!-- 左侧边栏 -->
    <aside class="sidebar bg-white border-r border-gray-200 p-3 flex flex-col gap-3 shrink-0">
      <!-- 状态指示 -->
      <div class="flex items-center gap-1.5 px-1">
        <div
          class="w-2 h-2 rounded-full"
          :class="isInitialized ? 'bg-green-500' : 'bg-yellow-400'"
        />
        <span class="text-xs text-gray-500">
          {{ isInitialized ? '数据库已就绪' : '初始化中...' }}
        </span>
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

        <!-- 空状态 -->
        <div
          v-if="!hasData"
          class="text-center py-16"
        >
          <div class="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
            </svg>
          </div>
          <p class="text-gray-600 font-medium">暂无数据</p>
          <p class="text-gray-400 text-sm mt-1">导入 CSV、Excel 或 JSON 文件开始分析</p>
        </div>
      </div>
    </main>
  </div>

  <!-- 初始化/加载状态 -->
  <div
    v-if="!isInitialized || isLoading"
    class="fixed inset-0 top-[49px] z-30 flex items-center justify-center bg-surface/80 backdrop-blur-sm"
  >
    <div class="text-center">
      <div v-if="isLoading" class="flex flex-col items-center gap-3">
        <svg class="w-8 h-8 text-primary-400 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p class="text-gray-500 text-sm">正在初始化数据库...</p>
      </div>
      <div v-else-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-red-600 text-sm">{{ error }}</p>
      </div>
    </div>
  </div>

  <!-- 错误信息 -->
  <div v-if="error" class="fixed bottom-4 right-4 p-3 bg-red-50 border border-red-200 rounded-lg shadow-lg z-50 max-w-sm">
    <p class="text-red-600 text-sm">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useDuckDB } from '@/composables/useDuckDB';
import { useDuckDBStore } from '@/stores/duckdb';
import FileUploader from '@/components/DataImport/FileUploader.vue';
import DataPreview from '@/components/DataImport/DataPreview.vue';
import TableList from '@/components/DataImport/TableList.vue';

const store = useDuckDBStore();
const { isInitialized, isLoading, error, initialize } = useDuckDB();

const hasData = computed(() => store.tables.length > 0);

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
