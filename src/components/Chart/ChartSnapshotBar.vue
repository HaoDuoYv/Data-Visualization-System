<!-- src/components/Chart/ChartSnapshotBar.vue -->
<template>
  <div class="flex items-center gap-2">
    <!-- 保存快照 -->
    <div class="flex items-center gap-1">
      <input
        v-if="showSaveInput"
        v-model="saveName"
        @keyup.enter="handleSave"
        @blur="handleSave"
        placeholder="快照名称..."
        class="w-32 px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-primary-400"
        ref="saveInputRef"
      />
      <button
        v-else
        @click="showSaveInput = true; $nextTick(() => saveInputRef?.focus())"
        class="px-2 py-1 text-xs text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors cursor-pointer"
        title="保存当前图表配置"
      >
        <svg class="w-3.5 h-3.5 inline mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
        收藏
      </button>
    </div>

    <!-- 已保存快照列表 -->
    <div v-if="snapshots.length > 0" class="relative">
      <button
        @click="showList = !showList"
        class="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors cursor-pointer"
      >
        已收藏 ({{ snapshots.length }})
      </button>
      <div
        v-if="showList"
        class="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
      >
        <div
          v-for="snap in snapshots"
          :key="snap.id"
          class="flex items-center justify-between px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
        >
          <div class="flex-1 min-w-0 cursor-pointer" @click="handleLoad(snap.id)">
            <p class="text-xs font-medium text-gray-700 truncate">{{ snap.title }}</p>
            <p class="text-xs text-gray-400">{{ formatDate(snap.savedAt) }}</p>
          </div>
          <button
            @click.stop="handleDelete(snap.id)"
            class="p-1 text-gray-400 hover:text-red-500 cursor-pointer"
          >
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { useChartSnapshot } from '@/composables/useChartSnapshot';
import { useDuckDBStore } from '@/stores/duckdb';

const { snapshots, saveSnapshot, loadSnapshot, deleteSnapshot } = useChartSnapshot();
const store = useDuckDBStore();

const showSaveInput = ref(false);
const saveName = ref('');
const showList = ref(false);
const saveInputRef = ref<HTMLInputElement>();

function handleSave() {
  const name = saveName.value.trim();
  if (name) {
    saveSnapshot(name, store.chartConfig);
    saveName.value = '';
    showSaveInput.value = false;
  } else if (!saveName.value) {
    showSaveInput.value = false;
  }
}

function handleLoad(id: string) {
  const config = loadSnapshot(id);
  if (config) {
    store.updateChartConfig(config);
  }
  showList.value = false;
}

function handleDelete(id: string) {
  deleteSnapshot(id);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
</script>
