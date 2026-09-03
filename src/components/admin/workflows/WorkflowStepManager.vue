<template>
  <div class="flex flex-col h-full">
    <!-- Action Bar -->
    <div class="p-4 bg-gray-50 border-b flex justify-between items-center">
      <div class="flex items-center gap-4">
        <h4 class="text-xs font-black text-gray-500 uppercase tracking-widest">Logic Steps</h4>
        <span class="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
            {{ steps.length }} Steps
        </span>
      </div>
      <div class="flex items-center gap-4">
        <button @click="openVisualizer" class="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-all hover:scale-105 active:scale-95">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Visualise Flow
        </button>
        <span class="text-gray-300">|</span>
        <button @click="exportSteps" :disabled="isExporting" class="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          {{ isExporting ? 'Exporting...' : 'Export to Excel' }}
        </button>
      </div>
    </div>

    <!-- Bulk Import Panel -->
    <div class="p-4 bg-indigo-50/50 border-b">
      <div class="flex items-center justify-between gap-4">
        <div class="flex-1">
            <input type="file" @change="handleFileSelect" ref="fileInput" class="block w-full text-xs text-gray-500 file:mr-4 file:py-1 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"/>
        </div>
        <button @click="handleImport" class="bg-white border border-indigo-200 text-indigo-600 px-4 py-1 rounded text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm" :disabled="!importFile || isImporting">
          {{ isImporting ? 'Processing...' : 'Upload & Sync Steps' }}
        </button>

        <button 
            @click="syncWorkflow" 
            class="bg-amber-500 text-white px-4 py-1 rounded text-xs font-black uppercase tracking-widest shadow-sm hover:bg-amber-600 transition-all"
            >
            Sync to Existing Cases
        </button>
        </div>

      <!-- Feedback -->
      <div v-if="importSuccessMessage" class="mt-2 text-[10px] text-green-600 font-bold uppercase">{{ importSuccessMessage }}</div>
      <div v-if="importErrors.length > 0" class="mt-2 p-2 bg-red-50 rounded border border-red-100 max-h-24 overflow-y-auto">
          <ul class="text-[10px] text-red-600 space-y-1">
              <li v-for="(error, index) in importErrors" :key="index">Row {{ error.row }}: {{ error.message }}</li>
          </ul>
      </div>
    </div>

    <!-- Steps Table -->
    <div class="flex-1 overflow-y-auto">
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50 sticky top-0 z-10">
                <tr class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <th @click="sortBy('id')" class="px-6 py-3 text-left cursor-pointer hover:text-indigo-600">ID</th>
                    <th @click="sortBy('name')" class="px-6 py-3 text-left cursor-pointer hover:text-indigo-600">Step Name</th>
                    <th class="px-6 py-3 text-left">Automation Logic</th>
                    <th class="px-6 py-3 text-center">Milestone</th>
                    <th class="px-6 py-3 text-center">Active</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="step in steps" :key="step.id" class="hover:bg-gray-50 text-sm">
                    <td class="px-6 py-3 font-mono text-gray-400 text-xs">{{ step.id }}</td>
                    <td class="px-6 py-3 font-bold text-gray-800">{{ step.name }}</td>
                    <td class="px-6 py-3">
                        <div class="flex flex-col gap-1">
                            <span class="text-xs text-gray-600 italic">{{ step.reminderSubject || 'No Subject Defined' }}</span>
                            <span class="text-[10px] text-gray-400 uppercase font-bold">
                                {{ step.reminderMaxCycles || 0 }} Cycles / {{ step.reminderIntervalDays || 0 }} Days
                            </span>
                        </div>
                    </td>
                    <td class="px-6 py-3 text-center">
                        <span v-if="step.is_milestone || step.isMilestone" class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-700">
                            Milestone
                        </span>
                        <span v-else class="text-gray-300">
                            &mdash;
                        </span>
                    </td>
                    <td class="px-6 py-3 text-center">
                        <span :class="step.isActive ? 'text-green-500' : 'text-red-400'">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold">
                                <path v-if="step.isActive" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </span>
                    </td>
                </tr>
            </tbody>
        </table>
        <div v-if="steps.length === 0" class="p-12 text-center text-gray-400 italic">No steps loaded.</div>
    </div>

    <!-- Modal for Flow Chart Visualization -->
    <teleport to="body">
      <div v-if="showVisualModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300 workflow-modal-overlay">
        <div id="workflow-modal-container" class="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        <!-- Modal Header -->
        <div class="p-5 border-b flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 class="text-base font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-600 no-print" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>{{ formattedProductName }} &mdash; {{ props.definition?.name || 'Workflow Flow Chart' }}</span>
            </h3>
            <p class="text-[11px] text-gray-500 mt-1 font-semibold uppercase tracking-wider">Visual dependency mapping based on sorting, starts_after_step_id, and completion_trigger_step_id.</p>
          </div>
          <button @click="closeVisualizer" class="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors no-print">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="flex-1 p-6 overflow-auto bg-gray-50/50 flex flex-col items-center justify-center relative min-h-[300px]">
          <!-- Empty State -->
          <div v-if="steps.length === 0" class="text-center p-12 text-gray-400 italic">
            No active steps to visualize.
          </div>

          <!-- Zoom Controls -->
          <div v-if="steps.length > 0" class="absolute bottom-10 right-10 z-40 flex items-center gap-1 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-gray-200 font-bold text-xs text-gray-700 select-none no-print">
            <button @click="zoomOut" class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors" title="Zoom Out">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12H6" /></svg>
            </button>
            <button @click="resetZoom" class="px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors text-[10px] tracking-wider uppercase font-black" title="Reset Zoom">
              {{ zoomLevel }}%
            </button>
            <button @click="zoomIn" class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors" title="Zoom In">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v12m6-6H6" /></svg>
            </button>
          </div>

          <!-- Flow Chart Container -->
          <div v-show="steps.length > 0" class="workflow-chart-container w-full h-full overflow-auto p-6 bg-slate-50 rounded-xl border border-slate-200 shadow-inner max-h-[72vh] custom-scrollbar">
            <!-- Zoom Wrapper -->
            <div class="workflow-zoom-wrapper py-8 flex justify-center items-start min-w-[920px]">
              <!-- Mathematically static 3-column relative canvas -->
              <div 
                class="relative select-none"
                :style="{
                  width: '864px',
                  height: `${canvasHeight}px`
                }"
              >
                <!-- Left SVG Canvas: width 240px for Trigger Paths (Green) -->
                <svg 
                  class="absolute left-0 top-0 w-[240px] pointer-events-none overflow-visible z-10"
                  :style="{ height: `${canvasHeight}px` }"
                >
                  <defs>
                    <marker id="green-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                      <path d="M 0 1 L 6 4 L 0 7 z" fill="#10b981" />
                    </marker>
                  </defs>
                  
                  <!-- Trigger Paths -->
                  <path 
                    v-for="path in triggerPaths" 
                    :key="path.id"
                    :d="path.d"
                    fill="none"
                    stroke="#10b981"
                    :stroke-width="hoveredCardId && (path.fromId === hoveredCardId || path.toId === hoveredCardId) ? '4' : '2'"
                    :opacity="hoveredCardId ? (path.fromId === hoveredCardId || path.toId === hoveredCardId ? '1.0' : '0.15') : '0.85'"
                    marker-end="url(#green-arrow)"
                    class="transition-all duration-200 pointer-events-auto cursor-pointer"
                    @mouseenter="hoveredPath = { type: 'trigger', fromId: path.fromId, toId: path.toId }"
                    @mouseleave="hoveredPath = null"
                  >
                    <title>Starts After: {{ path.sourceName }} → {{ path.targetName }}</title>
                  </path>
                </svg>

                <!-- Center Card Column: width 384px, left 240px -->
                <div 
                  class="absolute left-[240px] top-0 w-[384px]"
                  :style="{ height: `${canvasHeight}px` }"
                >
                  <div 
                    v-for="(step, index) in activeSteps" 
                    :key="step.id"
                    class="absolute flex flex-col justify-between p-3.5 rounded-xl border transition-all duration-300 bg-white"
                    :style="{
                      top: `${index * 128}px`,
                      height: '80px',
                      width: '384px'
                    }"
                    :class="[
                      (step.isUserFacing ?? step.is_user_facing) 
                        ? 'border-indigo-500/30 hover:border-indigo-600 shadow-sm' 
                        : 'bg-slate-50 border-dashed border-slate-300 hover:border-slate-400 text-slate-600',
                      hoveredCardId === step.id ? 'ring-2 ring-indigo-500 scale-[1.03] shadow-md z-30' : 'z-20',
                      hoveredPath && (hoveredPath.fromId === step.id || hoveredPath.toId === step.id)
                        ? [
                            hoveredPath.type === 'trigger' ? 'ring-2 ring-emerald-500 border-emerald-500 scale-[1.02] shadow-md z-30' : '',
                            hoveredPath.type === 'stop' ? 'ring-2 ring-rose-500 border-rose-500 scale-[1.02] shadow-md z-30' : '',
                            hoveredPath.type === 'escalation' ? 'ring-2 ring-amber-500 border-amber-500 scale-[1.02] shadow-md z-30' : ''
                          ]
                        : '',
                      hoveredCardId && hoveredCardId !== step.id && (!hoveredPath || (hoveredPath.fromId !== step.id && hoveredPath.toId !== step.id)) ? 'opacity-40 scale-95' : ''
                    ]"
                    @mouseenter="hoveredCardId = step.id"
                    @mouseleave="hoveredCardId = null"
                  >
                    <!-- Card Header / Title Row -->
                    <div class="flex items-center justify-between text-[10px] font-black uppercase tracking-wider gap-3">
                      <span class="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold shrink-0">
                        Order {{ step.sortOrder ?? step.sort_order ?? 0 }}
                      </span>
                      <span class="font-bold text-xs truncate text-center flex-1 min-w-0 px-1" :class="(step.isUserFacing ?? step.is_user_facing) ? 'text-slate-800 font-black' : 'text-slate-500 font-bold'">
                        {{ step.label ?? step.name }}
                      </span>
                      <span class="text-slate-400 font-mono shrink-0">ID: {{ step.id }}</span>
                    </div>

                    <!-- Card Footer / Extra info -->
                    <div class="flex items-center justify-between text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
                      <span class="truncate max-w-[180px]">
                        {{ step.reminderSubject || 'No Reminder Subject' }}
                      </span>
                      <span v-if="step.isUserFacing ?? step.is_user_facing" class="text-indigo-600 bg-indigo-50/50 px-1.5 py-0.5 rounded text-[8px] font-black">
                        User Facing
                      </span>
                      <span v-else class="text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded text-[8px] font-black">
                        System Logic
                      </span>
                      <span v-if="step.is_milestone || step.isMilestone" class="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-[8px] font-black border border-amber-200 ml-1">
                        Milestone
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Right SVG Canvas: width 240px for Stop Paths (Red) and Escalation Paths (Orange), left 624px -->
                <svg 
                  class="absolute left-[624px] top-0 w-[240px] pointer-events-none overflow-visible z-10"
                  :style="{ height: `${canvasHeight}px` }"
                >
                  <defs>
                    <marker id="red-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                      <path d="M 0 1 L 6 4 L 0 7 z" fill="#ef4444" />
                    </marker>
                    <marker id="orange-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                      <path d="M 0 1 L 6 4 L 0 7 z" fill="#f97316" />
                    </marker>
                  </defs>
                  
                  <!-- Stop Paths -->
                  <path 
                    v-for="path in stoppingPaths" 
                    :key="path.id"
                    :d="path.d"
                    fill="none"
                    stroke="#ef4444"
                    :stroke-width="hoveredCardId && (path.fromId === hoveredCardId || path.toId === hoveredCardId) ? '4' : '2'"
                    :opacity="hoveredCardId ? (path.fromId === hoveredCardId || path.toId === hoveredCardId ? '1.0' : '0.15') : '0.85'"
                    :stroke-dasharray="hoveredCardId && (path.fromId === hoveredCardId || path.toId === hoveredCardId) ? 'none' : '4 4'"
                    marker-end="url(#red-arrow)"
                    class="transition-all duration-200 pointer-events-auto cursor-pointer"
                    @mouseenter="hoveredPath = { type: 'stop', fromId: path.fromId, toId: path.toId }"
                    @mouseleave="hoveredPath = null"
                  >
                    <title>Stop Trigger: {{ path.sourceName }} → {{ path.targetName }}</title>
                  </path>

                  <!-- Escalation Paths -->
                  <path 
                    v-for="path in escalationPaths" 
                    :key="path.id"
                    :d="path.d"
                    fill="none"
                    stroke="#f97316"
                    :stroke-width="hoveredCardId && (path.fromId === hoveredCardId || path.toId === hoveredCardId) ? '5' : '3'"
                    :opacity="hoveredCardId ? (path.fromId === hoveredCardId || path.toId === hoveredCardId ? '1.0' : '0.15') : '0.85'"
                    marker-end="url(#orange-arrow)"
                    class="transition-all duration-200 pointer-events-auto cursor-pointer"
                    @mouseenter="hoveredPath = { type: 'escalation', fromId: path.fromId, toId: path.toId }"
                    @mouseleave="hoveredPath = null"
                  >
                    <title>Escalation: {{ path.sourceName }} → {{ path.targetName }}</title>
                  </path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer / Legend -->
        <div class="p-4 border-t bg-white flex flex-wrap gap-6 items-center justify-between">
          <!-- Legend -->
          <div class="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-black uppercase tracking-wider text-gray-500">
            <div class="flex items-center gap-2">
              <span class="w-3.5 h-3.5 rounded border-2 border-indigo-600 bg-white inline-block"></span>
              <span>User-Facing Step</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3.5 h-3.5 rounded border border-gray-400 border-dashed bg-slate-50 inline-block"></span>
              <span>Non User-Facing Step</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3.5 h-3.5 rounded border border-amber-300 bg-amber-50 inline-block"></span>
              <span>Milestone Step</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="inline-block text-emerald-500 font-mono font-black text-xs">──▶</span>
              <span>Starts After (Trigger)</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="inline-block text-rose-500 font-mono font-black text-xs">- - ▶</span>
              <span>Completes / Stop Trigger</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="inline-block text-amber-500 font-mono font-black text-xs">══▶</span>
              <span>Escalation</span>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="flex items-center gap-3 no-print">
            <button @click="printFlowChart" class="bg-indigo-600 text-white px-5 py-1.5 rounded text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-sm flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Export PDF
            </button>
            <button @click="closeVisualizer" class="bg-gray-800 text-white px-5 py-1.5 rounded text-xs font-black uppercase tracking-widest hover:bg-gray-700 transition-all shadow-sm">
              Close View
            </button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</div>
</template>

<script setup>
import { ref, reactive, watch, nextTick, computed } from 'vue';
import apiClient from '@/services/api';
import { useAlerts } from '@/composables/useAlerts';

const props = defineProps({
  definition: { type: Object, required: true },
  slug: { type: String, required: false },
  product: { type: Object, required: false },
  fileTypeId: { type: [String, Number], required: false }
});

const isFoundryContext = computed(() => !props.slug || props.slug === 'foundry');

const apiBaseUrl = computed(() => {
  return isFoundryContext.value
    ? `admin/workflow-definitions/${props.definition.id}`
    : `admin/products/${props.slug}/workflow-definitions/${props.definition.id}`;
});

const formattedProductName = computed(() => {
    if (props.product?.name) return props.product.name;
    return props.slug
        ? props.slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        : 'Product Workflow';
});

const { showAlert } = useAlerts();
const steps = ref([]);
const loading = ref(false);
const isExporting = ref(false);
const isImporting = ref(false);
const importFile = ref(null);
const importSuccessMessage = ref('');
const importErrors = ref([]);

const sortState = reactive({ by: 'id', dir: 'asc' });

// Flow Chart State
const showVisualModal = ref(false);
const zoomLevel = ref(100);
const hoveredCardId = ref(null);
const hoveredPath = ref(null);

const fetchSteps = async () => {
    if (!props.definition?.id) return;
    loading.value = true;
    try {
        const params = { sort_by: sortState.by, sort_dir: sortState.dir };
        const { data } = await apiClient.get(`/${apiBaseUrl.value}/steps`, { params });
        steps.value = data?.data || data || [];
    } catch (e) { console.error(e); }
    loading.value = false;
};

const sortBy = (col) => {
    sortState.dir = (sortState.by === col && sortState.dir === 'asc') ? 'desc' : 'asc';
    sortState.by = col;
    fetchSteps();
};

const exportSteps = async () => {
    isExporting.value = true;
    try {
        const response = await apiClient.get(`/${apiBaseUrl.value}/export`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `DNA-Steps-${props.slug || 'foundry'}-${props.definition.id}.xlsx`);
        document.body.appendChild(link);
        link.click();
    } catch (e) { showAlert('Error', 'Export failed.'); }
    isExporting.value = false;
};

const handleFileSelect = (e) => { importFile.value = e.target.files[0]; };

const handleImport = async () => {
    if (!importFile.value) return;
    isImporting.value = true;
    const formData = new FormData();
    formData.append('file', importFile.value);

    try {
        await apiClient.post(`/${apiBaseUrl.value}/import`, formData);
        showAlert('Success', 'Steps synchronized with Workflow DNA.');
        fetchSteps();
    } catch (e) {
        if (e.response?.status === 422) {
            importErrors.value = e.response.data.errors;
        } else {
            showAlert('Error', 'Import failed. Check file format.');
        }
    }
    isImporting.value = false;
};

const syncWorkflow = async () => {
    if (!confirm("This will add any missing steps or updates to all active cases for this Niche. Proceed?")) return;
    
    try {
        // If in Foundry context, hit the niche sync endpoint; otherwise hit the product sync endpoint
        const syncUrl = isFoundryContext.value
            ? `admin/file-types/${props.fileTypeId || props.definition.fileTypeId || props.definition.file_type_id}/workflow-definitions/${props.definition.id}/sync`
            : `admin/products/${props.slug}/workflow-definitions/${props.definition.id}/sync`;

        const { data } = await apiClient.post(`/${syncUrl}`);
        showAlert('Success', data.message || 'Workflow synchronized across active cases.');
    } catch (e) {
        console.error(e);
        showAlert('Error', e.response?.data?.message || 'Sync failed.');
    }
};

// Pure Vue-Rendered Flow Chart Calculations
const activeSteps = computed(() => {
    return [...steps.value]
        .filter(s => s.isActive !== false && s.is_active !== false)
        .sort((a, b) => {
            const orderA = a.sortOrder ?? a.sort_order ?? 0;
            const orderB = b.sortOrder ?? b.sort_order ?? 0;
            return orderA - orderB;
        });
});

const stepIndexMap = computed(() => {
    const map = {};
    activeSteps.value.forEach((step, index) => {
        map[step.id] = index;
    });
    return map;
});

const canvasHeight = computed(() => {
    return activeSteps.value.length * 128;
});

const triggerPaths = computed(() => {
    const paths = [];
    activeSteps.value.forEach(step => {
        const startsAfter = step.startsAfterStepId ?? step.starts_after_step_id;
        if (startsAfter !== null && startsAfter !== undefined) {
            const fromIdx = stepIndexMap.value[startsAfter];
            const toIdx = stepIndexMap.value[step.id];
            if (fromIdx !== undefined && toIdx !== undefined) {
                const ySource = fromIdx * 128 + 40;
                const yTarget = toIdx * 128 + 40;
                const stepDiff = Math.abs(fromIdx - toIdx);
                const dx = Math.min(220, 40 + stepDiff * 24);
                
                // Path starts at (240, ySource) and ends at (234, yTarget)
                const d = `M 240,${ySource} C ${240 - dx},${ySource} ${234 - dx},${yTarget} 234,${yTarget}`;
                paths.push({
                    id: `trigger-${startsAfter}-${step.id}`,
                    d,
                    sourceName: activeSteps.value[fromIdx].label ?? activeSteps.value[fromIdx].name,
                    targetName: step.label ?? step.name,
                    fromId: startsAfter,
                    toId: step.id
                });
            }
        }
    });
    return paths;
});

const stoppingPaths = computed(() => {
    const paths = [];
    activeSteps.value.forEach(step => {
        const completionTrigger = step.completionTriggerStepId ?? step.completion_trigger_step_id;
        if (completionTrigger !== null && completionTrigger !== undefined) {
            const fromIdx = stepIndexMap.value[completionTrigger];
            const toIdx = stepIndexMap.value[step.id];
            if (fromIdx !== undefined && toIdx !== undefined) {
                const ySource = fromIdx * 128 + 40;
                const yTarget = toIdx * 128 + 40;
                const stepDiff = Math.abs(fromIdx - toIdx);
                const dx = Math.min(220, 40 + stepDiff * 24);
                
                // Path starts at (0, ySource) and ends at (6, yTarget)
                const d = `M 0,${ySource} C ${dx},${ySource} ${dx},${yTarget} 6,${yTarget}`;
                paths.push({
                    id: `stop-${completionTrigger}-${step.id}`,
                    d,
                    sourceName: activeSteps.value[fromIdx].label ?? activeSteps.value[fromIdx].name,
                    targetName: step.label ?? step.name,
                    fromId: completionTrigger,
                    toId: step.id
                });
            }
        }
    });
    return paths;
});

const escalationPaths = computed(() => {
    const paths = [];
    activeSteps.value.forEach(step => {
        const escalation = step.escalationStepId ?? step.escalation_step_id;
        if (escalation !== null && escalation !== undefined) {
            const fromIdx = stepIndexMap.value[step.id];
            const toIdx = stepIndexMap.value[escalation];
            if (fromIdx !== undefined && toIdx !== undefined) {
                const ySource = fromIdx * 128 + 40;
                const yTarget = toIdx * 128 + 40;
                const stepDiff = Math.abs(fromIdx - toIdx);
                const dx = Math.min(220, 40 + stepDiff * 24);
                
                // Path starts at (0, ySource) and ends at (6, yTarget)
                const d = `M 0,${ySource} C ${dx},${ySource} ${dx},${yTarget} 6,${yTarget}`;
                paths.push({
                    id: `escalation-${step.id}-${escalation}`,
                    d,
                    sourceName: step.label ?? step.name,
                    targetName: activeSteps.value[toIdx].label ?? activeSteps.value[toIdx].name,
                    fromId: step.id,
                    toId: escalation
                });
            }
        }
    });
    return paths;
});

const openVisualizer = () => {
    showVisualModal.value = true;
};

const closeVisualizer = () => {
    showVisualModal.value = false;
    zoomLevel.value = 100;
};

// Zoom logic
const zoomScale = computed(() => zoomLevel.value / 100);

const zoomIn = () => {
    if (zoomLevel.value < 200) {
        zoomLevel.value += 15;
    }
};

const zoomOut = () => {
    if (zoomLevel.value > 30) {
        zoomLevel.value -= 15;
    }
};

const resetZoom = () => {
    zoomLevel.value = 100;
};

const printFlowChart = () => {
    window.print();
};

watch(() => props.definition?.id, fetchSteps, { immediate: true });
</script>

<style scoped>
.workflow-zoom-wrapper {
  zoom: v-bind(zoomScale);
  -moz-transform: scale(v-bind(zoomScale));
  -moz-transform-origin: top center;
  transition: zoom 0.15s ease-out, transform 0.15s ease-out;
}
</style>

<style>
@media print {
  /* Hide everything under body except our teleported workflow modal overlay */
  body > :not(.workflow-modal-overlay) {
    display: none !important;
  }
  
  /* Reset body and html margins */
  body, html {
    background: #ffffff !important;
    margin: 0 !important;
    padding: 0 !important;
    height: auto !important;
    overflow: visible !important;
  }

  /* Make modal overlay take up entire page flatly */
  .workflow-modal-overlay {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    height: auto !important;
    background: white !important;
    backdrop-filter: none !important;
    padding: 0 !important;
    margin: 0 !important;
    display: block !important;
    overflow: visible !important;
  }

  /* Expand modal container fully */
  #workflow-modal-container {
    position: relative !important;
    width: 100% !important;
    max-width: none !important;
    height: auto !important;
    max-height: none !important;
    border: none !important;
    box-shadow: none !important;
    background: white !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  /* Expand scrollable flow container so everything renders on print pages */
  .workflow-chart-container {
    overflow: visible !important;
    max-height: none !important;
    height: auto !important;
    background: white !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
  }

  /* Ensure zoom scale is forced to 100% for print output */
  .workflow-zoom-wrapper {
    zoom: 100% !important;
    transform: none !important;
    padding: 20px 0 !important;
    width: 100% !important;
    display: flex !important;
    justify-content: center !important;
  }

  /* Hide buttons, controls, and other interactive elements from print */
  .no-print {
    display: none !important;
  }

  /* Force browsers to print exact background colors and border colors */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
</style>