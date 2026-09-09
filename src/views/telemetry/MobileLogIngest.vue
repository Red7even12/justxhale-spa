<template>
  <div class="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between max-w-lg mx-auto shadow-2xl">
    <!-- Header: Asset & Product DNA Banner -->
    <header class="p-4 border-b border-slate-800 bg-slate-950/80 sticky top-0 z-30 backdrop-blur">
      <div v-if="contextLoading" class="animate-pulse flex items-center space-x-3">
        <div class="w-10 h-10 bg-slate-800 rounded-lg"></div>
        <div class="flex-1 space-y-1.5">
          <div class="h-3 bg-slate-800 rounded w-1/2"></div>
          <div class="h-2 bg-slate-800 rounded w-1/3"></div>
        </div>
      </div>

      <div v-else-if="assetContext" class="flex items-center justify-between">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-base font-black text-white tracking-tight">
              {{ assetContext.fileName || assetContext.file_name }}
            </h1>
            <span
              class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
              :class="{
                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30': currentOperationalStatus === 'operational',
                'bg-amber-500/20 text-amber-400 border border-amber-500/30': currentOperationalStatus === 'advisory',
                'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse': currentOperationalStatus === 'grounded'
              }"
            >
              ● {{ currentOperationalStatus }}
            </span>
          </div>
          <p class="text-xs text-slate-400 font-mono mt-0.5">
            Ref: {{ assetContext.fileReference || assetContext.file_reference || 'N/A' }} | 
            {{ assetContext.fileType?.name || assetContext.file_type?.name }}
          </p>
        </div>

        <div v-if="assetContext.product?.name" class="text-right">
          <span class="text-[10px] uppercase tracking-widest text-blue-400 font-bold">
            {{ assetContext.product.name }}
          </span>
        </div>
      </div>
    </header>

    <!-- Main Dynamic Form Body -->
    <main class="flex-1 p-4 overflow-y-auto space-y-5">
      <!-- State 1: Error Loading Context -->
      <div v-if="loadError" class="p-6 bg-rose-950/40 border border-rose-800 rounded-2xl text-center space-y-3">
        <span class="text-3xl">⚠️</span>
        <h2 class="text-base font-bold text-rose-200">Asset QR Code Not Found</h2>
        <p class="text-xs text-rose-300/80">
          This QR code does not match an active case file or asset registry. Please verify the tag.
        </p>
      </div>

      <!-- State 2: Submission Success View -->
      <div v-else-if="submissionResult" class="p-6 text-center space-y-6 my-auto">
        <div
          class="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl shadow-xl"
          :class="isDefectFlagged ? 'bg-rose-600 text-white animate-bounce' : 'bg-emerald-600 text-white'"
        >
          {{ isDefectFlagged ? '🚨' : '✓' }}
        </div>

        <div>
          <h2 class="text-xl font-black text-white">
            {{ isDefectFlagged ? 'Operational Defect Flagged!' : 'Telemetry Logged Successfully' }}
          </h2>
          <p class="text-xs text-slate-400 mt-2">
            Recorded at {{ submissionResult.loggedAt || submissionResult.logged_at }}
          </p>
        </div>

        <div
          v-if="isDefectFlagged"
          class="p-4 rounded-xl text-left bg-rose-950/60 border border-rose-800 space-y-1.5"
        >
          <div class="text-xs font-bold text-rose-400 uppercase tracking-wider">Exception Severity:</div>
          <div class="text-sm font-black text-white uppercase tracking-tight">
            {{ submissionResult.defectSeverity || submissionResult.defect_severity }}
          </div>
          <p class="text-xs text-rose-200/90 pt-1">
            Status transitioned to <strong class="underline">{{ submissionResult.operationalStatus || submissionResult.operational_status }}</strong>. Supervisor alerted.
          </p>
        </div>

        <button
          @click="resetForm"
          class="w-full py-3 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition"
        >
          Submit Another Entry
        </button>
      </div>

      <!-- State 3: Active Form Entry -->
      <div v-else-if="assetContext" class="space-y-5">
        <!-- Blueprint Selector (if multiple exist) -->
        <div v-if="availableLogs.length > 1" class="space-y-1.5">
          <label class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Select Routine</label>
          <select
            v-model="selectedLogDefinitionId"
            @change="onLogDefinitionChange"
            class="w-full bg-slate-800 border-slate-700 rounded-xl text-xs text-white p-3 focus:ring-blue-500"
          >
            <option v-for="log in availableLogs" :key="log.id" :value="log.id">
              {{ log.name }} ({{ log.category }})
            </option>
          </select>
        </div>

        <!-- Operator Identity Block -->
        <div class="bg-slate-850 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div class="text-[11px] font-bold uppercase tracking-wider text-blue-400">Operator Identity</div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] text-slate-400 uppercase font-bold mb-1">Your Full Name *</label>
              <input
                v-model="operatorName"
                type="text"
                placeholder="e.g. Sipho Ndlovu"
                class="w-full bg-slate-900 border-slate-700 rounded-xl text-xs text-white p-2.5 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label class="block text-[10px] text-slate-400 uppercase font-bold mb-1">Role / Designation</label>
              <input
                v-model="operatorRole"
                type="text"
                placeholder="e.g. Code 14 Driver / Artisan"
                class="w-full bg-slate-900 border-slate-700 rounded-xl text-xs text-white p-2.5 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <!-- No Checklists Attached Notice -->
        <div v-if="availableLogs.length === 0" class="p-6 bg-slate-850 border border-dashed border-slate-700 rounded-2xl text-center space-y-2">
          <span class="text-2xl">📋</span>
          <h3 class="text-sm font-bold text-slate-200">No Logbook Blueprints Attached</h3>
          <p class="text-xs text-slate-400">
            The niche <strong>"{{ assetContext.fileType?.name || assetContext.file_type?.name }}"</strong> has no active logbooks attached in the Foundry.
          </p>
        </div>

        <!-- Dynamic Form Schema Renderer -->
        <div v-else-if="currentBlueprint" class="space-y-4">
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {{ currentBlueprint.name }} Checklist
          </div>

          <div
            v-for="field in parsedSchema"
            :key="field.key"
            class="p-4 rounded-2xl bg-slate-850 border border-slate-800 space-y-2"
          >
            <div class="flex justify-between items-center">
              <label class="text-xs font-bold text-slate-200">{{ field.label }}</label>
            </div>

            <!-- 1. Pass / Fail Toggle -->
            <div v-if="field.type === 'boolean'" class="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                @click="payload[field.key] = true"
                class="py-3 text-xs font-black rounded-xl border transition flex items-center justify-center gap-1"
                :class="payload[field.key] === true
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'"
              >
                <span>✓</span> PASS / OK
              </button>
              <button
                type="button"
                @click="payload[field.key] = false"
                class="py-3 text-xs font-black rounded-xl border transition flex items-center justify-center gap-1"
                :class="payload[field.key] === false
                  ? 'bg-rose-600 border-rose-500 text-white shadow-lg'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'"
              >
                <span>✕</span> FAIL / DEFECT
              </button>
            </div>

            <!-- 2. Numeric Input -->
            <div v-else-if="field.type === 'number'" class="pt-1">
              <input
                v-model.number="payload[field.key]"
                type="number"
                inputmode="decimal"
                placeholder="Enter reading..."
                class="w-full bg-slate-900 border-slate-700 rounded-xl text-sm font-mono text-white p-3 focus:ring-blue-500"
              />
            </div>

            <!-- 3. Short Text -->
            <div v-else-if="field.type === 'text'" class="pt-1">
              <input
                v-model="payload[field.key]"
                type="text"
                placeholder="Enter details..."
                class="w-full bg-slate-900 border-slate-700 rounded-xl text-xs text-white p-3 focus:ring-blue-500"
              />
            </div>

            <!-- 4. Textarea -->
            <div v-else-if="field.type === 'textarea'" class="pt-1">
              <textarea
                v-model="payload[field.key]"
                rows="2"
                placeholder="Remarks..."
                class="w-full bg-slate-900 border-slate-700 rounded-xl text-xs text-white p-2.5 focus:ring-blue-500"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer Action Bar -->
    <footer v-if="assetContext && !submissionResult && availableLogs.length > 0" class="p-4 border-t border-slate-800 bg-slate-950/80 sticky bottom-0 z-30">
      <button
        @click="submitTelemetry"
        :disabled="isSubmitting || !isFormValid"
        class="w-full py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 shadow-xl transition flex items-center justify-center gap-2"
      >
        <span v-if="isSubmitting" class="animate-spin text-sm">↻</span>
        <span>{{ isSubmitting ? 'Recording Telemetry...' : 'Submit Log Entry' }}</span>
      </button>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const qrUuid = route.params.qrUuid

const contextLoading = ref(true)
const loadError = ref(false)
const isSubmitting = ref(false)
const assetContext = ref(null)
const selectedLogDefinitionId = ref(null)

const operatorName = ref('')
const operatorRole = ref('')
const payload = ref({})
const submissionResult = ref(null)

// Support both availableLogs (camelCase) and available_logs (snake_case)
const availableLogs = computed(() => {
  return assetContext.value?.availableLogs || assetContext.value?.available_logs || []
})

const currentOperationalStatus = computed(() => {
  return assetContext.value?.operationalStatus || assetContext.value?.operational_status || 'operational'
})

const isDefectFlagged = computed(() => {
  return submissionResult.value?.hasFlaggedIssue || submissionResult.value?.has_flagged_issue || false
})

const currentBlueprint = computed(() => {
  if (availableLogs.value.length === 0) return null
  return availableLogs.value.find(l => l.id === selectedLogDefinitionId.value) || availableLogs.value[0]
})

const parsedSchema = computed(() => {
  if (!currentBlueprint.value?.schema) return []
  const s = currentBlueprint.value.schema
  if (typeof s === 'string') {
    try {
      return JSON.parse(s)
    } catch (_) {
      return []
    }
  }
  return Array.isArray(s) ? s : []
})

const isFormValid = computed(() => {
  return operatorName.value.trim().length > 1 && selectedLogDefinitionId.value !== null && parsedSchema.value.length > 0
})

const fetchContext = async () => {
  contextLoading.value = true
  loadError.value = false
  try {
    const res = await axios.get(`/api/v1/telemetry/context/${qrUuid}`)
    assetContext.value = res.data.data
    
    if (availableLogs.value.length > 0) {
      selectedLogDefinitionId.value = availableLogs.value[0].id
      initPayload()
    }
  } catch (err) {
    console.error('Failed to load telemetry context', err)
    loadError.value = true
  } finally {
    contextLoading.value = false
  }
}

const initPayload = () => {
  payload.value = {}
  parsedSchema.value.forEach(field => {
    payload.value[field.key] = field.type === 'boolean' ? true : null
  })
}

const onLogDefinitionChange = () => {
  initPayload()
}

const submitTelemetry = async () => {
  if (!isFormValid.value) return
  isSubmitting.value = true

  try {
    const res = await axios.post(`/api/v1/telemetry/ingest/${qrUuid}`, {
      log_definition_id: selectedLogDefinitionId.value,
      logged_by_name: operatorName.value,
      logged_by_role: operatorRole.value,
      payload: payload.value
    })
    submissionResult.value = res.data.data
  } catch (err) {
    console.error('Submission failed', err)
    alert(err.response?.data?.message || 'Failed to submit telemetry.')
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  submissionResult.value = null
  initPayload()
  fetchContext()
}

onMounted(() => {
  fetchContext()
})
</script>

<style scoped>
.bg-slate-850 {
  background-color: #131b2e;
}
</style>