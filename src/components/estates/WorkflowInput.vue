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
      <button type="submit" class="btn-secondary btn-xs">Save</button>
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
