<template>
  <div class="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between max-w-lg mx-auto shadow-2xl relative">
    
    <!-- Offline / Sync Status Indicator Bar -->
    <div
      v-if="!isOnline"
      class="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-black text-center flex items-center justify-center gap-1.5 sticky top-0 z-40 shadow-sm"
    >
      <span>⚡</span>
      <span>OFFLINE MODE: Logs will be saved locally and synced when signal returns.</span>
    </div>

    <div
      v-else-if="pendingQueueCount > 0"
      class="bg-blue-600 text-white px-4 py-1.5 text-xs font-bold text-center flex items-center justify-center gap-1.5 sticky top-0 z-40"
    >
      <span class="animate-spin text-sm">↻</span>
      <span>Syncing {{ pendingQueueCount }} offline log(s)...</span>
    </div>

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

        <div class="flex items-center gap-2">
          <!-- Install App Button (if eligible) -->
          <button
            v-if="deferredPrompt"
            @click="installPwa"
            class="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white rounded-lg shadow hover:bg-blue-500 transition"
          >
            + Install App
          </button>
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

      <!-- State 2: Submission Success View (Online or Offline Saved) -->
      <div v-else-if="submissionResult" class="p-6 text-center space-y-6 my-auto">
        <div
          class="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl shadow-xl"
          :class="isDefectFlagged 
            ? 'bg-rose-600 text-white animate-bounce' 
            : (submissionResult.is_offline ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600 text-white')"
        >
          {{ isDefectFlagged ? '🚨' : (submissionResult.is_offline ? '💾' : '✓') }}
        </div>

        <div>
          <h2 class="text-xl font-black text-white">
            <span v-if="submissionResult.is_offline">Saved Locally (Offline)</span>
            <span v-else-if="isDefectFlagged">Operational Defect Flagged!</span>
            <span v-else>Telemetry Logged Successfully</span>
          </h2>
          <p class="text-xs text-slate-400 mt-2">
            Recorded at {{ submissionResult.loggedAt || submissionResult.logged_at }}
          </p>
        </div>

        <!-- Offline Queue Confirmation Box -->
        <div
          v-if="submissionResult.is_offline"
          class="p-4 rounded-xl text-left bg-amber-950/40 border border-amber-700/60 space-y-1.5"
        >
          <div class="text-xs font-bold text-amber-400 uppercase tracking-wider">Device Offline Queue:</div>
          <p class="text-xs text-amber-200/90 leading-relaxed">
            Your inspection was recorded securely on this phone. As soon as your device reconnects to Wi-Fi or cellular network, this entry will upload automatically to the compliance vault.
          </p>
        </div>

        <!-- Defect Grounded Alert Box -->
        <div
          v-else-if="isDefectFlagged"
          class="p-4 rounded-xl text-left bg-rose-950/60 border border-rose-800 space-y-1.5"
        >
          <div class="text-xs font-bold text-rose-400 uppercase tracking-wider">Exception Severity:</div>
          <div class="text-sm font-black text-white uppercase tracking-tight">
            {{ submissionResult.defectSeverity || submissionResult.defect_severity }}
          </div>
          <p class="text-xs text-rose-200/90 pt-1">
            Status transitioned to <strong class="underline">{{ submissionResult.operationalStatus || submissionResult.operational_status }}</strong>. Operations supervisor and workshop alerted.
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

        <!-- Dynamic Form Checklist Renderer -->
        <div v-if="currentBlueprint" class="space-y-4">
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

            <!-- Pass / Fail Toggle -->
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

            <!-- Numeric Input -->
            <div v-else-if="field.type === 'number'" class="pt-1">
              <input
                v-model.number="payload[field.key]"
                type="number"
                inputmode="decimal"
                placeholder="Enter reading..."
                class="w-full bg-slate-900 border-slate-700 rounded-xl text-sm font-mono text-white p-3 focus:ring-blue-500"
              />
            </div>

            <!-- Text / Textarea -->
            <div v-else-if="field.type === 'text'" class="pt-1">
              <input
                v-model="payload[field.key]"
                type="text"
                placeholder="Enter details..."
                class="w-full bg-slate-900 border-slate-700 rounded-xl text-xs text-white p-3 focus:ring-blue-500"
              />
            </div>
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
        <span>{{ isSubmitting ? 'Recording Telemetry...' : (isOnline ? 'Submit Log Entry' : 'Save Entry Locally (Offline)') }}</span>
      </button>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const qrUuid = route.params.qrUuid;

const isOnline = ref(navigator.onLine);
const pendingQueueCount = ref(0);
const deferredPrompt = ref(null);

const contextLoading = ref(true);
const loadError = ref(false);
const isSubmitting = ref(false);
const assetContext = ref(null);
const selectedLogDefinitionId = ref(null);

const operatorName = ref(localStorage.getItem('last_operator_name') || '');
const operatorRole = ref(localStorage.getItem('last_operator_role') || '');
const payload = ref({});
const submissionResult = ref(null);

const availableLogs = computed(() => {
  return assetContext.value?.availableLogs || assetContext.value?.available_logs || [];
});

const currentOperationalStatus = computed(() => {
  return assetContext.value?.operationalStatus || assetContext.value?.operational_status || 'operational';
});

const isDefectFlagged = computed(() => {
  return submissionResult.value?.hasFlaggedIssue || submissionResult.value?.has_flagged_issue || false;
});

const currentBlueprint = computed(() => {
  if (availableLogs.value.length === 0) return null;
  return availableLogs.value.find(l => l.id === selectedLogDefinitionId.value) || availableLogs.value[0];
});

const parsedSchema = computed(() => {
  if (!currentBlueprint.value?.schema) return [];
  const s = currentBlueprint.value.schema;
  if (typeof s === 'string') {
    try {
      return JSON.parse(s);
    } catch (_) {
      return [];
    }
  }
  return Array.isArray(s) ? s : [];
});

const isFormValid = computed(() => {
  return operatorName.value.trim().length > 1 && selectedLogDefinitionId.value !== null && parsedSchema.value.length > 0;
});

// --- NETWORK STATUS LISTENERS ---
const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine;
  if (isOnline.value) {
    syncOfflineQueue();
  }
};

// --- PWA INSTALL PROMPT ---
const handleBeforeInstallPrompt = (e) => {
  e.preventDefault();
  deferredPrompt.value = e;
};

const installPwa = async () => {
  if (!deferredPrompt.value) return;
  deferredPrompt.value.prompt();
  const { outcome } = await deferredPrompt.value.userChoice;
  if (outcome === 'accepted') {
    deferredPrompt.value = null;
  }
};

// --- CONTEXT RETRIEVAL (WITH LOCALSTORAGE CACHE FOR ZERO SIGNAL) ---
const fetchContext = async () => {
  contextLoading.value = true;
  loadError.value = false;

  const cacheKey = `qr_context_${qrUuid}`;

  try {
    const res = await axios.get(`/api/v1/telemetry/context/${qrUuid}`);
    assetContext.value = res.data.data;
    localStorage.setItem(cacheKey, JSON.stringify(res.data.data)); // Cache for offline use
    
    if (availableLogs.value.length > 0) {
      selectedLogDefinitionId.value = availableLogs.value[0].id;
      initPayload();
    }
  } catch (err) {
    // Attempt to load from offline cache
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      assetContext.value = JSON.parse(cached);
      if (availableLogs.value.length > 0) {
        selectedLogDefinitionId.value = availableLogs.value[0].id;
        initPayload();
      }
    } else {
      console.error('Failed to load telemetry context', err);
      loadError.value = true;
    }
  } finally {
    contextLoading.value = false;
  }
};

const initPayload = () => {
  payload.value = {};
  parsedSchema.value.forEach(field => {
    payload.value[field.key] = field.type === 'boolean' ? true : null;
  });
};

const onLogDefinitionChange = () => {
  initPayload();
};

// --- SUBMISSION & OFFLINE QUEUE ENGINE ---
const submitTelemetry = async () => {
  if (!isFormValid.value) return;
  isSubmitting.value = true;

  // Remember operator on this device
  localStorage.setItem('last_operator_name', operatorName.value);
  localStorage.setItem('last_operator_role', operatorRole.value);

  const submissionPayload = {
    log_definition_id: selectedLogDefinitionId.value,
    logged_by_name: operatorName.value,
    logged_by_role: operatorRole.value,
    payload: payload.value,
    client_timestamp: new Date().toISOString()
  };

  // If OFFLINE: Queue locally
  if (!navigator.onLine) {
    queueOfflineSubmission(submissionPayload);
    submissionResult.value = {
      is_offline: true,
      logged_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      has_flagged_issue: false
    };
    isSubmitting.value = false;
    return;
  }

  // If ONLINE: Post directly
  try {
    const res = await axios.post(`/api/v1/telemetry/ingest/${qrUuid}`, submissionPayload);
    submissionResult.value = res.data.data;
  } catch (err) {
    // Network failed mid-request -> fallback to offline queue
    console.warn('Network error during submission, queueing offline', err);
    queueOfflineSubmission(submissionPayload);
    submissionResult.value = {
      is_offline: true,
      logged_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      has_flagged_issue: false
    };
  } finally {
    isSubmitting.value = false;
  }
};

const queueOfflineSubmission = (data) => {
  const queue = JSON.parse(localStorage.getItem('offline_telemetry_queue') || '[]');
  queue.push({ qrUuid, data, queuedAt: new Date().toISOString() });
  localStorage.setItem('offline_telemetry_queue', JSON.stringify(queue));
  updateQueueCount();
};

const updateQueueCount = () => {
  const queue = JSON.parse(localStorage.getItem('offline_telemetry_queue') || '[]');
  pendingQueueCount.value = queue.length;
};

// --- AUTO-SYNC FLUSH WHEN RECONNECTING ---
const syncOfflineQueue = async () => {
  const queue = JSON.parse(localStorage.getItem('offline_telemetry_queue') || '[]');
  if (queue.length === 0) return;

  const remaining = [];
  for (const item of queue) {
    try {
      await axios.post(`/api/v1/telemetry/ingest/${item.qrUuid}`, item.data);
    } catch (e) {
      remaining.push(item); // Keep in queue if it failed
    }
  }

  localStorage.setItem('offline_telemetry_queue', JSON.stringify(remaining));
  updateQueueCount();
};

const resetForm = () => {
  submissionResult.value = null;
  initPayload();
  fetchContext();
};

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  
  updateQueueCount();
  fetchContext();
  
  if (navigator.onLine) {
    syncOfflineQueue();
  }
});

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus);
  window.removeEventListener('offline', updateOnlineStatus);
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
});
</script>

<style scoped>
.bg-slate-850 {
  background-color: #131b2e;
}
</style>