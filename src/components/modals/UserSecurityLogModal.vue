<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
    <div class="relative bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 max-h-[85vh] flex flex-col">
      
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
            🛡️ Security &amp; Compliance Audit Ledger
          </h3>
          <p class="text-xs text-gray-500 mt-0.5">
            Audit history for <strong>{{ user?.name }}</strong> ({{ user?.email }})
          </p>
        </div>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 font-bold text-lg p-1">
          ✕
        </button>
      </div>

      <!-- Ledger Content (Scrollable) -->
      <div class="mt-4 flex-1 overflow-y-auto pr-1">
        <div v-if="loading" class="py-12 text-center text-xs text-gray-500 italic">
          Loading immutable audit records...
        </div>

        <div v-else-if="logs.length === 0" class="py-12 text-center">
          <p class="text-xs text-gray-400 italic">No security events or forced resets recorded for this account yet.</p>
        </div>

        <!-- Audit Timeline -->
        <ol v-else class="relative border-l border-gray-200 ml-3 space-y-6">
          <li v-for="log in logs" :key="log.id" class="ml-6">
            <!-- Timeline Bullet -->
            <span :class="[
              log.event === 'forced_password_reset' ? 'bg-red-500 ring-red-100' :
              log.event === 'account_deactivated' ? 'bg-amber-500 ring-amber-100' :
              'bg-green-500 ring-green-100',
              'absolute -left-3 flex items-center justify-center w-6 h-6 rounded-full ring-4 text-white text-[10px] font-bold'
            ]">
              {{ log.event === 'forced_password_reset' ? '🔒' : log.event === 'account_deactivated' ? '⏸' : '▶' }}
            </span>

            <div class="bg-gray-50 p-4 rounded-xl border border-gray-200/80 space-y-2">
              <div class="flex items-center justify-between">
                <span :class="[
                  log.event === 'forced_password_reset' ? 'bg-red-100 text-red-800 border-red-200' :
                  log.event === 'account_deactivated' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                  'bg-green-100 text-green-800 border-green-200',
                  'px-2 py-0.5 text-[10px] font-bold uppercase rounded border'
                ]">
                  {{ formatEvent(log.event) }}
                </span>
                <span class="text-[11px] text-gray-400 font-mono">
                  {{ formatDate(log.created_at) }}
                </span>
              </div>

              <!-- Reason -->
              <p class="text-xs text-gray-800 font-medium whitespace-pre-wrap leading-relaxed">
                "{{ log.reason }}"
              </p>

              <!-- Provenance Metadata -->
              <div class="pt-2 border-t border-gray-200/60 flex flex-wrap justify-between items-center text-[10px] text-gray-400">
                <!-- Timestamp -->
                <span class="text-[11px] text-gray-400 font-mono">
                {{ formatDate(log.createdAt || log.created_at) }}
                </span>

                <!-- Acting Administrator -->
                <span class="text-[10px] text-gray-400">
                Acting Administrator: 
                <strong class="text-gray-700">
                    {{ log.actorName || log.actor_name || 'System / Direct' }}
                </strong>
                <span v-if="log.actorEmail || log.actor_email" class="ml-1">
                    ({{ log.actorEmail || log.actor_email }})
                </span>
                </span>

                <!-- IP Address from Meta Data -->
                <span v-if="parseMeta(log.metaData || log.meta_data)?.ip_address" class="text-[10px] text-gray-400">
                IP: {{ parseMeta(log.metaData || log.meta_data).ip_address }}
                </span>
              </div>
            </div>
          </li>
        </ol>
      </div>

      <!-- Modal Footer -->
      <div class="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-[11px] text-gray-400">
        <span>🔒 Immutable record (POPIA compliance)</span>
        <button
          type="button"
          @click="$emit('close')"
          class="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-200 transition-colors"
        >
          Close Ledger
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import userService from '@/services/userService';

const props = defineProps({
  show: Boolean,
  user: Object,
  context: {
    type: String,
    default: 'subscriber',
  },
});

defineEmits(['close']);

const logs = ref([]);
const loading = ref(false);

const fetchLogs = async () => {
  if (!props.user?.id) return;
  loading.value = true;
  try {
    const res = await userService.getSecurityLogs(props.user.id, props.context);
    logs.value = res.data?.data || [];
  } catch (err) {
    console.error('Failed to load user security logs:', err);
    logs.value = [];
  } finally {
    loading.value = false;
  }
};

watch(() => props.show, (newVal) => {
  if (newVal) {
    fetchLogs();
  }
});

const formatEvent = (evt) => {
  return evt?.replace(/_/g, ' ') || 'Security Event';
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' });
};

const parseMeta = (meta) => {
  if (!meta) return {};
  return typeof meta === 'string' ? JSON.parse(meta) : meta;
};
</script>