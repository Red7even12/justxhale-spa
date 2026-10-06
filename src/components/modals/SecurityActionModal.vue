<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
    <div class="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
      
      <!-- Header -->
      <div class="flex items-center gap-3 mb-4">
        <div :class="[
          actionType === 'deactivate' || actionType === 'force-reset' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600',
          'h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg'
        ]">
          <span v-if="actionType === 'force-reset'">🔒</span>
          <span v-else-if="actionType === 'deactivate'">⏸</span>
          <span v-else>▶</span>
        </div>
        <div>
          <h3 class="text-base font-bold text-gray-900">{{ title }}</h3>
          <p class="text-xs text-gray-500">{{ targetUser?.name }} ({{ targetUser?.email }})</p>
        </div>
      </div>

      <!-- Compliance Notice -->
      <div class="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs mb-4">
        ⚠️ <strong>POPIA & ISO Compliance Audit:</strong> This security event is permanently written to the non-deletable audit ledger under your administrator credentials.
      </div>

      <!-- Compulsory Reason Input -->
      <div class="space-y-2">
        <label class="block text-xs font-bold uppercase tracking-wider text-gray-700">
          Reason / Circumstances * (Min 10 characters)
        </label>
        <textarea
          v-model="reason"
          rows="3"
          required
          minlength="10"
          placeholder="e.g. Account suspended due to employee resignation / suspected credential breach..."
          class="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs p-3 border"
        ></textarea>
        <div class="flex justify-between items-center text-[11px]">
          <span :class="reason.trim().length >= 10 ? 'text-green-600 font-bold' : 'text-gray-400'">
            {{ reason.trim().length }} / 10 min characters
          </span>
          <span v-if="error" class="text-red-600 font-bold">{{ error }}</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="mt-6 flex justify-end gap-3">
        <button
          type="button"
          @click="handleCancel"
          :disabled="isSubmitting"
          class="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          @click="handleConfirm"
          :disabled="reason.trim().length < 10 || isSubmitting"
          :class="[
            actionType === 'deactivate' || actionType === 'force-reset' 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-indigo-600 hover:bg-indigo-700',
            'px-5 py-2 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all'
          ]"
        >
          {{ isSubmitting ? 'Recording Audit...' : confirmButtonText }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  show: Boolean,
  title: String,
  actionType: String, // 'activate' | 'deactivate' | 'force-reset'
  targetUser: Object,
  confirmButtonText: {
    type: String,
    default: 'Confirm Action',
  },
  isSubmitting: Boolean,
});

const emit = defineEmits(['confirm', 'cancel']);

const reason = ref('');
const error = ref('');

watch(() => props.show, (newVal) => {
  if (newVal) {
    reason.value = '';
    error.value = '';
  }
});

const handleConfirm = () => {
  if (reason.value.trim().length < 10) {
    error.value = 'Please provide at least 10 characters explaining this change.';
    return;
  }
  emit('confirm', {
    user: props.targetUser,
    actionType: props.actionType,
    reason: reason.value.trim(),
  });
};

const handleCancel = () => {
  emit('cancel');
};
</script>