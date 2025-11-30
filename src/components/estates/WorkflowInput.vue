<template>
  <div>
    <!-- Case 1 & 3: Text and Date Inputs are handled by a form -->
    <form
      v-if="dataType === 'text' || dataType === 'timestamptz' || dataType === 'date'"
      @submit.prevent="handleSave"
      class="flex items-center space-x-2"
    >
      <input
        :type="dataType === 'text' ? 'text' : 'date'"
        :value="modelValue"
        @input="handleInput"
        class="form-input w-full text-sm"
        :placeholder="dataType === 'text' ? 'Enter value...' : ''"
      />
      <button type="submit" class="btn-secondary btn-xs px-2 py-1.5 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
          <path d="M7 4V2H13V4H17C17.5523 4 18 4.44772 18 5V15C18 15.5523 17.5523 16 17 16H3C2.44772 16 2 15.5523 2 15V5C2 4.44772 2.44772 4 3 4H7ZM7 11.5C7 10.6716 7.67157 10 8.5 10H11.5C12.3284 10 13 10.6716 13 11.5V13.5C13 14.3284 12.3284 15 11.5 15H8.5C7.67157 15 7 14.3284 7 13.5V11.5Z" clip-rule="evenodd" />
        </svg>
      </button>
    </form>

    <!-- Case 2: Boolean Checkbox is a self-contained action -->
    <div v-else-if="dataType === 'boolean'" class="flex items-center">
      <input
        type="checkbox"
        :checked="modelValue"
        @change="handleCheckboxChange"
        class="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        :id="`workflow_checkbox_${processId}`"
      />
      <label :for="`workflow_checkbox_${processId}`" class="ml-2 text-sm text-gray-700">Mark as Done</label>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  dataType: { type: String, required: true },
  modelValue: { type: [String, Number, Boolean, null], default: null },
  // Pass in the process ID to create unique IDs for labels
  processId: { type: Number, required: true },
});

const emit = defineEmits(['update:modelValue', 'save']);

const handleInput = (event) => {
  emit('update:modelValue', event.target.value);
}

const handleSave = () => {
  emit('save');
}

const handleCheckboxChange = (event) => {
  const isChecked = event.target.checked;
  emit('update:modelValue', isChecked);
  
  // Only emit the save event when the box is checked
  if (isChecked) {
    emit('save');
  }
};
</script>
