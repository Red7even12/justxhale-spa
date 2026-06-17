<!-- frontend-spa/src/components/widgets/KpiWidget.vue -->
<template>
  <div class="text-center">
    <!-- Check if data exists, otherwise show 0 -->
    <div class="text-5xl font-black text-blue-600 tracking-tighter tabular-nums">
      {{ data?.value ?? 0 }}
    </div>
    <div class="text-[10px] font-bold text-gray-400 uppercase mt-2 tracking-widest">
      {{ config?.label || 'Total Records' }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ data: any, config: any }>();
</script>