<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-6 py-5">
      <h1 class="text-xl font-black text-gray-900 tracking-tight">My Compliance Profile</h1>
      <p class="text-xs text-gray-500 mt-0.5">
        Read-only view of the case files registered against you, including your field telemetry history.
      </p>
    </div>

    <!-- Loader -->
    <div v-if="loading" class="p-10 flex justify-center text-gray-400">
      <span class="animate-spin text-sm">↻</span>&nbsp;Loading your compliance profile...
    </div>

    <!-- Error -->
    <div v-else-if="error" class="p-10 text-center">
      <p class="text-rose-600 font-bold">{{ error }}</p>
    </div>

    <!-- Empty -->
    <div v-else-if="caseFiles.length === 0" class="p-10 text-center">
      <p class="text-3xl">🛰️</p>
      <p class="text-sm text-gray-500 mt-2">No case files are registered against your profile yet.</p>
    </div>

    <!-- List -->
    <div v-else class="p-6 space-y-5 max-w-5xl">
      <div v-for="cf in caseFiles" :key="cf.id" class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base font-bold text-gray-900">{{ cf.file_name }}</h2>
              <span
                class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                :class="statusClass(cf.operational_status)"
              >
                ● {{ cf.operational_status || 'n/a' }}
              </span>
            </div>
            <p class="text-xs text-gray-500 font-mono mt-0.5">
              Ref: {{ cf.file_reference || 'N/A' }} · {{ cf.file_type?.name || 'General' }}
            </p>
          </div>
          <div class="text-right">
            <div class="text-xs text-gray-400 font-bold uppercase tracking-wider">{{ cf.product?.name || '—' }}</div>
            <div class="text-xs text-gray-500 mt-0.5">
              {{ cf.logs_count }} log entr{{ cf.logs_count === 1 ? 'y' : 'ies' }} ·
              Last {{ formatDateTime(cf.last_logged_at) }}
            </div>
          </div>
        </div>

        <!-- Telemetry log stream -->
        <div v-if="cf.logs && cf.logs.length" class="divide-y divide-gray-50">
          <div v-for="log in cf.logs" :key="log.id" class="px-5 py-3 flex items-start justify-between gap-4">
            <div>
              <div class="text-sm font-semibold text-gray-800">{{ log.log_definition || 'Field telemetry' }}</div>
              <div class="text-xs text-gray-400 mt-0.5">
                {{ log.category || '' }} · Recorded {{ formatDateTime(log.logged_at) }}
              </div>
            </div>
            <template v-if="log.has_flagged_issue">
              <span
                class="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full"
                :class="log.is_resolved
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-rose-100 text-rose-700 animate-pulse'"
              >
                {{ log.is_resolved ? 'Resolved' : 'Open defect' }}
              </span>
            </template>
          </div>
        </div>
        <div v-else class="px-5 py-4 text-xs text-gray-400 italic">No field telemetry recorded for this case file.</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/services/api';

const loading = ref(true);
const error = ref(null);
const caseFiles = ref([]);

const statusClass = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'operational') return 'bg-emerald-100 text-emerald-700';
  if (s === 'grounded') return 'bg-rose-100 text-rose-700 animate-pulse';
  if (s === 'advisory') return 'bg-amber-100 text-amber-700';
  return 'bg-gray-100 text-gray-600';
};

const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
};

const fetchCompliance = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await apiClient.get('/profile/compliance');
    caseFiles.value = res.data.data || [];
  } catch (e) {
    error.value = e.response?.data?.message || 'Failed to load your compliance profile.';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchCompliance);
</script>