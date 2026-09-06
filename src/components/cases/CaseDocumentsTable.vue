<template>
  <!-- frontend-spa/src/components/cases/CaseDocumentsTable.vue -->
  <div class="documents-table h-full flex flex-col">
    
    <!-- 1. Header Toolbar -->
    <div class="flex justify-between items-center mb-3 border-b border-gray-100 pb-2 shrink-0">
      <h3 class="text-lg font-bold text-gray-800 uppercase tracking-tight">Checklist</h3>
      <div class="flex items-center gap-2">
        <button 
          @click="openRequestModal" 
          class="bg-brand-primary text-white text-xs px-4 py-2 rounded-lg font-bold shadow hover:opacity-90 transition-all">
          Request Documents
        </button>
        <button 
          @click="saveAllChanges" 
          :disabled="dirtyRequirementIds.size === 0"
          class="bg-brand-primary text-white text-xs px-4 py-2 rounded-lg font-bold shadow hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
          Save Changes
        </button>
      </div>
    </div>

    <!-- 2. STAKEHOLDER / PARTICIPANT SELECTOR BAR -->
    <div v-if="stakeholders.length > 0" class="mb-3 flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0">
      <!-- Corporate / Entity Default Pill -->
      <button 
        @click="selectedParticipantId = 'corporate'" 
        type="button"
        class="px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap border"
        :class="selectedParticipantId === 'corporate' 
          ? 'bg-brand-primary text-white border-brand-primary shadow-xs' 
          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'"
      >
        <span>🏢 Corporate / Entity</span>
        <span class="text-[10px] opacity-80 font-mono">({{ getParticipantDocCount(null) }})</span>
      </button>

      <!-- Individual Stakeholder Pills -->
      <button 
        v-for="p in stakeholders" 
        :key="p.id"
        @click="selectedParticipantId = p.id" 
        type="button"
        class="px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap border"
        :class="selectedParticipantId === p.id 
          ? 'bg-brand-primary text-white border-brand-primary shadow-xs' 
          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'"
      >
        <span>👤 {{ p.entity?.name || 'Shareholder' }}</span>
        <span class="text-[10px] opacity-80 font-mono">({{ getParticipantDocCount(p.id) }})</span>
      </button>

      <!-- Show All Option -->
      <button 
        @click="selectedParticipantId = 'all'" 
        type="button"
        class="px-2.5 py-1 rounded-lg text-xs font-bold text-gray-400 hover:text-gray-700 transition-colors ml-auto text-[11px]"
        :class="{'text-brand-primary underline': selectedParticipantId === 'all'}"
      >
        All Docs
      </button>
    </div>
    
    <!-- 3. Loading / Error States -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center text-gray-400 text-sm font-bold">
      Loading requirements...
    </div>
    <div v-else-if="error" class="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100">
      <p class="font-bold">Error</p>
      <p>{{ error }}</p>
    </div>

    <!-- 4. The Documents Checklist Table -->
    <div v-else class="flex-1 overflow-auto border border-gray-200 rounded-lg bg-white relative">
      <table class="min-w-full divide-y divide-gray-200 documents-table-override">
        <thead class="bg-gray-50 sticky top-0 z-10">
          <tr>
            <th scope="col" class="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50">Document</th>
            <th scope="col" class="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50">Status</th>
            <th scope="col" class="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 w-1/3">Input Data</th>
            <th scope="col" class="px-3 py-2 text-right text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="req in filteredRequirements" :key="req.id">
            
            <!-- Document Name, Note & Target Stakeholder -->
            <td class="px-3 py-2 whitespace-nowrap align-top">
              <div class="flex items-center">
                <div>
                  <div class="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    {{ req.documentType?.label || req.documentType?.name }}
                    <span v-if="req.is_required || req.isRequired" class="text-[9px] text-red-500 font-bold uppercase tracking-wide border border-red-100 px-1 rounded">Req</span>
                  </div>
                  
                  <!-- Participant Tag if viewing in "All Docs" mode -->
                  <div v-if="req.participant?.entity?.name" class="text-[10px] text-brand-primary font-bold mt-0.5">
                    Target: {{ req.participant.entity.name }}
                  </div>
                  
                  <div v-if="req.documentType?.note" class="text-xs text-gray-500 mt-0.5">{{ req.documentType.note }}</div>
                </div>
              </div>
            </td>

            <!-- Status Badge -->
            <td class="px-3 py-2 whitespace-nowrap align-top">
              <span v-if="isRenewalUrgent(req)"
                    class="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 animate-pulse">
                ⚠ Renew Now
              </span>
              <span v-else :class="[getStatusInfo(req.currentStatus || req.current_status).class, getStatusInfo(req.currentStatus || req.current_status).textClass]"
                    class="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                {{ (req.currentStatus || req.current_status || 'pending').replace('_', ' ') }}
              </span>
            </td>

            <!-- Input Fields -->
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-500 align-top">
              <div v-if="(req.currentStatus || req.current_status) !== 'not_applicable' && submissionData[req.id]">
                
                <!-- Dual-Date / Coverage Period Input (Archetype 4) -->
                <div v-if="(req.documentType?.dateRuleType || req.documentType?.date_rule_type) === 'dual_coverage_period'" class="space-y-1.5 max-w-[200px]">
                  <!-- Issue Date -->
                  <div class="relative group">
                    <div class="flex items-center justify-between w-full px-2 py-0.5 bg-white border border-gray-300 rounded shadow-xs text-[10px]">
                      <span class="text-gray-400 font-bold uppercase">Issued:</span>
                      <span class="font-black" :class="getDualDate(submissionData[req.id].value, 'issue_date') ? 'text-brand-blue-700' : 'text-gray-400'">
                        {{ getDualDate(submissionData[req.id].value, 'issue_date') ? $formatDate(getDualDate(submissionData[req.id].value, 'issue_date')) : 'Set Date' }}
                      </span>
                    </div>
                    <input 
                      type="date"
                      :value="getDualDate(submissionData[req.id].value, 'issue_date')"
                      @change="(e) => updateDualDate(req.id, 'issue_date', e.target.value)"
                      class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    >
                  </div>

                  <!-- Expiry Date -->
                  <div class="relative group">
                    <div class="flex items-center justify-between w-full px-2 py-0.5 bg-white border border-gray-300 rounded shadow-xs text-[10px]">
                      <span class="text-gray-400 font-bold uppercase">Expires:</span>
                      <span class="font-black" :class="getDualDate(submissionData[req.id].value, 'expiry_date') ? 'text-brand-blue-700' : 'text-gray-400'">
                        {{ getDualDate(submissionData[req.id].value, 'expiry_date') ? $formatDate(getDualDate(submissionData[req.id].value, 'expiry_date')) : 'Set Date' }}
                      </span>
                    </div>
                    <input 
                      type="date"
                      :value="getDualDate(submissionData[req.id].value, 'expiry_date')"
                      @change="(e) => updateDualDate(req.id, 'expiry_date', e.target.value)"
                      class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    >
                  </div>
                </div>

                <!-- Standard Single Date Inputs (Archetypes 1, 2, 3) -->
                <div v-else-if="['expiry_date', 'date'].includes(req.documentType?.actionFieldType || req.documentType?.action_field_type)" class="max-w-[190px]">
                  <div class="relative group">
                    <div class="flex items-center justify-between w-full px-3 py-1 bg-white border border-gray-300 rounded shadow-sm group-hover:border-brand-primary transition-colors">
                        <span class="text-[11px] font-black uppercase tracking-tight" :class="submissionData[req.id].value ? 'text-brand-blue-700' : 'text-gray-400'">
                        {{ submissionData[req.id].value ? $formatDate(submissionData[req.id].value) : getDatePlaceholder(req.documentType) }}
                        </span>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-gray-400 group-hover:text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <input 
                        type="date"
                        v-model="submissionData[req.id].value" 
                        @change="handleInputChange(req.id)"
                        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    >
                  </div>

                  <!-- Calculated Expiry Display -->
                  <div v-if="req.expires_at || req.expiresAt" class="text-[10px] font-bold mt-1 tracking-tight flex items-center gap-1">
                    <span class="text-gray-400">Expires:</span>
                    <span :class="(req.currentStatus === 'expired' || req.current_status === 'expired') ? 'text-red-600 font-black' : (isRenewalUrgent(req) ? 'text-amber-600 font-black' : 'text-gray-700')">
                      {{ $formatDate(req.expires_at || req.expiresAt) }}
                    </span>
                  </div>
                </div>

                <!-- Text Input -->
                <div v-else-if="(req.documentType?.actionFieldType || req.documentType?.action_field_type) === 'text'">
                  <input 
                    type="text" 
                    :placeholder="req.documentType?.actionFieldLabel || req.documentType?.action_field_label || 'Enter value'"
                    v-model="submissionData[req.id].value"
                    @input="handleInputChange(req.id)"
                    class="form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-xs"
                  >
                </div>

                <!-- Sourced Dropdown -->
                <div v-else-if="(req.documentType?.actionFieldType || req.documentType?.action_field_type) === 'sourced_dropdown'">
                  <select
                    v-model="submissionData[req.id].value"
                    @change="handleInputChange(req.id)"
                    class="form-select block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-xs"
                  >
                    <option value="">-- Select --</option>
                    <option v-for="item in sourcedData[resolveSourceKey(req.documentType)] || []" :key="item.id" :value="item.optionValue">
                      {{ item.optionValue }}
                    </option>
                  </select>
                </div>

                <!-- Checkbox -->
                <div v-else>
                  <input 
                    type="checkbox"
                    v-model="submissionData[req.id].isChecked"
                    @change="handleInputChange(req.id)"
                    class="form-checkbox h-5 w-5 text-brand-primary border-gray-300 rounded focus:ring-brand-primary cursor-pointer"
                  >
                </div>

              </div>
            </td>

            <!-- Actions: Files & Notes -->
            <td class="px-3 py-2 whitespace-nowrap text-right text-sm font-medium align-top">
             <div class="flex items-center justify-end gap-2">
                <!-- URGENT: immediate magic-link request for imminent expiry -->
                <button
                    v-if="isRenewalUrgent(req)"
                    @click="openRequestModal(req)"
                    class="flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-amber-500 text-white border border-amber-600 hover:bg-amber-600 transition-colors shadow-sm"
                    title="Expiry imminent — request renewal now via secure Magic Link"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Request Now
                </button>

                <button 
                    @click="openFiles(req)" 
                    class="flex items-center gap-1 px-2 py-1 rounded text-xs font-bold transition-colors border"
                    :class="req.files && req.files.length > 0 ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' : 'text-gray-400 border-transparent hover:text-gray-600 hover:bg-gray-50'"
                    title="Manage Files"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span v-if="req.files && req.files.length > 0">{{ req.files.length }}</span>
                </button>

                <button @click="openNotes(req)" class="text-gray-400 hover:text-brand-primary transition p-1 rounded hover:bg-gray-50" title="View/Add Notes">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clip-rule="evenodd"></path></svg>
                </button>
             </div>
            </td>
          </tr>
          
          <tr v-if="filteredRequirements.length === 0">
            <td colspan="4" class="text-center py-8 text-gray-400 text-xs italic">
              No documents required for this selection.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- NOTES MODAL -->
  <Modal :show="showNotesModal" @close="showNotesModal = false">
    <template #title>
      <span class="text-brand-primary font-bold">{{ currentNoteContext.title }}</span>
    </template>
    <div class="p-6">
      <NotesPanel 
          :noteable-type="currentNoteContext.type"
          :noteable-id="currentNoteContext.id"
          :file-type-id="props.fileTypeId"
          :context-url="`${route.params.productSlug}/cases/${props.caseId}`" 
          :current-team-id="props.currentTeamId"
          @note-added="(n) => {
              if (!Array.isArray(currentNotes)) currentNotes = [];
              currentNotes.unshift(n);
          }"
          @cancel="showNotesModal = false"
      />
    </div>
  </Modal>

  <!-- FILES MODAL -->
  <Modal :show="showFilesModal" @close="showFilesModal = false">
    <template #title>
      <span class="text-brand-primary font-bold">Manage Documents: {{ activeFileReq?.documentType?.label }}</span>
    </template>

    <div class="p-6">
      <div class="mb-6 space-y-4">
          <div class="grid grid-cols-4 gap-2">
              <button @click="triggerInput('scan')" class="flex flex-col items-center justify-center p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 shadow-sm transition-colors">
                  <span class="text-xl mb-1">📷</span>
                  <span class="text-[10px] font-bold text-gray-600 uppercase text-center leading-tight">Scan</span>
              </button>
              <button @click="triggerInput('selfie')" class="flex flex-col items-center justify-center p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 shadow-sm transition-colors">
                  <span class="text-xl mb-1">👤</span>
                  <span class="text-[10px] font-bold text-gray-600 uppercase text-center leading-tight">ID</span>
              </button>
              <button @click="triggerInput('gallery')" class="flex flex-col items-center justify-center p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 shadow-sm transition-colors">
                  <span class="text-xl mb-1">📁</span>
                  <span class="text-[10px] font-bold text-gray-600 uppercase text-center leading-tight">File</span>
              </button>
              <button @click="showLinkInput = !showLinkInput" :class="showLinkInput ? 'bg-blue-50 border-brand-primary' : 'bg-white border-gray-200'" class="flex flex-col items-center justify-center p-2 border rounded-lg hover:bg-blue-50 shadow-sm transition-colors">
                  <span class="text-xl mb-1">🔗</span>
                  <span class="text-[10px] font-bold text-brand-primary uppercase text-center leading-tight">Link</span>
              </button>
          </div>

          <div v-if="showLinkInput" class="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl shadow-inner space-y-3">
              <div class="flex items-center justify-between">
                  <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider">Universal Document Path</label>
                  <button @click="showLinkInput = false" class="text-gray-400 hover:text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
              </div>

              <div class="flex gap-2">
                  <input 
                      v-model="externalLinkPath" 
                      type="text" 
                      placeholder="Paste SharePoint URL or Local Drive Path..." 
                      class="block w-full px-3 py-2 border-gray-300 rounded-lg text-sm focus:ring-brand-primary focus:border-brand-primary shadow-sm"
                      @keyup.enter="submitExternalLink"
                  >
                  <button 
                      @click="submitExternalLink" 
                      :disabled="!externalLinkPath || isUploading"
                      class="bg-brand-primary text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md hover:opacity-90 disabled:opacity-50 transition-all"
                  >
                      Save
                  </button>
              </div>
          </div>

          <input type="file" ref="galleryInput" class="hidden" @change="handleFileUpload" accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx">
          <input type="file" ref="scanInput" class="hidden" @change="handleFileUpload" accept="image/*" capture="environment">
          <input type="file" ref="selfieInput" class="hidden" @change="handleFileUpload" accept="image/*" capture="user">

          <div v-if="isUploading" class="text-center p-2 text-brand-primary font-bold animate-pulse">
              Processing Document...
          </div>

          <!-- File List -->
          <div v-if="activeFileReq?.files?.length > 0" class="space-y-3">
              <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wide border-b border-gray-100 pb-1">Attached Documents</h4>
              <div v-for="file in activeFileReq.files" :key="file.id" class="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <div class="flex items-center gap-3 overflow-hidden">
                      <div class="min-w-0">
                          <a v-if="file.is_external_path || file.isExternalPath" :href="file.file_path || file.filePath" target="_blank" class="text-sm font-bold text-brand-primary hover:underline truncate block">
                              {{ file.file_name || file.fileName }}
                          </a>
                          <a v-else :href="getFileUrl(file, 'preview')" target="_blank" class="text-sm font-bold text-gray-900 hover:text-brand-primary hover:underline truncate block">
                              {{ file.file_name || file.fileName }}
                          </a>
                      </div>
                  </div>
                  
                  <div class="flex items-center gap-1">
                      <button @click="deleteFile(file.id)" class="text-gray-400 hover:text-red-500 p-2 rounded hover:bg-red-50" title="Delete File">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                  </div>
              </div>
          </div>

          <div class="mt-6 flex justify-end">
              <button @click="showFilesModal = false" class="px-4 py-2 bg-gray-100 text-gray-700 rounded font-bold hover:bg-gray-200">Close</button>
          </div>
      </div>
    </div>
  </Modal>

  <!-- SECURE PORTAL REQUEST MODAL -->
  <Modal :show="isRequestModalOpen" @close="closeRequestModal">
    <template #title>Request Documents via Secure Portal</template>
    
    <div class="p-6">
        <p class="text-sm text-gray-600 mb-6">
            Select the required documents and choose who should receive the secure upload link. They will receive a passwordless Magic Link to upload these files directly from their phone or computer.
        </p>

        <!-- Step 1: Select Recipient -->
        <div class="mb-6">
            <label class="block text-sm font-bold text-gray-700 mb-2">1. Who are you requesting these from?</label>
            <div v-if="isLoadingParticipants" class="text-xs text-gray-500 font-bold animate-pulse">Loading contacts...</div>
            <select 
                v-else 
                v-model="requestPayload.participantId" 
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm font-medium"
            >
                <option :value="null" disabled>-- Select a Contact --</option>
                <option 
                    v-for="p in availableParticipants" 
                    :key="p.id" 
                    :value="p.id"
                >
                    {{ (p.isPrimaryContact || p.is_primary_contact) ? '⭐ ' : '' }}
                    {{ p.entity?.name || 'Unknown Entity' }} 
                    ({{ p.roleKey || p.role_key || 'Contact' }}) - 
                    {{ p.entity?.email || p.entity?.phone_primary || p.entity?.phonePrimary || 'No Email' }}
                </option>
            </select>
        </div>

        <!-- Step 2: Select Documents -->
        <div class="mb-6">
            <label class="block text-sm font-bold text-gray-700 mb-2">2. Which pending documents do you need?</label>
            
            <div v-if="pendingDocuments.length === 0" class="p-4 bg-gray-50 text-sm text-gray-500 rounded-md border">
                There are no pending documents available to request.
            </div>
            
            <div v-else class="max-h-60 overflow-y-auto border rounded-md divide-y">
                <label 
                    v-for="doc in pendingDocuments" 
                    :key="doc.id" 
                    class="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                >
                    <input 
                        type="checkbox" 
                        :value="doc.id" 
                        v-model="requestPayload.documentIds" 
                        class="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded"
                    >
                    <span class="ml-3 text-sm text-gray-700">
                        {{ doc.documentType?.label || doc.documentType?.name }}
                    </span>
                </label>
            </div>
            <div class="mt-2 text-xs text-gray-500 flex justify-between">
                <span>{{ requestPayload.documentIds.length }} selected</span>
                <button type="button" @click="selectAllDocs" class="text-brand-primary hover:underline">Select All</button>
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end space-x-3 pt-4 border-t">
            <button 
                @click="closeRequestModal" 
                class="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
                Cancel
            </button>
            <button 
                @click="sendDocumentRequest" 
                :disabled="isSendingRequest || !requestPayload.participantId || requestPayload.documentIds.length === 0"
                class="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-opacity-90 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <span v-if="!isSendingRequest">Send Secure Link</span>
                <span v-else class="animate-spin text-xs">🌀</span>
            </button>
        </div>
    </div>
  </Modal>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/services/api';
import noteService from '@/services/noteService';
import { useAlerts } from '@/composables/useAlerts';
import { useAuthStore } from '@/store/auth';
import Modal from '@/components/common/Modal.vue';
import NotesPanel from '@/components/estates/NotesPanel.vue';

const props = defineProps({ 
  caseId: { type: [String, Number], required: true },
  currentTeamId: { type: [String, Number], default: null },
  fileTypeId: { type: [Number, String], default: null },
  isReadonly: { type: Boolean, default: false } 
});

const route = useRoute();
const productSlug = computed(() => route.params.productSlug);
const { showAlert } = useAlerts();
const authStore = useAuthStore();

const requirements = ref([]);
const stakeholders = ref([]);
const selectedParticipantId = ref('corporate');
const isLoading = ref(true);
const error = ref(null);
const submissionData = reactive({});
const dirtyRequirementIds = reactive(new Set());
const sourcedData = ref({});

// Notes & Files State
const showNotesModal = ref(false);
const currentNoteContext = reactive({ type: '', id: 0, title: '' });
const currentNotes = ref([]);
const showFilesModal = ref(false);
const activeFileReq = ref(null);
const isUploading = ref(false);
const galleryInput = ref(null);
const scanInput = ref(null);
const selfieInput = ref(null);
const showLinkInput = ref(false);
const externalLinkPath = ref('');

const triggerInput = (type) => {
    if (type === 'scan') scanInput.value.click();
    else if (type === 'selfie') selfieInput.value.click();
    else galleryInput.value.click();
};

const openFiles = (req) => {
    activeFileReq.value = req;
    showFilesModal.value = true;
};

// Document Request Modal State
const isRequestModalOpen = ref(false);
const isSendingRequest = ref(false);
const isLoadingParticipants = ref(false);
const availableParticipants = ref([]);

const requestPayload = reactive({
    participantId: null,
    documentIds: []
});

// --- FILTER REQUIREMENTS BY ACTIVE STAKEHOLDER SELECTION ---
const filteredRequirements = computed(() => {
    return requirements.value.filter(req => {
        const docType = req.documentType || req.document_type;
        if (!docType) return false;
        
        const active = docType.is_active !== undefined ? docType.is_active : docType.isActive;
        if (active !== true && active !== 1 && active !== '1') return false;

        const reqParticipantId = req.case_participant_id || req.caseParticipantId;

        // Corporate Tab: only show items with no participant attached
        if (selectedParticipantId.value === 'corporate') {
            return !reqParticipantId;
        }

        // Show All
        if (selectedParticipantId.value === 'all') {
            return true;
        }

        // Specific Stakeholder Selected
        return reqParticipantId === selectedParticipantId.value;
    });
});

const getParticipantDocCount = (participantId) => {
    return requirements.value.filter(req => {
        const pId = req.case_participant_id || req.caseParticipantId;
        if (participantId === null) return !pId;
        return pId === participantId;
    }).length;
};

const pendingDocuments = computed(() => {
    return filteredRequirements.value.filter(doc => {
        const status = doc.currentStatus || doc.current_status || 'pending';
        return (status === 'pending' || status === 'stale' || status === 'requested' || status === 'expired') && 
               doc.isRequired !== false && doc.is_required !== false;
    });
});

const selectAllDocs = () => {
    requestPayload.documentIds = pendingDocuments.value.map(doc => doc.id);
};

// Helper for date placeholder hints
const getDatePlaceholder = (docType) => {
    if (!docType) return 'Select Date...';
    if (docType.actionFieldLabel || docType.action_field_label) {
        return docType.actionFieldLabel || docType.action_field_label;
    }
    const rule = docType.dateRuleType || docType.date_rule_type;
    if (rule === 'hard_printed_expiry') return 'Expiry Date...';
    if (rule === 'recency_max_age') return 'Issue Date...';
    if (rule === 'rolling_interval') return 'Exam / Event Date...';
    if (rule === 'project_bound') return 'Project End Date...';
    if (rule === 'cadence_recurring') return 'Submission Date...';
    return 'Select Date...';
};

// --- PARTICIPANT / STAKEHOLDER FETCHING ---
const fetchParticipants = async () => {
    isLoadingParticipants.value = true;
    try {
        const targetCaseId = props.caseId || route.params.id;
        const targetSlug = productSlug.value || route.params.productSlug;
        
        const response = await apiClient.get(`/${targetSlug}/cases/${targetCaseId}/participants`);
        const allParticipants = response.data?.data || response.data || [];
        
        availableParticipants.value = allParticipants;

        stakeholders.value = allParticipants.filter(p => {
            const isFlagged = p.group_on_documents === true || p.groupOnDocuments === true;
            const hasAssignedDocs = requirements.value.some(req => {
                const pId = req.case_participant_id || req.caseParticipantId;
                return pId === p.id;
            });
            return isFlagged || hasAssignedDocs;
        });
    } catch (err) {
        console.error("Could not load participants", err);
    } finally {
        isLoadingParticipants.value = false;
    }
};

const openRequestModal = async (req = null) => {
    isRequestModalOpen.value = true;

    if (req) {
        // Urgent renewal shortcut: pre-target this specific document and its participant.
        requestPayload.documentIds = [req.id];
        const reqParticipant = req.caseParticipantId ?? req.case_participant_id;
        if (reqParticipant) {
            requestPayload.participantId = reqParticipant;
        } else if (typeof selectedParticipantId.value === 'number') {
            requestPayload.participantId = selectedParticipantId.value;
        } else {
            const primary = availableParticipants.value.find(p => p.isPrimaryContact || p.is_primary_contact);
            requestPayload.participantId = primary ? primary.id : null;
        }
        return;
    }

    requestPayload.documentIds = [];
    
    if (typeof selectedParticipantId.value === 'number') {
        requestPayload.participantId = selectedParticipantId.value;
    } else {
        const primary = availableParticipants.value.find(p => p.isPrimaryContact || p.is_primary_contact);
        requestPayload.participantId = primary ? primary.id : null;
    }
};

// Urgent-renewal flag: the doc is still 'valid' but its reminder lead-window has
// already started (backend sends is_renewal_urgent; client-side fallback for safety).
const isRenewalUrgent = (req) => {
    const flag = req.isRenewalUrgent ?? req.is_renewal_urgent;
    if (flag !== undefined && flag !== null) return flag === true;

    const status = req.currentStatus || req.current_status;
    const exp = req.expires_at || req.expiresAt;
    if (status !== 'valid' || !exp) return false;

    const lead = Number(req.documentType?.reminderLeadDays ?? req.documentType?.reminder_lead_days ?? 0);
    if (lead <= 0) return false;

    const daysToExpiry = (new Date(exp).getTime() - Date.now()) / 86400000;
    return daysToExpiry <= lead;
};

const closeRequestModal = () => {
    isRequestModalOpen.value = false;
};

const sendDocumentRequest = async () => {
    isSendingRequest.value = true;
    try {
        await apiClient.post(`/${productSlug.value}/cases/${props.caseId}/portal-requests`, {
            participant_id: requestPayload.participantId,
            document_ids: requestPayload.documentIds
        });

        showAlert('Success', 'Secure link generated and dispatched!');
        
        requestPayload.documentIds.forEach(id => {
            const doc = requirements.value.find(d => d.id === id);
            if (doc) {
                doc.currentStatus = 'requested';
                doc.current_status = 'requested';
            }
        });

        closeRequestModal();
    } catch (error) {
        showAlert('Error', error.response?.data?.message || 'Failed to dispatch portal link.');
    } finally {
        isSendingRequest.value = false;
    }
};

// --- DATA FETCHING ---
const resolveSourceKey = (docType) => docType?.recordsourceId ?? docType?.recordsource_id ?? docType?.recordsource ?? null;

const fetchSourcedData = async () => {
    const sourcesToFetch = new Set(
        requirements.value.map(req => resolveSourceKey(req.documentType)).filter(Boolean) 
    );
    for (const source of sourcesToFetch) {
        if (!sourcedData.value[source]) { 
            try {
                const { data } = await apiClient.get(`/products/${productSlug.value}/option-lists/${encodeURIComponent(source)}`);
                sourcedData.value[source] = data; 
            } catch (err) { console.error(`Failed source: ${source}`, err); }
        }
    }
};

const fetchRequirements = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const params = props.fileTypeId ? { file_type_id: props.fileTypeId } : {};
    const { data } = await apiClient.get(`/${route.params.productSlug}/cases/${props.caseId}/documents`, { params });
    requirements.value = Array.isArray(data) ? data : data.data || [];
    dirtyRequirementIds.clear();
    
    requirements.value.forEach(req => {
      const val = req.actionFieldValue || req.action_field_value || '';
      const status = req.currentStatus || req.current_status || 'pending';
      submissionData[req.id] = {
        value: val,
        isChecked: ['received', 'valid'].includes(status),
      };
    });

    await fetchSourcedData();
  } catch (err) {
    error.value = 'Failed to fetch document requirements.';
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const getDualDate = (val, key) => {
    if (!val) return '';
    try {
        const parsed = typeof val === 'string' && val.startsWith('{') ? JSON.parse(val) : null;
        return parsed ? (parsed[key] || '') : '';
    } catch {
        return '';
    }
};

const updateDualDate = (reqId, key, dateValue) => {
    let current = {};
    const existingVal = submissionData[reqId]?.value;
    if (existingVal && typeof existingVal === 'string' && existingVal.startsWith('{')) {
        try { current = JSON.parse(existingVal); } catch {}
    }
    current[key] = dateValue;
    submissionData[reqId].value = JSON.stringify(current);
    handleInputChange(reqId);
};

const handleInputChange = (requirementId) => {
  dirtyRequirementIds.add(requirementId);
};

const saveAllChanges = async () => {
  if (dirtyRequirementIds.size === 0) return;
  const updates = [];
  dirtyRequirementIds.forEach(id => {
    const data = submissionData[id];
    updates.push({ id: id, value: data.value, is_checked: data.isChecked });
  });

  try {
    await apiClient.put(`/${route.params.productSlug}/cases/${props.caseId}/documents`, { updates });
    showAlert('Success', 'Changes saved successfully!');
    await fetchRequirements(); 
  } catch (err) {
    showAlert('Error', 'Failed to save changes.');
    console.error(err);
  }
};

const getStatusInfo = (status) => {
    if (!status) return { class: 'bg-gray-100', textClass: 'text-gray-600' };
    const normalized = status.toLowerCase();
    const map = {
        pending: { class: 'bg-gray-100', textClass: 'text-gray-600' },
        received: { class: 'bg-blue-100', textClass: 'text-blue-700' },
        valid: { class: 'bg-green-100', textClass: 'text-green-700' },
        expired: { class: 'bg-red-100', textClass: 'text-red-700' },
        stale: { class: 'bg-red-100', textClass: 'text-red-700' },
        not_applicable: { class: 'bg-gray-200', textClass: 'text-gray-500' },
        requested: { class: 'bg-orange-100', textClass: 'text-orange-700' },
        submitted: { class: 'bg-yellow-100', textClass: 'text-yellow-700' }
    };
    return map[normalized] || map.pending;
};

// --- NOTES LOGIC ---
const openNotes = async (req) => {
    currentNoteContext.type = 'case_document_requirement';
    currentNoteContext.id = req.id;
    currentNoteContext.title = `Notes: ${req.documentType?.label || 'Document'}`;
    const contextUrl = `${route.params.productSlug}/cases/${props.caseId}`;
    try {
        const { data } = await noteService.getNotes('case_document_requirement', req.id, contextUrl);
        currentNotes.value = data;
        showNotesModal.value = true;
    } catch (err) {
        showAlert('Error', 'Failed to load notes');
    }
};

const getFileUrl = (file, type = 'preview') => {
    const token = authStore.token || authStore.user?.token || ''; 
    return `/api/v1/files/${file.id}/${type}?token=${token}`;
};

const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !activeFileReq.value) return;

    isUploading.value = true;
    const formData = new FormData();
    formData.append('file', file);

    try {
        const { data } = await apiClient.post(`requirements/${activeFileReq.value.id}/files`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        const reqIndex = requirements.value.findIndex(r => r.id === activeFileReq.value.id);
        if (reqIndex !== -1) {
            if (!requirements.value[reqIndex].files) requirements.value[reqIndex].files = [];
            requirements.value[reqIndex].files.push(data); 
            activeFileReq.value = requirements.value[reqIndex];
        }

        showAlert('Success', 'File uploaded');
    } catch (err) {
        showAlert('Error', 'Upload failed');
    } finally {
        isUploading.value = false;
    }
};

const deleteFile = async (fileId) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
        await apiClient.delete(`files/${fileId}`);
        await fetchRequirements();
        activeFileReq.value = requirements.value.find(r => r.id === activeFileReq.value.id);
        showAlert('Success', 'File deleted');
    } catch (err) {
        showAlert('Error', 'Failed to delete file');
    }
};

const submitExternalLink = async () => {
    if (!externalLinkPath.value || isUploading.value) return;

    isUploading.value = true;
    try {
        const { data } = await apiClient.post(`requirements/${activeFileReq.value.id}/files`, {
            external_path: externalLinkPath.value
        });

        activeFileReq.value.files.push(data);
        externalLinkPath.value = '';
        showLinkInput.value = false;
    } catch (error) {
        alert("Failed to link path.");
    } finally {
        isUploading.value = false;
    }
};

onMounted(() => {
    fetchRequirements();
    fetchParticipants();
});
</script>

<style scoped>
.documents-table-override {
  display: table !important;
}
.documents-table-override th,
.documents-table-override td {
  display: table-cell !important;
}
</style>