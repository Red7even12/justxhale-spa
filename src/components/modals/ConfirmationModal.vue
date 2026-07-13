<!-- frontend-spa/src/components/modals/ConfirmationModal.vue -->
<template>
  <!-- Teleport to body ensures it is not trapped inside the layout's Z-index context -->
  <Teleport to="body">
    <!-- 
      We use z-[9999] (with brackets) so Tailwind generates the high Z-index. 
      The backdrop is built into this fixed container.
    -->
    <div v-if="show" class="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm">
      
      <!-- Modal Box -->
      <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 transform transition-all border border-gray-100">
        
        <!-- Modal Header -->
        <div class="mb-4">
          <h3 class="text-xl font-black text-gray-900 uppercase tracking-tight">{{ title }}</h3>
        </div>

        <!-- Modal Body -->
        <div class="mb-8">
          <p class="text-sm font-medium text-gray-600 leading-relaxed">{{ message }}</p>
        </div>

        <!-- Modal Footer -->
        <div class="flex justify-end gap-3">
          <!-- Cancel Button -->
          <button 
            v-if="mode === 'confirm'" 
            @click="onCancel" 
            class="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 uppercase tracking-widest transition-colors"
          >
            {{ cancelButtonText || 'Cancel' }}
          </button>
          
          <!-- Confirm/OK Button -->
          <button 
            @click="onConfirm" 
            class="bg-brand-primary text-white px-6 py-2 rounded-xl text-xs font-black shadow-lg shadow-brand-primary/20 hover:opacity-90 uppercase tracking-widest transition-all"
          >
            {{ confirmButtonText || 'Confirm' }}
          </button>
        </div>

      </div>
    </div> 
  </Teleport>
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