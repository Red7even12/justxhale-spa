<template>
  <div class="w-full h-full flex flex-col">
    <div class="flex-grow relative min-h-[150px]">
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" class="w-full h-full">
        <!-- Area under the line -->
        <path :d="areaPath" fill="url(#lineGradient)" opacity="0.2" />
        <!-- The Trend Line -->
        <polyline 
          fill="none" stroke="#4f46e5" stroke-width="1.5" 
          stroke-linecap="round" stroke-linejoin="round"
          :points="points"
          class="transition-all duration-1000"
        />
        <defs>
          <linearGradient id="lineGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="#4f46e5" />
            <stop offset="100%" stop-color="white" />
          </linearGradient>
        </defs>
      </svg>
    </div>
    <!-- X-Axis Labels -->
    <div class="flex justify-between mt-2 px-1">
      <span v-for="point in [data[0], data[data.length-1]]" :key="point?.label" class="text-[8px] font-bold text-gray-400 uppercase">
        {{ point?.label }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
const props = defineProps<{ data: any[] }>();

const points = computed(() => {
  if (!props.data.length) return "";
  const max = Math.max(...props.data.map(d => d.value), 1);
  return props.data.map((d, i) => {
    const x = (i / (props.data.length - 1)) * 100;
    const y = 40 - (d.value / max) * 35; // Flip Y and leave space at top
    return `${x},${y}`;
  }).join(' ');
});

const areaPath = computed(() => {
  const p = points.value;
  if (!p) return "";
  return `M 0 40 L ${p} L 100 40 Z`;
});
</script>