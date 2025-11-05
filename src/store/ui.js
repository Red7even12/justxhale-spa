// src/store/ui.js

import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUiStore = defineStore('ui', () => {
  // state: an array to hold the header action buttons
  const headerActions = ref([]);

  // Toast Notification State
  const toastMessage = ref('');
  const toastType = ref('success'); // can be 'success' or 'error'
  const isToastVisible = ref(false);
  let toastTimeout = null;

  // action: to set the buttons from a child component
  function setHeaderActions(actions) {
    headerActions.value = actions;
  }

  // action: to clear the buttons when the child component is unmounted
  function clearHeaderActions() {
    headerActions.value = [];
  }

  // Action to show a toast notification
  function showToast(message, type = 'success') {
    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }
    toastMessage.value = message;
    toastType.value = type;
    isToastVisible.value = true;

    toastTimeout = setTimeout(() => {
      isToastVisible.value = false;
      toastMessage.value = '';
    }, 3000); // Toast visible for 3 seconds
  }

  // Convenience actions for specific toast types
  function showSuccessToast(message) {
    showToast(message, 'success');
  }

  function showErrorToast(message) {
    showToast(message, 'error');
  }

  return {
    headerActions,
    setHeaderActions,
    clearHeaderActions,
    toastMessage,
    toastType,
    isToastVisible,
    showToast,
    showSuccessToast,
    showErrorToast,
  };
});