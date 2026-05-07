<!-- src/components/Help/StepItem.vue -->
<template>
  <div class="flex gap-3">
    <div class="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-semibold">
      {{ step }}
    </div>
    <div class="flex-1">
      <h4 class="text-sm font-medium text-gray-700">{{ title }}</h4>
      <p class="text-xs text-gray-500 mt-0.5 leading-relaxed"><slot /></p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ step: number; title: string }>();
</script>
