<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold">Search Results for "{{ searchTerm }}"</h1>
    <div v-if="loading">Searching...</div>
    <div v-else-if="results.length === 0">No notes found matching this case number.</div>
    <ul v-else class="mt-6 space-y-4">
      <li v-for="result in results" :key="result.note_id" @click="navigateToResult(result)" class="p-4 bg-white shadow-md rounded-lg cursor-pointer hover:bg-gray-50">
        <p class="font-semibold text-brand-blue-600">Case Number: {{ result.caseNumber }}</p>
        <p class="text-sm text-gray-800">{{ result.noteContentSnippet }}</p>
        <p class="text-xs text-gray-500 mt-2">Found in: {{ result.contextLabel }}</p>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'; // <-- Import watch
import { useRoute, useRouter } from 'vue-router';
import searchService from '@/services/searchService';

const route = useRoute();
const router = useRouter();
const searchTerm = ref('');
const results = ref([]);
const loading = ref(false); // Set initial loading to false

const navigateToResult = (result) => {
  // Use camelCase here as the API response is camelCased
  if (!result.navigation || !result.navigation.estateId) return;

  router.push({
    name: 'estates.edit',
    params: { id: result.navigation.estateId },
    query: {
      open_notes_for_type: result.navigation.noteableType,
      open_notes_for_id: result.navigation.noteableId,
      open_notes_for_name: result.contextLabel,
    }
  });
};

// --- NEW REUSABLE SEARCH FUNCTION ---
const performSearch = async (caseNumber) => {
  if (!caseNumber) {
    results.value = [];
    return;
  }
  loading.value = true;
  searchTerm.value = caseNumber; // Update the displayed title
  try {
    const response = await searchService.searchByCaseNumber(caseNumber);
    results.value = response.data.data;
  } catch (err) {
    console.error("Search failed:", err);
    results.value = []; // Clear results on error
  } finally {
    loading.value = false;
  }
};

// --- NEW WATCHER ---
// This watches for changes in the URL's query parameter.
// This is what makes re-searching from the results page work.
watch(
  () => route.query.case_number,
  (newCaseNumber) => {
    performSearch(newCaseNumber);
  }
);

// --- UPDATED onMounted ---
// This runs only once when you first navigate to the page.
onMounted(() => {
  performSearch(route.query.case_number);
});
</script>