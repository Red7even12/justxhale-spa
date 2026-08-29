<template>
  <!-- Path: frontend-spa/src/components/cases/CaseQuickViewHeader.vue -->
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
    
    <!-- SECTION 1: PARTICIPANTS (Scoped to Active Niche) -->
    <div class="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100 bg-gray-50 border-b border-gray-200">
      
      <div v-for="part in orderedParticipants" :key="part.id" class="p-4 flex flex-col justify-center min-h-[80px]">
        <div class="text-[10px] uppercase tracking-widest font-black text-gray-600 mb-1">
          {{ part.roleKey || part.role_key }}
        </div>
        
        <div v-if="part.entity">
          <div class="text-sm font-bold text-gray-900 truncate" :title="part.entity.name">
            <span v-if="part.entity?.entity_type === 'company' || part.entity?.entityType === 'company'" class="text-gray-500 font-normal">Co: </span>{{ part.entity.name }}
          </div>
          <div v-if="part.entity?.parent" class="text-[11px] text-brand-primary font-black uppercase tracking-wider truncate mt-0.5" :title="'Co: ' + part.entity.parent.name">
            Co: {{ part.entity.parent.name }}
          </div>
          <!-- Reference # -->
          <div v-if="part.referenceNumber || part.reference_number" class="text-[11px] text-gray-600 font-mono truncate mt-0.5" :title="'Ref: ' + (part.referenceNumber || part.reference_number)">
            Ref: {{ part.referenceNumber || part.reference_number }}
          </div>
          <!-- Email Address -->
          <div v-if="part.entity.email" class="text-[11px] text-gray-500 truncate mt-0.5" :title="part.entity.email">
            {{ part.entity.email }}
          </div>
        </div>
        <div v-else class="text-xs text-gray-400 italic">Not Assigned</div>
      </div>

      <div v-if="orderedParticipants.length === 0" class="p-4 text-xs text-gray-400 italic text-center col-span-4">
        No active role-players assigned for this niche.
      </div>
    </div>

    <!-- SECTION 2: METADATA (Scoped to Active Niche) -->
    <div class="p-5">
      <div v-if="quickFields.length > 0" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-y-6 gap-x-8">
        
        <!-- Standard Field: File Reference (Always First) -->
        <div>
          <label class="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">
            File Reference
          </label>
          <div class="text-sm font-bold text-gray-800 font-mono">
            {{ caseFile.fileReference || caseFile.file_reference || '-' }}
          </div>
        </div>

        <!-- Dynamic Fields -->
        <div v-for="field in quickFields" :key="field.id">
          <label class="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1 truncate flex items-center gap-1" :title="field.label">
            {{ field.label }}
            <!-- Spark icon for Global Data -->
            <svg v-if="field.isProjected" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M11.3 1.047a1 1 0 01.897.95V4.35l3.522 1.282a1 1 0 01.631 1.157L15.35 10.5h1.15a1 1 0 01.991 1.138l-1.5 12a1 1 0 01-1.398.815l-12-6a1 1 0 01-.444-1.398l1.5-3a1 1 0 01.894-.552H5.05L4.047 3.047a1 1 0 011.047-1.047h6.206z" clip-rule="evenodd" />
            </svg>
          </label>
          
          <div 
            class="text-sm font-bold truncate"
            :class="field.isProjected ? 'text-emerald-700' : 'text-gray-800'"
          >
            <template v-if="(field.fieldType === 'date' || field.fieldType === 'timestamptz') && field.value">
              {{ $formatDate(field.value) }}
            </template>
            <template v-else>
              {{ field.value || '-' }}
            </template>
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
  caseFile: { type: Object, required: true },
  activeFileType: { type: Object, default: null }
});

// Target Niche/FileType context (falls back to case file primary fileType)
const currentFileType = computed(() => {
  return props.activeFileType || props.caseFile.fileType || null;
});

// --- 1. PARTICIPANT ORDERING & SCOPING ---
const orderedParticipants = computed(() => {
  if (!props.caseFile.participants) return [];
  
  let activeParts = props.caseFile.participants.filter(p => p.isActive || p.is_active);

  // Filter participants scoped to active file_type_id if available
  const activeTypeId = currentFileType.value?.id;
  if (activeTypeId) {
    activeParts = activeParts.filter(p => {
      const pTypeId = p.file_type_id || p.fileTypeId || p.participantRole?.file_type_id || p.participant_role?.file_type_id;
      // Allow if participant belongs to active file type OR is a universal/unscoped participant
      return !pTypeId || pTypeId === activeTypeId;
    });
  }

  return activeParts.sort((a, b) => {
    const roleA = a.participantRole || a.participant_role;
    const roleB = b.participantRole || b.participant_role;

    const orderA = roleA ? (roleA.sortOrder ?? roleA.sort_order ?? 0) : 999;
    const orderB = roleB ? (roleB.sortOrder ?? roleB.sort_order ?? 0) : 999;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    const keyA = (a.roleKey || a.role_key || '').toLowerCase();
    const keyB = (b.roleKey || b.role_key || '').toLowerCase();
    return keyA.localeCompare(keyB);
  });
});

// --- 2. METADATA RESOLUTION (Scoped to active Niche) ---
const quickFields = computed(() => {
  // Pull definitions from activeFileType, or fall back to primary caseFile.fileType
  const definitions = currentFileType.value?.fields || props.caseFile.fileType?.fields || [];
  
  const metaData = props.caseFile.metaData || props.caseFile.meta_data || {};
  const projectedMeta = props.caseFile.projectedMetaData || props.caseFile.projected_meta_data || {};
  const participants = props.caseFile.participants || [];
  const activeTypeId = currentFileType.value?.id;

  return definitions
    .filter(def => def.showInQuickView || def.show_in_quick_view)
    .map(def => {
      const key = def.fieldKey || def.field_key;
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      
      const hasId = !!def.entityFieldDefinitionId || !!def.entity_field_definition_id;
      const isProjected = hasId || def.isProjected === true || def.is_projected === true;
      
      let value = null;

      if (isProjected) {
          value = projectedMeta[key] ?? projectedMeta[camelKey] ?? null;

          if (value === null || value === undefined) {
              const foundPart = participants.find(p => {
                  const entMeta = p.entity?.metaData || p.entity?.meta_data;
                  return entMeta && (entMeta[key] !== undefined || entMeta[camelKey] !== undefined);
              });

              if (foundPart) {
                  const targetMeta = foundPart.entity.metaData || foundPart.entity.meta_data;
                  value = targetMeta[key] ?? targetMeta[camelKey];
              }
          }
      } else {
          // Scoped Case Meta resolution:
          // Check if metaData stores niche-keyed object metaData[file_type_id][fieldKey]
          if (activeTypeId && metaData[activeTypeId] && typeof metaData[activeTypeId] === 'object') {
            value = metaData[activeTypeId][key] ?? metaData[activeTypeId][camelKey] ?? null;
          }
          
          // Fallback to top-level flat metaData
          if (value === null || value === undefined) {
            value = metaData[key] ?? metaData[camelKey] ?? null;
          }
      }

      return {
        id: def.id,
        label: def.fieldLabel || def.field_label,
        value: value,
        fieldType: def.fieldType || def.field_type, 
        isProjected: isProjected,
        sortOrder: def.sortOrder || def.sort_order || 0
      };
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);
});
</script>