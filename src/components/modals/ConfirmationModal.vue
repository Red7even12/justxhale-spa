<!-- frontend-spa/src/components/modals/ConfirmationModal.vue -->
<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
      
      <!-- Modal Header -->
      <div class="mb-4">
        <h3 class="text-xl font-semibold text-gray-900">{{ title }}</h3>
      </div>

      <!-- Modal Body -->
      <p class="text-gray-600 mb-6">{{ message }}</p>

      <!-- Modal Footer -->
      <div class="flex justify-end space-x-4">
        <!-- MODIFIED: Conditionally show the cancel button -->
        <button v-if="mode === 'confirm'" @click="onCancel" class="btn-secondary">
          {{ cancelButtonText }}
        </button>
        <button @click="onConfirm" class="btn-primary">
          {{ confirmButtonText }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>


defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: 'Confirm Action',
  },
  message: {
    type: String,
    required: true,
  },
  confirmButtonText: {
    type: String,
    default: 'Confirm',
  },
  cancelButtonText: {
    type: String,
    default: 'Cancel',
  },
    mode: {
    type: String,
    default: 'confirm', // 'confirm' or 'notify'
  },
});

const emit = defineEmits(['confirm', 'cancel']);

const onConfirm = () => {
  emit('confirm');
};

const onCancel = () => {

  emit('cancel');
};
</script>

<style scoped>
/* You can add button styles to a global CSS file, but for this example, they are here. */
/* These styles are based on section 9 of your project documentation. */

.btn-primary {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 600;
  color: #EBF5F5;
  background-color: #72958D;
  border: 1px solid #71B6B1;
  transition: all 0.2s ease-in-out;
}
.btn-primary:hover {
  color: #72958D;
  background-color: #ABE0E0;
  border-color: #0F2629;
}

.btn-secondary {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 600;
  color: #72958D;
  background-color: #EBF5F5;
  border: 1px solid #72958D;
  transition: all 0.2s ease-in-out;
}
.btn-secondary:hover {
  color: #0F2629;
  background-color: #D2F1F1;
  border-color: #455E5E;
}
</style>