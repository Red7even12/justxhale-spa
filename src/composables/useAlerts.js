import { ref } from 'vue';

const showModal = ref(false);
const modalTitle = ref('');
const modalMessage = ref('');
const modalMode = ref('notify'); // 'notify' or 'confirm'
const resolvePromise = ref(null);

export function useAlerts() {
  const showAlert = (title, message) => {
    return new Promise((resolve) => {
      showModal.value = true;
      modalTitle.value = title;
      modalMessage.value = message;
      modalMode.value = 'notify';
      resolvePromise.value = resolve;
    });
  };

  const showConfirm = (title, message) => {
    return new Promise((resolve) => {
      showModal.value = true;
      modalTitle.value = title;
      modalMessage.value = message;
      modalMode.value = 'confirm';
      resolvePromise.value = resolve;
    });
  };

  const onConfirm = () => {
    showModal.value = false;
    if (resolvePromise.value) {
      resolvePromise.value(true);
    }
  };

  const onCancel = () => {
    showModal.value = false;
    if (resolvePromise.value) {
      resolvePromise.value(false);
    }
  };

  return {
    showModal,
    modalTitle,
    modalMessage,
    modalMode,
    showAlert,
    showConfirm,
    onConfirm,
    onCancel,
  };
}
