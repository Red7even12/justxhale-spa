<template>
  <!-- frontend-spa\src\components\common\Modal.vue -->
  <teleport to="body">
    <transition leave-active-class="duration-200">
      <div v-show="show" class="fixed inset-0 overflow-y-auto px-4 py-6 sm:px-0 z-50" scroll-region>
        <!-- Modal Overlay -->
        <transition
          enter-active-class="ease-out duration-300"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="ease-in duration-200"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div v-show="show" class="fixed inset-0 transform transition-all" @click="close">
            <div class="absolute inset-0 bg-gray-500 opacity-75" />
          </div>
        </transition>

        <!-- Modal Content -->
        <transition
          enter-active-class="ease-out duration-300"
          enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enter-to-class="opacity-100 translate-y-0 sm:scale-100"
          leave-active-class="ease-in duration-200"
          leave-from-class="opacity-100 translate-y-0 sm:scale-100"
          leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <div v-show="show" class="mb-6 bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:w-full sm:max-w-2xl sm:mx-auto">
            <!-- START: NEW HEADER SECTION -->
            <div class="flex items-center justify-between px-6 py-4 border-b">
              <div class="text-lg font-medium text-gray-900">
                <slot name="title" /> <!-- Title slot -->
              </div>
              <button @click="close" class="text-gray-400 hover:text-gray-600">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <!-- END: NEW HEADER SECTION -->

            <slot /> <!-- The main content slot -->
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';

// The 'show' prop controls the visibility of the modal from the parent component
const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
});

// The 'close' event is emitted to tell the parent component to hide the modal
const emit = defineEmits(['close']);

const close = () => {
  emit('close');
};

// Listen for the 'Escape' key to close the modal
const handleKeydown = (e) => {
  if (e.key === 'Escape' && props.show) {
    close();
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
/*
  Define the transition effects for a smooth fade-in and fade-out.
  These classes are used by the <Transition> component.
*/
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>