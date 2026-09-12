<template>
  <div class="space-y-6">
    <!-- Header Controls -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <div>
        <h2 class="text-lg font-bold text-slate-900">Operational Logbook Blueprints</h2>
        <p class="text-xs text-slate-500 mt-0.5">
          High-frequency telemetry routines, daily pre-trips, and automated defect detection rules for this niche.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="openAttachModal"
          class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
        >
          <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Attach From Catalog
        </button>

        <button
          @click="openCreateModal"
          class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create New Blueprint
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="py-12 flex justify-center items-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="attachedLogs.length === 0"
      class="bg-white rounded-xl border-2 border-dashed border-slate-200 p-12 text-center"
    >
      <div class="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-3">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
        </svg>
      </div>
      <h3 class="text-sm font-semibold text-slate-800">No Logbooks Attached</h3>
      <p class="text-xs text-slate-500 max-w-sm mx-auto mt-1">
        This niche does not require high-frequency telemetry. Attach an existing blueprint or create a new routine.
      </p>
      <div class="mt-4">
        <button
          @click="openAttachModal"
          class="text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
        >
          Attach from Catalog
        </button>
      </div>
    </div>

    <!-- Attached Blueprints List -->
    <div v-else class="space-y-4">
      <div
        v-for="item in attachedLogs"
        :key="item.id"
        class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm shrink-0">
            #{{ item.pivot?.display_order || item.pivot?.displayOrder || 1 }}
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h4 class="text-sm font-bold text-slate-900">
                {{ item.pivot?.tab_label_override || item.pivot?.tabLabelOverride || item.name }}
              </h4>
              <span v-if="item.pivot?.tab_label_override || item.pivot?.tabLabelOverride" class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                Original: {{ item.name }}
              </span>
              <span class="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold"
                :class="item.category === 'Pre-Trip Inspection' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-blue-50 text-blue-700 border border-blue-200'">
                {{ item.category }}
              </span>
            </div>
            <p class="text-xs text-slate-500 mt-1">
              {{ item.description || 'No description provided.' }}
            </p>
            <div class="flex items-center gap-4 mt-2 text-[11px] text-slate-500 font-medium">
              <span>📋 {{ item.schema?.length || 0 }} Form Fields</span>
              <span>⚡ {{ (item.defect_rules || item.defectRules)?.length || 0 }} Defect Triggers</span>
              <span v-if="item.pivot?.is_mandatory || item.pivot?.isMandatory" class="text-emerald-600 font-semibold">● Mandatory Routine</span>
            </div>
          </div>
        </div>

        <!-- Row Actions -->
        <div class="flex items-center gap-2 self-end md:self-center">
          <button
            @click="editBlueprint(item)"
            class="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg transition"
          >
            Edit Blueprint
          </button>
          <button
            @click="detachBlueprint(item.id)"
            class="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition"
          >
            Detach
          </button>
        </div>
      </div>
    </div>

    <!-- Create / Edit Blueprint Modal (Slide-over / Modal) -->
    <div
      v-if="showBuilderModal"
      class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex justify-center items-center p-4"
    >
      <div class="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 class="text-base font-bold text-slate-900">
            {{ activeBlueprint.id ? 'Edit Logbook Blueprint' : 'Create New Logbook Blueprint' }}
          </h3>
          <button @click="showBuilderModal = false" class="text-slate-400 hover:text-slate-600 text-lg">✕</button>
        </div>

        <!-- Modal Body -->
        <div class="p-6 overflow-y-auto space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Blueprint Name</label>
              <input
                v-model="activeBlueprint.name"
                type="text"
                placeholder="e.g. Heavy Duty Pre-Trip Inspection"
                class="w-full text-xs rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
              <select
                v-model="activeBlueprint.category"
                class="w-full text-xs rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Pre-Trip Inspection">Pre-Trip Inspection</option>
                <option value="Shift Handover">Shift Handover</option>
                <option value="Daily Walkaround">Daily Walkaround</option>
                <option value="Telemetry & Hour-Meter">Telemetry & Hour-Meter</option>
                <option value="Compliance Attestation">Compliance Attestation</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Blueprint Slug</label>
            <div class="flex items-center gap-1">
              <input
                v-model="activeBlueprint.slug"
                type="text"
                placeholder="e.g. heavy-duty-pre-trip"
                class="w-full text-xs rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500 font-mono"
              />
              <button
                v-if="!activeBlueprint.id"
                @click="activeBlueprint.slug = activeBlueprint.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')"
                type="button"
                class="px-2.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-lg transition"
                title="Generate slug from blueprint name"
              >⚙️</button>
            </div>
            <p class="text-[11px] text-slate-400 mt-1">Used by public.log_definitions.slug to reference this blueprint across the platform. Leave blank to auto-generate from the name.</p>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
            <textarea
              v-model="activeBlueprint.description"
              rows="2"
              placeholder="Operational instructions for mobile operators..."
              class="w-full text-xs rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>

          <!-- JSON Dynamic Schema Spec Builder -->
          <div class="border-t border-slate-200 pt-4">
            <div class="flex justify-between items-center mb-3">
              <div>
                <h4 class="text-xs font-bold text-slate-900 uppercase">1. Form Schema Fields</h4>
                <p class="text-[11px] text-slate-500">Define the inputs rendered on the mobile PWA.</p>
              </div>
              <button
                @click="addSchemaField"
                type="button"
                class="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                + Add Field
              </button>
            </div>

            <div class="space-y-3">
              <div
                v-for="(field, index) in activeBlueprint.schema"
                :key="index"
                class="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200"
              >
                <input
                  v-model="field.key"
                  placeholder="Key (e.g. brakes_pass)"
                  class="w-1/3 text-xs rounded border-slate-300 font-mono"
                />
                <input
                  v-model="field.label"
                  placeholder="Field Label"
                  class="w-1/3 text-xs rounded border-slate-300"
                />
                <select v-model="field.type" class="w-1/4 text-xs rounded border-slate-300">
                  <option value="boolean">Pass / Fail (Toggle)</option>
                  <option value="number">Numeric (Meter/Reading)</option>
                  <option value="text">Short Text</option>
                  <option value="textarea">Notes / Textarea</option>
                </select>
                <button @click="removeSchemaField(index)" class="text-rose-500 hover:text-rose-700 text-xs px-1">✕</button>
              </div>
            </div>
          </div>

          <!-- Automated Defect Inference Engine Rules -->
          <div class="border-t border-slate-200 pt-4">
            <div class="flex justify-between items-center mb-3">
              <div>
                <h4 class="text-xs font-bold text-slate-900 uppercase">2. Automated Defect Rules</h4>
                <p class="text-[11px] text-slate-500">Server-side automated flagging and operational grounding logic.</p>
              </div>
              <button
                @click="addDefectRule"
                type="button"
                class="text-xs font-semibold text-amber-600 hover:text-amber-800"
              >
                + Add Rule
              </button>
            </div>

            <div class="space-y-3">
              <div
                v-for="(rule, index) in activeBlueprint.defect_rules"
                :key="index"
                class="bg-amber-50/50 p-3 rounded-lg border border-amber-200 space-y-2"
              >
                <div class="flex items-center gap-2">
                  <input
                    v-model="rule.field"
                    placeholder="Field Key (e.g. brakes_pass)"
                    class="w-1/3 text-xs rounded border-amber-300 font-mono"
                  />
                  <select v-model="rule.operator" class="w-1/4 text-xs rounded border-amber-300">
                    <option value="eq">Equals (=)</option>
                    <option value="neq">Not Equals (!=)</option>
                    <option value="lt">Less Than (&lt;)</option>
                    <option value="gt">Greater Than (&gt;)</option>
                    <option value="is_false">Is False</option>
                    <option value="is_true">Is True</option>
                  </select>
                  <input
                    v-model="rule.value"
                    placeholder="Value (e.g. false or 1.6)"
                    class="w-1/4 text-xs rounded border-amber-300"
                  />
                  <select v-model="rule.severity" class="w-1/4 text-xs rounded border-amber-300 font-bold">
                    <option value="safety_critical_ground">RED-TAG GROUND</option>
                    <option value="minor_advisory">Minor Advisory</option>
                  </select>
                  <button @click="removeDefectRule(index)" class="text-rose-500 hover:text-rose-700 text-xs px-1">✕</button>
                </div>
                <input
                  v-model="rule.message"
                  placeholder="Defect Alert Message (e.g. Brakes reported defective by operator)"
                  class="w-full text-xs rounded border-amber-300"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button
            @click="showBuilderModal = false"
            class="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            @click="saveBlueprint"
            :disabled="isSaving"
            class="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50"
          >
            {{ isSaving ? 'Saving...' : 'Save Blueprint' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import apiClient from '@/services/api'

const route = useRoute()
const fileTypeId = route.params.fileTypeId

const isLoading = ref(true)
const isSaving = ref(false)
const attachedLogs = ref([])
const showBuilderModal = ref(false)

const activeBlueprint = ref({
  id: null,
  name: '',
  slug: '',
  category: 'Pre-Trip Inspection',
  description: '',
  schema: [],
  defect_rules: []
})

const fetchAttachedLogs = async () => {
  isLoading.value = true
  try {
    const res = await apiClient.get(`admin/file-types/${fileTypeId}`)
    // The global CamelCaseResponseMiddleware converts every response key to
    // camelCase, so the loaded "logDefinitions" relation arrives as
    // `data.logDefinitions` (not snake_case). Fall back to both key styles for
    // robustness across different API deployments.
    const niche = res.data?.data || res.data || {}
    attachedLogs.value = niche.logDefinitions || niche.log_definitions || []
  } catch (err) {
    console.error('Failed to load niche logbooks', err)
  } finally {
    isLoading.value = false
  }
}

const openCreateModal = () => {
  activeBlueprint.value = {
    id: null,
    name: '',
    slug: '',
    category: 'Pre-Trip Inspection',
    description: '',
    schema: [
      { key: 'odometer_hours', label: 'Current Odometer / Hour Reading', type: 'number' },
      { key: 'brakes_functional', label: 'Braking System Functional', type: 'boolean' }
    ],
    defect_rules: [
      { field: 'brakes_functional', operator: 'is_false', value: false, severity: 'safety_critical_ground', message: 'Brakes reported non-operational' }
    ]
  }
  showBuilderModal.value = true
}

const editBlueprint = (item) => {
  // The API serializes attributes in camelCase (e.g. defectRules, isActive,
  // pivot.displayOrder), but this component's edit form is bound to snake_case
  // keys (defect_rules, is_active, pivot.*). Normalize so editing reflects the
  // saved blueprint accurately.
  activeBlueprint.value = {
    id: item.id,
    name: item.name,
    slug: item.slug || '',
    category: item.category,
    description: item.description || '',
    schema: Array.isArray(item.schema) ? item.schema : [],
    defect_rules: Array.isArray(item.defect_rules) ? item.defect_rules : (item.defectRules || []),
    is_active: item.is_active ?? item.isActive ?? true
  }
  showBuilderModal.value = true
}

const addSchemaField = () => {
  activeBlueprint.value.schema.push({ key: '', label: '', type: 'boolean' })
}

const removeSchemaField = (index) => {
  activeBlueprint.value.schema.splice(index, 1)
}

const addDefectRule = () => {
  activeBlueprint.value.defect_rules.push({ field: '', operator: 'eq', value: '', severity: 'minor_advisory', message: '' })
}

const removeDefectRule = (index) => {
  activeBlueprint.value.defect_rules.splice(index, 1)
}

const saveBlueprint = async () => {
  isSaving.value = true
  try {
    let logDefId = activeBlueprint.value.id
    if (logDefId) {
      await apiClient.put(`admin/log-definitions/${logDefId}`, activeBlueprint.value)
    } else {
      const res = await apiClient.post('admin/log-definitions', activeBlueprint.value)
      logDefId = res.data.data.id
      // Auto-attach to current fileType
      await apiClient.post(`admin/file-types/${fileTypeId}/log-definitions`, {
        log_definition_id: logDefId,
        display_order: attachedLogs.value.length + 1,
        is_mandatory: true
      })
    }
    showBuilderModal.value = false
    await fetchAttachedLogs()
  } catch (err) {
    console.error('Failed to save blueprint', err)
  } finally {
    isSaving.value = false
  }
}

const detachBlueprint = async (logDefinitionId) => {
  if (!confirm('Are you sure you want to detach this logbook from this niche?')) return
  try {
    await apiClient.delete(`admin/file-types/${fileTypeId}/log-definitions/${logDefinitionId}`)
    await fetchAttachedLogs()
  } catch (err) {
    console.error('Failed to detach blueprint', err)
  }
}

onMounted(() => {
  fetchAttachedLogs()
})
</script>