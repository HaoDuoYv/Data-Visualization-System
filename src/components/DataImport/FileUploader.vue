<!-- src/components/DataImport/FileUploader.vue -->
<template>
  <div
    class="file-uploader"
    @dragover.prevent="isDragging = true"
    @dragleave="isDragging = false"
    @drop.prevent="handleDrop"
  >
    <!-- 紧凑型上传区域 -->
    <div
      class="border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer"
      :class="isDragging ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-gray-300'"
    >
      <label class="cursor-pointer block">
        <svg class="mx-auto h-6 w-6 text-gray-400 mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        <span class="text-xs text-gray-600 font-medium">导入数据文件</span>
        <p class="text-xs text-gray-400 mt-0.5">CSV / Excel / JSON</p>
        <input
          type="file"
          accept=".csv,.xlsx,.xls,.json"
          class="hidden"
          @change="handleFileSelect"
        />
      </label>
    </div>

    <!-- Excel 工作表选择 -->
    <div v-if="pendingFile && sheetNames.length > 1" class="mt-2 p-2 bg-primary-50 border border-primary-200 rounded-lg">
      <p class="text-xs text-gray-600 mb-1.5">选择工作表：</p>
      <div class="flex flex-col gap-1">
        <button
          v-for="sheet in sheetNames"
          :key="sheet"
          @click="handleSheetSelect(sheet)"
          class="px-2 py-1 text-xs bg-white border border-primary-200 text-primary-700 rounded hover:bg-primary-50 transition-colors cursor-pointer text-left"
        >
          {{ sheet }}
        </button>
      </div>
    </div>

    <!-- 导入状态 -->
    <div v-if="isImporting" class="mt-2 flex items-center gap-1.5 text-primary-600">
      <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <span class="text-xs">导入中...</span>
    </div>

    <!-- 错误信息 -->
    <div v-if="localError || importError" class="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-red-600 text-xs">{{ localError || importError }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDataImport } from '@/composables/useDataImport';

const { isImporting, importError, importCSV, importExcel, importJSON, getExcelSheets } = useDataImport();

const isDragging = ref(false);
const localError = ref<string | null>(null);
const pendingFile = ref<File | null>(null);
const sheetNames = ref<string[]>([]);

const emit = defineEmits<{
  (e: 'imported', tableName: string): void;
}>();

async function handleDrop(event: DragEvent) {
  isDragging.value = false;
  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    const file = files[0];
    if (file) {
      await processFile(file);
    }
  }
}

async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    if (file) {
      await processFile(file);
    }
    input.value = '';
  }
}

async function handleSheetSelect(sheetName: string) {
  const file = pendingFile.value;
  if (!file) return;
  pendingFile.value = null;
  sheetNames.value = [];

  const result = await importExcel(file, undefined, sheetName);
  if (result) {
    emit('imported', result.tableName);
  }
}

async function processFile(file: File) {
  localError.value = null;
  pendingFile.value = null;
  sheetNames.value = [];

  const name = file.name.toLowerCase();
  let result;

  if (name.endsWith('.csv')) {
    result = await importCSV(file);
  } else if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    const sheets = await getExcelSheets(file);
    if (sheets.length > 1) {
      pendingFile.value = file;
      sheetNames.value = sheets;
      return;
    }
    result = await importExcel(file);
  } else if (name.endsWith('.json')) {
    result = await importJSON(file);
  } else {
    localError.value = '不支持的文件格式';
    return;
  }

  if (result) {
    emit('imported', result.tableName);
  }
}
</script>
