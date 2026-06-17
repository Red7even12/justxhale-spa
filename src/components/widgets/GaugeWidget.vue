<!-- frontend-spa/src/components/widgets/GaugeWidget.vue -->
<template>
  <div class="flex flex-col items-center justify-center w-full">
    <div class="relative w-40 h-24 overflow-hidden">
      <div class="absolute top-0 left-0 w-40 h-40 border-[12px] border-gray-100 rounded-full"></div>
      
      <div 
        class="absolute top-0 left-0 w-40 h-40 border-[12px] rounded-full transition-all duration-1000 ease-out"
        :style="{ 
            borderColor: getGaugeColor, 
            clipPath: `inset(0 0 50% 0)`,
            transform: `rotate(${gaugeRotation}deg)` 
        }"
      ></div>

      <div class="absolute bottom-0 left-0 w-full text-center">
        <div class="text-2xl font-black text-gray-800 tracking-tighter">
            {{ data?.value ?? 0 }}
        </div>
        <div class="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
            of {{ data?.target ?? 100 }} Target
        </div>
      </div>
    </div>
    
    <div class="mt-2 text-[10px] font-black px-2 py-0.5 rounded uppercase" 
         :style="{ backgroundColor: getLightColor, color: getGaugeColor }">
        {{ data?.percentage ?? 0 }}% Achieved
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
const props = defineProps<{ data: any, config: any }>();

const gaugeRotation = computed(() => {
    const p = props.data?.percentage ?? 0;
    return (p / 100) * 180;
});

const getGaugeColor = computed(() => {
  const p = props.data?.percentage ?? 0;
  if (p < 35) return '#ef4444';
  if (p < 75) return '#f59e0b';
  return '#10b981';
});

const getLightColor = computed(() => getGaugeColor.value + '15');
</script>