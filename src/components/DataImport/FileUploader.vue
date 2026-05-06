<!-- src/components/DataImport/FileUploader.vue -->
<template>
  <div
    class="file-uploader"
    @dragover.prevent="isDragging = true"
    @dragleave="isDragging = false"
    @drop.prevent="handleDrop"
  >
    <div
      class="border-2 border-dashed rounded-lg p-8 text-center transition-colors"
      :class="isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'"
    >
      <div class="mb-4">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>

      <p class="text-gray-600 mb-2">
        拖拽 CSV 文件到此处
      </p>
      <p class="text-gray-400 text-sm mb-4">或</p>

      <label class="inline-block cursor-pointer">
        <span class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
          选择文件
        </span>
        <input
          type="file"
          accept=".csv"
          class="hidden"
          @change="handleFileSelect"
        />
      </label>

      <p class="text-gray-400 text-xs mt-4">支持格式：CSV</p>
    </div>

    <div v-if="isImporting" class="mt-4 text-blue-500">
      导入中...
    </div>

    <div v-if="localError || importError" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
      <p class="text-red-600 text-sm">{{ localError || importError }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDataImport } from '@/composables/useDataImport';

const { isImporting, importError, importCSV } = useDataImport();

const isDragging = ref(false);
const localError = ref<string | null>(null);

const displayError = ref<string | null>(null);

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
    // Reset input value to allow re-uploading the same file
    input.value = '' as any;
  }
}

async function processFile(file: File) {
  localError.value = null;
  if (!file.name.endsWith('.csv')) {
    localError.value = '请选择 CSV 文件';
    return;
  }

  const result = await importCSV(file);
  if (result) {
    emit('imported', result.tableName);
  }
}
</script>
