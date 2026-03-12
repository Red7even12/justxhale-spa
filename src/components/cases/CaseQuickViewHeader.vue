<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
    
    <!-- SECTION 1: PARTICIPANTS (Strict Order) -->
    <div class="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100 bg-gray-50 border-b border-gray-200">
      
      <!-- Loop through Sorted Participants -->
      <div v-for="part in orderedParticipants" :key="part.id" class="p-4 flex flex-col justify-center min-h-[80px]">
        <div class="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">
          {{ part.roleKey }}
        </div>
        
        <div v-if="part.entity">
          <div class="text-sm font-bold text-gray-900 truncate" :title="part.entity.name">
            {{ part.entity.name }}
          </div>
          <div class="text-xs text-gray-500 mt-0.5 truncate">
            <span v-if="part.referenceNumber" class="font-mono bg-white border border-gray-200 px-1 rounded text-[10px] mr-1">
              {{ part.referenceNumber }}
            </span>
            <span v-if="part.entity.email" class="opacity-75">{{ part.entity.email }}</span>
          </div>
        </div>
        <div v-else class="text-xs text-gray-400 italic">
          Not Assigned
        </div>
      </div>

      <!-- Filler text if empty -->
      <div v-if="orderedParticipants.length === 0" class="p-4 text-xs text-gray-400 italic">
        No participants assigned.
      </div>
    </div>

    <!-- SECTION 2: METADATA (Quick View Fields) -->
    <div class="p-5">
      <div v-if="quickFields.length > 0" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-y-6 gap-x-8">
        
        <!-- Standard Field: File Reference (Always First) -->
        <div>
          <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
            File Reference
          </label>
          <div class="text-sm font-bold text-gray-800 font-mono">
            {{ caseFile.fileReference || '-' }}
          </div>
        </div>

        <!-- Dynamic Fields -->
        <div v-for="field in quickFields" :key="field.id">
          <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1 truncate" :title="field.label">
            {{ field.label }}
          </label>
          <div class="text-sm font-bold text-gray-800 truncate">
            {{ field.value || '-' }}
          </div>
        </div>

      </div>
      <div v-else class="text-center text-xs text-gray-400 italic py-2">
        No 'Quick View' fields configured for this Niche.
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  caseFile: { type: Object, required: true }
});

// --- 1. PARTICIPANT ORDERING LOGIC ---
const ROLE_PRIORITY = ['executor', 'attorney', 'agent', 'master', 'sars'];

const orderedParticipants = computed(() => {
  if (!props.caseFile.participants) return [];

  const activeParts = props.caseFile.participants.filter(p => p.isActive);

  return activeParts.sort((a, b) => {
    const indexA = ROLE_PRIORITY.indexOf(a.roleKey.toLowerCase());
    const indexB = ROLE_PRIORITY.indexOf(b.roleKey.toLowerCase());
    
    const safeIndexA = indexA === -1 ? 999 : indexA;
    const safeIndexB = indexB === -1 ? 999 : indexB;

    return safeIndexA - safeIndexB;
  });
});

// --- 2. METADATA PARSING LOGIC ---
const quickFields = computed(() => {
  const definitions = props.caseFile.fileType?.fieldDefinitions || props.caseFile.fileType?.field_definitions || [];
  const metaData = props.caseFile.metaData || props.caseFile.meta_data || {};

  // Filter definitions where show_in_quick_view is true
  const visibleDefs = definitions.filter(def => 
    def.showInQuickView || def.show_in_quick_view
  );

  return visibleDefs.map(def => {
    const key = def.key || def.fieldKey || def.field_key;
    const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    
    return {
      id: def.id,
      label: def.label || def.fieldLabel || def.field_label,
      value: metaData[key] !== undefined ? metaData[key] : (metaData[camelKey] || '')
    };
  });
});
</script>