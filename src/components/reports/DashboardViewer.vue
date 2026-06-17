<!-- src/components/reports/DashboardViewer.vue -->
<template>
  <div class="xhale-dashboard-viewer p-6 bg-gray-200">
    
    <!-- ADMIN PREVIEW OVERRIDE (Yellow Bar) -->
    <div v-if="isAdminPreview" class="mb-6 bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center justify-between shadow-sm">
      <div class="flex items-center gap-4">
        <div class="bg-amber-100 p-2 rounded-lg">
          <span class="material-icons text-amber-600 text-lg">visibility</span>
        </div>
        <div class="flex flex-col">
          <label class="text-[10px] font-black text-amber-600 uppercase tracking-tighter leading-none mb-1">
            Test Data Context (Previewing)
          </label>
          <select 
            :value="previewSubscriberId" 
            @change="$emit('update:previewSubscriberId', ($event.target as HTMLSelectElement).value)"
            class="bg-transparent border-none p-0 text-sm font-bold text-amber-900 focus:ring-0 cursor-pointer"
          >
            <option value="" disabled>-- Select Test Subscriber --</option>
            <option v-for="s in subscribers" :key="s.id" :value="s.id">
              {{ s.name }}
            </option>
          </select>
        </div>
      </div>
    </div>


    <!-- DASHBOARD HEADER -->
    <div class="mb-8 flex justify-between items-start">
      <div>
        <h1 class="text-3xl font-black text-gray-800 tracking-tight">
          {{ definition?.name || 'Loading Dashboard...' }}
        </h1>
        <p class="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">
          {{ definition?.uiConfig?.widgets?.length || 0 }} Management Widgets Active
        </p>
      </div>

      <!-- EXPORT BUTTON (Hidden during print) -->
      <button 
        @click="printDashboard" 
        class="no-print flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 transition-all shadow-sm"
      >
        <span class="material-icons text-sm"></span>
        Export to PDF
      </button>
    </div>


    <!-- Widget Grid with Safe Loop -->
    <div class="flex flex-wrap -mx-3">
      <!-- Only loop if widgets actually exists -->
      <template v-if="definition?.uiConfig?.widgets">
        <div 
          v-for="widget in definition.uiConfig.widgets" 
          :key="widget.id"
          :class="[getWidgetWidth(widget.width), 'px-3 mb-6']"
        >
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 h-full flex flex-col overflow-hidden">
            <div class="px-5 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h3 class="text-[12px] font-black text-gray-800 uppercase tracking-widest">
                {{ widget.dataSource?.label || 'Metric' }}
              </h3>
            </div>

            <div class="p-6 flex-grow flex items-center justify-center min-h-[220px]">
               <component 
                 v-if="getComponent(widget.type)"
                 :is="getComponent(widget.type)" 
                 :data="getWidgetData(widget.id)" 
                 :config="widget.dataSource"
               />
               <div v-else class="text-gray-300 italic text-xs">Invalid Widget Type</div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import KpiWidget from '../widgets/KpiWidget.vue';
import BarChartWidget from '../widgets/BarChartWidget.vue';
import DonutChartWidget from '../widgets/DonutChartWidget.vue';
import GaugeWidget from '../widgets/GaugeWidget.vue';
import LineChartWidget from '../widgets/LineChartWidget.vue';
import PieChartWidget from '../widgets/PieChartWidget.vue';

const props = withDefaults(defineProps<{
  definition: any;
  results?: Record<string, any>;
  isAdminPreview?: boolean;
  subscribers?: any[];        
  previewSubscriberId?: any;  
}>(), {
    results: () => ({}),
    isAdminPreview: false,
    subscribers: () => [],
    previewSubscriberId: null
});

// Ensure you have this emit defined for the yellow bar's selector
defineEmits(['update:previewSubscriberId']);

const getWidgetData = (widgetId: string) => {
  if (!props.results) return [];
  const data = props.results[widgetId];
  // Ensure we return an empty array for charts if data is missing
  return data || [];
};

const getComponent = (type: string) => {
  const map: any = {
    'kpi_card': KpiWidget,
    'bar_chart': BarChartWidget,
    'donut_chart': DonutChartWidget,
    'pie_chart': PieChartWidget,   
    'line_chart': LineChartWidget, 
    'gauge_dial': GaugeWidget
  };
  return map[type] || null;
};

const getWidgetWidth = (width: string) => {
  const map: any = { '1/4': 'w-1/4', '1/2': 'w-1/2', 'full': 'w-full' };
  return map[width] || 'w-1/4';
};

const printDashboard = () => {
    window.print();
};
</script>

<style>
/* 
   IMPORTANT: This style is NOT scoped so it can reach 
   the Sidebar and Header outside this component. 
*/
@media print {
  /* 1. AGGRESSIVE HIDE - Targets the V2 Layout Containers */
  .no-print,
  header, 
  aside, 
  nav, 
  .v2-header, /* Common name for that top bar */
  div[class*="sidebar"], 
  div[class*="header"],
  button,
  .preview-toolbar {
    display: none !important;
    height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  /* 2. FORCE COLOR RENDERING */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }

  /* 3. RESET THE BODY & CONTAINERS */
  /* This ensures the dashboard doesn't "float" inside a restricted container */
  body, 
  #app, 
  main, 
  .xhale-dashboard-viewer,
  .widget-dashboard {
    background-color: white !important;
    margin: 0 !important;
    padding: 0 !important;
    display: block !important;
    width: 100% !important;
    overflow: visible !important;
    position: static !important;
  }

  /* 4. LAYOUT ADJUSTMENT - 2 Columns per Row */
  .flex-wrap {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: wrap !important;
  }

  /* Target the widget column containers specifically */
  div[class*="w-full"], 
  div[class*="w-1/2"], 
  div[class*="w-1/4"] {
    width: 48% !important; /* Forces 2 per row on A4 */
    float: left;
    margin-bottom: 20px;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  /* Full width widgets stay full width */
  .w-full {
    width: 100% !important;
  }

  /* 5. ENSURE CHARTS SHOW UP */
  svg, circle, polyline, path {
    visibility: visible !important;
  }
}
</style>