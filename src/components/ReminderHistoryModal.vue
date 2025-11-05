<template>
<!-- frontend-spa\src\components\ReminderHistoryModal.vue -->
  <Transition name="fade">
    <div
      v-if="modelValue"
      @click.self="closeModal"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4"
    >
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <!-- Modal Header -->
        <div class="flex justify-between items-center p-4 border-b">
          <h3 class="text-lg font-semibold text-gray-800">Reminder History</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6 overflow-y-auto">
          <!-- Loading State -->
          <div v-if="isLoading" class="text-center py-8">
            <p class="text-gray-500">Loading history...</p>
          </div>
          <!-- Error State -->
          <div v-else-if="error" class="text-center py-8 text-red-500 bg-red-50 p-3 rounded">
            <p>{{ error }}</p>
          </div>
          <!-- Empty State -->
          <div v-else-if="!reminders.length" class="text-center py-8 text-gray-500">
            <p>No reminder history found for this step.</p>
          </div>
          <!-- History Table -->
          <div v-else>
            <table class="w-full text-sm text-left text-gray-500">
              <thead class="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" class="px-4 py-3">Date</th>
                  <th scope="col" class="px-4 py-3">Status</th>
                  <th scope="col" class="px-4 py-3">User</th>
                  <th scope="col" class="px-4 py-3">Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="reminder in reminders"
                  :key="reminder.id"
                  class="bg-white border-b hover:bg-gray-50"
                >
                  <td class="px-4 py-4 font-medium text-gray-900 whitespace-nowrap">{{ reminder.dueDate }}</td>
                  <td class="px-4 py-4">
                    <span
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      :class="{
                        'bg-yellow-100 text-yellow-800': reminder.status === 'Pending',
                        'bg-green-100 text-green-800': reminder.status === 'Completed',
                        'bg-red-100 text-red-800': reminder.status === 'Escalated',
                        'bg-gray-100 text-gray-800': reminder.status === 'Cancelled',
                      }"
                    >
                      {{ reminder.status }}
                    </span>
                  </td>
                  <td class="px-4 py-4">{{ reminder.user ? reminder.user.name : 'N/A' }}</td>
                  <td class="px-4 py-4 text-gray-700">{{ reminder.notes || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex justify-end p-4 border-t bg-gray-50 rounded-b-lg">
          <button @click="closeModal" class="btn-secondary">Close</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue';
import estateService from '@/services/api/estateService'; // Using @/ alias

// --- PROPS & EMITS ---
// This component uses the standard v-model pattern for visibility.
// The parent will use v-model="isModalVisible"
const props = defineProps({
  modelValue: { // The 'v-model' value, controls if the modal is shown
    type: Boolean,
    default: false,
  },
  processId: { // The ID of the workflow process whose history we need to fetch
    type: Number,
    default: null,
  },
});

const emit = defineEmits(['update:modelValue']); // The 'v-model' emit

// --- COMPONENT STATE ---
const reminders = ref([]);
const isLoading = ref(false);
const error = ref(null);

// --- API METHODS ---
const fetchHistory = async (id) => {
  if (!id) {
    reminders.value = [];
    return;
  }
  isLoading.value = true;
  error.value = null;
  reminders.value = [];
  try {
    const response = await estateService.getReminderHistory(id);
    reminders.value = response.data.data; // Assuming API resource collection wraps in 'data'
  } catch (err) {
    error.value = 'Failed to load reminder history.';
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

// --- LOGIC ---
const closeModal = () => {
  emit('update:modelValue', false);
};

// --- WATCHERS ---
// This is the trigger. When the parent sets a new processId,
// we automatically fetch the history for it.
watch(() => props.processId, (newId) => {
  if (props.modelValue && newId) {
    fetchHistory(newId);
  }
});

</script>



<style scoped>
/* Simple fade transition for the modal */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>