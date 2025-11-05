<template>
  <div class="p-6 bg-white shadow-sm rounded-lg">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold text-gray-900">Case Numbers Report for Estate {{ id }}</h2>
      <button @click="exportToCsv" class="btn-primary">Export to CSV</button>
    </div>

    <div v-if="loading" class="text-center py-4">Loading case numbers...</div>
    <div v-else-if="error" class="text-center py-4 text-red-600">{{ error }}</div>
    <div v-else-if="caseNumberData && caseNumberData.length > 0">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case Number</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note Excerpt</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(item, index) in caseNumberData" :key="index">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ item.source }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.case_number }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.date }}</td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ item.note_excerpt }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else class="text-center py-4 text-gray-500">No case numbers found for this estate.</div>

    <div class="mt-6">
      <button @click="goBackToEstate" class="btn-secondary">Back to Estate</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import estateService from '@/services/estateService';

const props = defineProps({
  id: {
    type: String,
    required: true
  }
});

const router = useRouter();

const caseNumberData = ref(null);
const loading = ref(false);
const error = ref(null);

const fetchCaseNumbers = async (estateId) => {
  if (!estateId) return;

  loading.value = true;
  error.value = null;
  try {
    const response = await estateService.getCaseNumbers(estateId);
    caseNumberData.value = response.data;
  } catch (err) {
    console.error('Failed to fetch case numbers:', err);
    error.value = 'Failed to load case numbers.';
  } finally {
    loading.value = false;
  }
};

const goBackToEstate = () => {
  router.push({ name: 'estates.edit', params: { id: props.id } });
};

const exportToCsv = () => {
  if (!caseNumberData.value || caseNumberData.value.length === 0) {
    alert('No data to export.');
    return;
  }

  const headers = ['Source', 'Case Number', 'Date', 'Note Excerpt'];

  const rows = caseNumberData.value.map(item => {
    const source = item.source ?? '';
    const caseNumber = item.case_number ?? '';
    const date = item.date ?? '';
    const note = item.note_excerpt ? String(item.note_excerpt) : '';
    // Escape double quotes by doubling them for CSV
    const escapedNote = note.replace(/"/g, '""');
    return [source, caseNumber, date, escapedNote];
  });

  // Build CSV content with proper quoting
  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `estate_${props.id}_case_numbers.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

onMounted(() => {
  fetchCaseNumbers(props.id);
});

watch(() => props.id, (newId) => {
  fetchCaseNumbers(newId);
});
</script>