<!-- frontend-spa/src/components/widgets/GaugeWidget.vue -->
<template>
  <div class="flex flex-col items-center justify-center w-full">
    <div class="relative w-48 h-28">
      <!-- SVG ARC GAUGE -->
      <svg viewBox="0 0 36 22" class="w-full h-full">
        <!-- 1. The Background Track (Gray) -->
        <path
          d="M 4,18 A 14,14 0 0 1 32,18"
          fill="none"
          stroke="#f3f4f6"
          stroke-width="3.5"
          stroke-linecap="round"
        />
        
        <!-- 2. The Progress Arc (Colored) -->
        <!-- stroke-dasharray math: The total arc length is ~44 units -->
        <path
          d="M 4,18 A 14,14 0 0 1 32,18"
          fill="none"
          :stroke="getGaugeColor"
          stroke-width="3.5"
          stroke-linecap="round"
          :stroke-dasharray="`${(percentage / 100) * 44} 44`"
          class="transition-all duration-1000 ease-out"
        />
      </svg>

      <!-- Center Value Overlays -->
      <div class="absolute inset-0 flex flex-col items-center justify-end pb-4">
        <div class="text-4xl font-black text-gray-800 tracking-tighter leading-none tabular-nums">
          {{ data?.value ?? 0 }}
        </div>
        <div class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
          of {{ data?.target ?? 100 }} Target
        </div>
      </div>
    </div>
    
    <!-- Achievement Pill -->
    <div class="mt-2 text-[10px] font-black px-3 py-1 rounded-full uppercase shadow-sm border border-white/50" 
         :style="{ backgroundColor: getLightColor, color: getGaugeColor }">
        {{ percentage }}% Achieved
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
const props = defineProps<{ data: any, config: any }>();

// Defensive percentage calculation
const percentage = computed(() => {
    const p = props.data?.percentage ?? 0;
    return Math.min(Math.max(p, 0), 100); // Clamp between 0 and 100
});

const getGaugeColor = computed(() => {
  const p = percentage.value;
  if (p < 35) return '#ef4444'; // Red (Danger)
  if (p < 75) return '#f59e0b'; // Amber (Progressing)
  return '#10b981';           // Green (Healthy)
});

const getLightColor = computed(() => getGaugeColor.value + '15');
</script>