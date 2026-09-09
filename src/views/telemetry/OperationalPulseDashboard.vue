<template>
  <div class="space-y-6">
    <!-- Header Banner -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-2xl shadow-inner">
          🚨
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl font-black text-slate-900 tracking-tight">Daily Exception Pulse</h1>
            <span class="bg-rose-100 text-rose-800 text-xs font-black px-2.5 py-0.5 rounded-full">
              {{ totalDefects }} Active Exceptions
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">
            Real-time queue of unresolved operational defects, safety grounding events, and required CAPA sign-offs.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="fetchPulse"
          :disabled="isLoading"
          class="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition flex items-center gap-2"
        >
          <span :class="{ 'animate-spin': isLoading }">↻</span>
          Refresh Pulse
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="py-16 flex justify-center items-center">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-600"></div>
    </div>

    <!-- Empty State (All Clear) -->
    <div
      v-else-if="defects.length === 0"
      class="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm"
    >
      <div class="mx-auto w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-3xl text-emerald-600 mb-4 shadow-sm">
        ✓
      </div>
      <h3 class="text-base font-bold text-slate-900">Zero Unresolved Operational Defects</h3>
      <p class="text-xs text-slate-500 max-w-sm mx-auto mt-1">
        All active assets across all subscriber products are operational with no pending corrective action tasks.
      </p>
    </div>

    <!-- Exception List -->
    <div v-else class="space-y-3">
      <div
        v-for="item in defects"
        :key="item.logId || item.log_id || item.id"
        class="bg-white rounded-2xl border transition shadow-sm overflow-hidden"
        :class="item.defect_severity === 'safety_critical_ground'
          ? 'border-rose-300 bg-rose-50/10 hover:border-rose-400'
          : 'border-amber-300 bg-amber-50/10 hover:border-amber-400'"
      >
        <div class="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <!-- Left: Casefile & Defect Metadata -->
          <div class="space-y-1.5 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span
                class="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full text-white"
                :class="item.defect_severity === 'safety_critical_ground' ? 'bg-rose-600 animate-pulse' : 'bg-amber-600'"
              >
                {{ item.defect_severity === 'safety_critical_ground' ? '● GROUNDED / RED-TAG' : '● ADVISORY' }}
              </span>

              <h3 class="text-base font-black text-slate-900">
                {{ item.file_name }}
              </h3>

              <span class="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Ref: {{ item.file_reference || 'N/A' }}
              </span>

              <span class="text-xs text-slate-400">|</span>
              <span class="text-xs font-bold text-slate-600">{{ item.product_name }}</span>
            </div>

            <div class="text-xs text-slate-600 flex items-center gap-3">
              <span>📋 <strong>{{ item.log_definition_name }}</strong></span>
              <span>👤 Logged by: <strong>{{ item.logged_by_name }}</strong> ({{ item.logged_by_role || 'Field Operator' }})</span>
              <span>⏱️ {{ formatDateTime(item.logged_at) }}</span>
            </div>

            <!-- Telemetry Answers Preview -->
            <div class="mt-2 bg-white/80 p-2.5 rounded-lg border border-slate-200 text-xs font-mono flex flex-wrap gap-2">
            <span 
                v-for="(val, key) in parsePayload(item.payload)" 
                :key="key" 
                class="px-2 py-0.5 rounded bg-slate-50 border border-slate-200"
            >
                <strong class="text-slate-600">{{ key }}:</strong>
                <span :class="val === false ? 'text-rose-600 font-black ml-1' : 'text-slate-700 ml-1'">
                {{ val === false ? 'FAIL' : (val === true ? 'PASS' : val) }}
                </span>
            </span>
            </div>
          </div>

          <!-- Right: Actions -->
          <div class="flex items-center gap-2 shrink-0 self-end md:self-center">
            <button
              @click="openResolveModal(item)"
              class="px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow transition"
            >
              Sign-Off & Resolve (CAPA)
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- CAPA Resolution Modal -->
    <div
      v-if="activeResolvingItem"
      class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4"
    >
      <div class="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <div>
            <h3 class="text-sm font-bold text-slate-900">CAPA Sign-Off & Defect Resolution</h3>
            <p class="text-[11px] text-slate-500 font-mono">{{ activeResolvingItem.file_name }}</p>
          </div>
          <button @click="activeResolvingItem = null" class="text-slate-400 hover:text-slate-600 text-base">✕</button>
        </div>

        <div class="p-6 space-y-4">
          <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
            <div class="font-bold">Original Defect: {{ activeResolvingItem.log_definition_name }}</div>
            <div>Reported by {{ activeResolvingItem.logged_by_name }} at {{ formatDateTime(activeResolvingItem.logged_at) }}</div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">
              Corrective Action Notes / Repair Sign-off *
            </label>
            <textarea
              v-model="resolutionNotes"
              rows="4"
              placeholder="Detail parts replaced, mechanic work order #, or risk mitigation steps..."
              class="w-full text-xs rounded-xl border-slate-300 focus:ring-blue-500 focus:border-blue-500"
              required
            ></textarea>
          </div>

          <label class="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              v-model="restoreOperationalStatus"
              class="rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <span class="text-xs text-slate-700 font-medium">
              Restore Asset Operational Status to <strong class="text-emerald-600">Operational</strong>
            </span>
          </label>
        </div>

        <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button
            @click="activeResolvingItem = null"
            class="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            @click="submitResolution"
            :disabled="isResolving || resolutionNotes.trim().length < 5"
            class="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow disabled:opacity-50 transition"
          >
            {{ isResolving ? 'Submitting...' : 'Sign Off & Close Defect' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import apiClient from '@/services/api'

const isLoading = ref(true)
const isResolving = ref(false)
const defects = ref([])
const totalDefects = ref(0)

const activeResolvingItem = ref(null)
const resolutionNotes = ref('')
const restoreOperationalStatus = ref(true)

const fetchPulse = async () => {
  isLoading.value = true
  try {
    const res = await apiClient.get('/telemetry/pulse')
    defects.value = res.data.data.data || []
    totalDefects.value = res.data.data.total || 0
  } catch (err) {
    console.error('Failed to load Daily Pulse exceptions', err)
  } finally {
    isLoading.value = false
  }
}

const openResolveModal = (item) => {
  activeResolvingItem.value = item
  resolutionNotes.value = ''
  restoreOperationalStatus.value = true
}

const submitResolution = async () => {
  if (!activeResolvingItem.value || resolutionNotes.value.trim().length < 5) return
  
  // Extract ID safely supporting camelCase (logId), snake_case (log_id), or id
  const targetLogId = activeResolvingItem.value.logId 
    ?? activeResolvingItem.value.log_id 
    ?? activeResolvingItem.value.id

  if (!targetLogId) {
    alert('Error: Could not determine defect Log ID.')
    console.error('Active item structure:', activeResolvingItem.value)
    return
  }

  isResolving.value = true

  try {
    await apiClient.post(`/telemetry/logs/${targetLogId}/resolve`, {
      resolution_notes: resolutionNotes.value,
      restore_operational_status: restoreOperationalStatus.value
    })
    activeResolvingItem.value = null
    await fetchPulse()
  } catch (err) {
    console.error('Failed to resolve defect', err)
    alert(err.response?.data?.message || 'Resolution failed.')
  } finally {
    isResolving.value = false
  }
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return 'N/A'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const parsePayload = (payload) => {
  if (!payload) return {}
  if (typeof payload === 'string') {
    try {
      return JSON.parse(payload)
    } catch (_) {
      return {}
    }
  }
  return payload
}

onMounted(() => {
  fetchPulse()
})
</script>