<template>
  <!-- frontend-spa\src\components\estates\EstatesTable.vue -->
  <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
    <table class="min-w-full divide-y divide-gray-300">
      <thead class="bg-gray-50">
        <tr>
          <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Estate</th>
          <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Latest Status</th>
          <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Attorney</th>
          <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Deceased</th>
          <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Executor</th>
          <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tax No (Pre)</th>
          <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
            <span class="sr-only">Manage</span>
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200 bg-white">
        <tr v-if="estates.length === 0">
          <td colspan="6" class="whitespace-nowrap px-3 py-4 text-sm text-center text-gray-500">
            No estates found.
          </td>
        </tr>
        <tr v-for="estate in estates" :key="estate.id">
          <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{{ estate.estateName }}</td>
          <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ estate.latestStatus || 'N/A' }}</td>
          <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ estate.attorneyCompanyName || '-' }}</td>
          <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ `${estate.surname}, ${estate.names}` }}</td>
          <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ estate.executorContactPerson?.name || '' }}</td>
          <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ estate.deTaxNumberPre }}</td>
          <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
            <a 
              href="#" 
              @click.prevent="$emit('manage-estate', estate.id)"
              class="text-brand-blue-600 hover:text-brand-blue-800"
            >
              Manage
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>


// This component expects to receive an array of estates as a prop.
defineProps({
  estates: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['manage-estate']);
</script>