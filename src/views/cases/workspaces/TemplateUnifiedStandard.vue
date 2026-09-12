<template>
  <!-- Path: frontend-spa/src/views/cases/workspaces/TemplateUnifiedStandard.vue -->
  <div class="h-full flex flex-col relative">
    
    <!-- 1. DYNAMIC CASE HEADER & ROOT TOOLBAR -->
    <CaseWorkspaceHeader 
      :case-file="caseFile" 
      :active-file-type="activeFileType"
      :available-file-types="availableFileTypes"
      @tab-changed="activeFileType = $event"
      @open-setup="openSetupDrawer"
    />

    <!-- 2. STATUS WARNING BANNER (Read-only guard) -->
    <div v-if="['cancelled', 'closed', 'pending'].includes(caseFile.status)" 
        class="my-3 border-l-4 p-4 rounded-r-lg shadow-sm shrink-0"
        :class="caseFile.status === 'cancelled' ? 'bg-red-50 border-red-400' : 'bg-blue-50 border-blue-400'">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <svg v-if="caseFile.status === 'cancelled'" class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <svg v-else class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm font-bold uppercase tracking-tight"
            :class="caseFile.status === 'cancelled' ? 'text-red-700' : 'text-blue-700'">
            Case {{ caseFile.status.toUpperCase() }}: This file is in read-only mode.
          </p>
        </div>
      </div>
    </div>

    <!-- 2.1. OPERATIONAL GROUNDING & DEFECT WARNING BANNER (PILLAR 3) -->
    <div 
      v-if="(caseFile.operational_status === 'grounded' || caseFile.operationalStatus === 'grounded') || 
            (caseFile.operational_status === 'advisory' || caseFile.operationalStatus === 'advisory')" 
      class="my-3 border-l-4 p-4 rounded-r-xl shadow-sm shrink-0 flex items-center justify-between"
      :class="(caseFile.operational_status === 'grounded' || caseFile.operationalStatus === 'grounded') 
        ? 'bg-rose-50 border-rose-500 text-rose-900' 
        : 'bg-amber-50 border-amber-500 text-amber-900'"
    >
      <div class="flex items-center gap-3">
        <span class="text-2xl">
          {{ (caseFile.operational_status === 'grounded' || caseFile.operationalStatus === 'grounded') ? '🚨' : '⚠️' }}
        </span>
        <div>
          <h4 class="text-xs font-black uppercase tracking-wider">
            {{ (caseFile.operational_status === 'grounded' || caseFile.operationalStatus === 'grounded') 
                ? 'OPERATIONAL EXCEPTION: ASSET GROUNDED (RED-TAG)' 
                : 'OPERATIONAL ADVISORY ACTIVE' }}
          </h4>
          <p class="text-xs opacity-90">
            {{ (caseFile.operational_status === 'grounded' || caseFile.operationalStatus === 'grounded') 
                ? 'A safety-critical defect was reported during field telemetry inspection. Operational usage is restricted until CAPA resolution.' 
                : 'An operational advisory issue has been logged against this casefile.' }}
          </p>
        </div>
      </div>
      <button 
        @click="workspaceView = 'telemetry'" 
        class="px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg bg-white border shadow-sm hover:bg-slate-50 transition"
        :class="(caseFile.operational_status === 'grounded' || caseFile.operationalStatus === 'grounded') 
          ? 'border-rose-300 text-rose-700' 
          : 'border-amber-300 text-amber-700'"
      >
        View Log History →
      </button>
    </div>

    <!-- 2.5. POPIA NO ACCESS BANNER -->
    <div v-if="availableFileTypes.length === 0" class="my-4 border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg shadow-sm shrink-0">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm font-bold uppercase tracking-tight text-red-800">
            Access Denied: You do not belong to the authorized functional teams for this file.
          </p>
        </div>
      </div>
    </div>

    <!-- 2.8. WORKSPACE VIEW MODE SWITCHER (Compliance Matrix vs Telemetry) -->
    <div v-if="availableFileTypes.length > 0" class="flex items-center justify-between my-2 border-b border-gray-200 pb-2">
      <div class="flex items-center gap-2">
        <button
          @click="workspaceView = 'compliance'"
          class="px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5"
          :class="workspaceView === 'compliance' 
            ? 'bg-slate-900 text-white shadow-sm' 
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'"
        >
          <span>>></span> Compliance Vault & Workflows
        </button>

        <button
          @click="workspaceView = 'telemetry'"
          class="px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5"
          :class="workspaceView === 'telemetry' 
            ? 'bg-slate-900 text-white shadow-sm' 
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'"
        >
          <span>>></span> Operational Logbooks & Telemetry
          <span v-if="caseLogs.length > 0" class="ml-1 bg-blue-100 text-blue-800 text-[10px] font-black px-1.5 py-0.2 rounded-full">
            {{ caseLogs.length }}
          </span>
        </button>
      </div>

      <!-- QR Quick Link Token -->
      <div v-if="caseFile.qr_uuid" class="hidden sm:flex items-center gap-2 text-[11px] text-gray-500 font-mono">
        <span>Field QR:</span>
        <a 
          :href="`/scan/${caseFile.qr_uuid}`" 
          target="_blank" 
          class="text-blue-600 hover:underline bg-blue-50 px-2 py-0.5 rounded border border-blue-100 font-bold"
        >
          Scan Endpoint ↗
        </a>
      </div>
    </div>

    <!-- 3. WORKSPACE CONTENT AREA (Scoped to Active View Mode) -->
    
    <!-- VIEW A: COMPLIANCE & WORKFLOWS -->
    <div v-if="availableFileTypes.length > 0 && workspaceView === 'compliance'" class="grid grid-cols-1 lg:grid-cols-10 gap-6 flex-1 min-h-0 mt-2">
      <!-- Column 1: Active Tab's Document Pack -->
      <div :class="hasActiveWorkflow ? 'lg:col-span-6' : 'lg:col-span-10'" class="relative group transition-all duration-300">
        <div class="lg:col-span-6 relative group">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 h-[600px] overflow-hidden flex flex-col">
            <div class="p-6 h-full overflow-hidden">
              <CaseDocumentsTable 
                :key="`docs-${activeFileType?.id || 'default'}`"
                :case-id="caseFile.id" 
                :file-type-id="activeFileType?.id"
                :current-team-id="caseFile.current_team_id || caseFile.currentTeamId" 
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Column 2: Active Tab's Workflow Checklist -->
      <div v-if="hasActiveWorkflow" class="lg:col-span-4 relative group">
        <div class="lg:col-span-4 relative group">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 h-[600px] overflow-hidden flex flex-col">
            <div class="p-6 h-full overflow-hidden">
              <CaseWorkflowPanel 
                :key="`wf-${activeFileType?.id || 'default'}`"
                :case-id="caseFile.id" 
                :file-type-id="activeFileType?.id"
                :current-team-id="caseFile.current_team_id || caseFile.currentTeamId" 
              />
            </div>
          </div>
        </div>
      </div>
    </div> 

    <!-- VIEW B: OPERATIONAL LOGBOOK & TELEMETRY STREAM (PILLAR 3) -->
    <div v-else-if="availableFileTypes.length > 0 && workspaceView === 'telemetry'" class="flex-1 min-h-0 mt-2 overflow-y-auto space-y-4">
      <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 class="text-sm font-bold text-gray-900">Historical Operational Stream</h3>
          <p class="text-xs text-gray-500">Chronological telemetry, pre-trip walkarounds, and logged exceptions.</p>
        </div>

        <div class="flex items-center gap-3">
          <button 
            @click="fetchCaseLogs" 
            :disabled="isLoadingLogs"
            class="px-3 py-1.5 text-xs font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
          >
            {{ isLoadingLogs ? 'Refreshing...' : '↻ Refresh Stream' }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoadingLogs" class="py-12 flex justify-center items-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="caseLogs.length === 0" class="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
        <div class="mx-auto w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-xl mb-3">
          ⏱️
        </div>
        <h4 class="text-sm font-bold text-gray-800">No Operational Logs Recorded</h4>
        <p class="text-xs text-gray-500 max-w-sm mx-auto mt-1">
          Scan the physical QR token on the asset to submit daily pre-trips or inspections.
        </p>
      </div>

      <!-- Log Entries Stream -->
      <div v-else class="space-y-3">
        <div
          v-for="log in caseLogs"
          :key="log.id"
          class="bg-white p-5 rounded-2xl border transition shadow-sm"
          :class="log.has_flagged_issue ? 'border-rose-300 bg-rose-50/10' : 'border-gray-200'"
        >
          <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-gray-900">{{ log.log_definition?.name || 'Operational Log' }}</span>
              <span class="text-xs text-gray-400 font-mono">({{ log.log_definition?.category }})</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-500">
                {{ formatLogDate(log.logged_at) }} by <strong>{{ log.logged_by_name }}</strong> ({{ log.logged_by_role || 'Operator' }})
              </span>
              <span
                class="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full"
                :class="log.has_flagged_issue ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'"
              >
                {{ log.has_flagged_issue ? log.defect_severity : 'Clean' }}
              </span>
            </div>
          </div>

          <!-- Payload Answers Grid -->
          <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div v-for="(val, key) in log.payload" :key="key" class="truncate">
              <span class="text-gray-500">{{ key }}:</span>
              <span class="ml-1 font-bold" :class="val === false ? 'text-rose-600' : 'text-gray-800'">
                {{ val === false ? 'FAIL' : (val === true ? 'PASS' : val) }}
              </span>
            </div>
          </div>

          <!-- CAPA Resolution Notes (if closed) -->
          <div v-if="log.is_resolved && log.has_flagged_issue" class="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
            <strong>✓ CAPA Resolved by {{ log.resolver?.name || 'Supervisor' }} on {{ formatLogDate(log.resolved_at) }}:</strong>
            <p class="mt-0.5">{{ log.resolution_notes }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. INLINE CASE SETUP SLIDE-OVER DRAWER -->
    <transition
      enter-active-class="transform transition ease-in-out duration-300"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transform transition ease-in-out duration-300"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <div v-if="showSetupDrawer" class="fixed inset-y-0 right-0 max-w-full flex z-50 pl-10">
        <div class="w-screen max-w-2xl bg-white shadow-2xl border-l border-gray-200 flex flex-col">
          
          <!-- Drawer Header -->
          <div class="p-6 bg-brand-primary text-white flex justify-between items-center shrink-0">
            <div>
              <h2 class="text-xl font-black uppercase tracking-tight">Edit Case Setup</h2>
              <p class="text-xs opacity-80 uppercase font-bold tracking-wider mt-0.5">
                Niche: {{ activeFileType?.name || 'Primary' }}
              </p>
            </div>
            <button @click="closeSetupDrawer" class="text-white hover:text-gray-200 p-2 rounded-lg text-lg font-black">
              ✕
            </button>
          </div>

          <!-- Setup Form Tabs (Details vs Participants) -->
          <div class="flex border-b border-gray-200 bg-gray-50 px-6 shrink-0">
            <button 
              @click="setupTab = 'details'"
              :class="['py-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all', setupTab === 'details' ? 'border-brand-primary text-brand-primary bg-white' : 'border-transparent text-gray-500 hover:text-gray-700']">
              Details & Fields
            </button>
            <button 
              @click="setupTab = 'participants'"
              :class="['py-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all', setupTab === 'participants' ? 'border-brand-primary text-brand-primary bg-white' : 'border-transparent text-gray-500 hover:text-gray-700']">
              Role-Player Participants
            </button>
          </div>



          <!-- Drawer Body -->
          <div class="p-6 overflow-y-auto flex-1">
            
            <!-- SUB-TAB: DETAILS & FIELDS -->
            <form v-if="setupTab === 'details'" @submit.prevent="saveMetadata" class="space-y-6">
              <div class="grid grid-cols-2 gap-4">
                
                <!-- File Name -->
                <div class="col-span-2">
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">File Name</label>
                  <input v-model="detailsForm.file_name" type="text" class="w-full border-gray-200 rounded-xl font-bold text-gray-700 text-sm">
                </div>

                <!-- File Reference -->
                <div>
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">File Reference</label>
                  <input v-model="detailsForm.file_reference" type="text" class="w-full border-gray-200 rounded-xl font-bold text-gray-700 text-sm font-mono">
                </div>

                <!-- Assigned Team -->
                <div>
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Assigned Team</label>
                  <select v-model="detailsForm.current_team_id" class="w-full border-gray-200 rounded-xl text-sm font-bold text-gray-700">
                    <option :value="null">-- Unassigned --</option>
                    <option v-for="team in ownershipTeams" :key="team.id" :value="team.id">
                      {{ team.name }}
                    </option>
                  </select>
                </div>

                <!-- Priority Classification -->
                <div class="col-span-2">
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Classification (Priority)</label>
                  <select v-model="detailsForm.file_class_id" class="w-full border-gray-200 rounded-xl text-sm font-bold text-gray-700">
                    <option :value="null">-- Standard (No Class) --</option>
                    <option v-for="cls in fileClasses" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
                  </select>
                </div>

                <!-- Linked System User (Human Individuals Only) -->
                <div 
                  v-if="activeFileType?.subject_archetype === 'human_individual' || activeFileType?.subjectArchetype === 'human_individual'" 
                  class="col-span-2 p-3 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1"
                >
                  <label class="block text-[10px] font-black text-blue-700 uppercase tracking-widest">
                    👤 Linked System User (Driver / Operator Identity)
                  </label>
                  <select v-model="detailsForm.subject_user_id" class="w-full border-blue-300 rounded-xl text-sm font-bold text-gray-800 bg-white shadow-sm">
                    <option :value="null">-- No Direct User Account Linked --</option>
                    <option v-for="u in availableUsers" :key="u.id" :value="u.id">
                      {{ u.name }} ({{ u.email }})
                    </option>
                  </select>
                </div>

                <div v-if="availableNicheLogDefinitions.length > 0" class="col-span-2 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <label class="block text-[10px] font-black text-slate-700 uppercase tracking-widest">
                  ⏱️ Assigned Operational Logbook Routine
                </label>
                <select v-model="detailsForm.log_definition_id" class="w-full border-slate-300 rounded-xl text-sm font-bold text-slate-800 bg-white shadow-sm">
                  <option :value="null">-- No Logbook Routine Assigned --</option>
                  <option v-for="logDef in availableNicheLogDefinitions" :key="logDef.id" :value="logDef.id">
                    {{ logDef.name }} ({{ logDef.category }})
                  </option>
                </select>
                <p class="text-[10px] text-slate-500">
                  Determines which checklist form is rendered when scanning this asset's QR code.
                </p>
              </div>

                <!-- Dynamic Niche Custom Fields -->
                <div v-for="field in currentNicheFields.filter(f => !f.participantRoleId)" :key="field.id" class="col-span-2">
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    {{ field.fieldLabel || field.field_label || field.label }}
                    <span v-if="field.showInQuickView || field.show_in_quick_view" class="text-indigo-600 ml-1">★</span>
                  </label>

                  <!-- 1. DATE PICKER (Finesse Pattern) -->
                  <div v-if="field.fieldType === 'date' || field.field_type === 'date'" class="relative group">
                    <div class="flex items-center justify-between w-full px-3 h-[42px] bg-white border border-gray-200 rounded-xl shadow-sm group-hover:border-indigo-500 transition-colors">
                      <span class="text-sm font-bold uppercase tracking-tight" :class="detailsForm.meta_data[field.key] ? 'text-indigo-700' : 'text-gray-400'">
                        {{ detailsForm.meta_data[field.key] ? $formatDate(detailsForm.meta_data[field.key]) : 'Select Date...' }}
                      </span>
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input type="date" v-model="detailsForm.meta_data[field.key]" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10">
                  </div>

                  <!-- 2. CHECKBOX GROUP (Multi-Select driven by Option Lists) -->
                  <div v-else-if="field.fieldType === 'checkbox_group' || field.field_type === 'checkbox_group'" class="p-3 bg-white border border-gray-200 rounded-xl shadow-sm space-y-2">
                    <div v-if="!getOptionListOptions(field)?.length" class="text-xs text-gray-400 italic">
                      No options found in linked list.
                    </div>
                    <label v-for="opt in getOptionListOptions(field)" :key="opt.id" class="flex items-center gap-2.5 text-xs font-bold text-gray-700 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg">
                      <input 
                        type="checkbox" 
                        :value="opt.optionValue || opt.option_value" 
                        v-model="detailsForm.meta_data[field.key]" 
                        class="rounded text-indigo-600 h-4 w-4 border-gray-300"
                      >
                      <span>{{ opt.optionValue || opt.option_value }}</span>
                    </label>
                  </div>

                  <!-- 3. SELECT DROPDOWN (Single Select driven by Option Lists) -->
                  <select 
                    v-else-if="field.fieldType === 'select' || field.field_type === 'select'"
                    v-model="detailsForm.meta_data[field.key]"
                    class="w-full border-gray-200 rounded-xl text-sm font-bold text-gray-700 h-[42px] bg-white shadow-sm"
                  >
                    <option :value="null">-- Select Option --</option>
                    <option v-for="opt in getOptionListOptions(field)" :key="opt.id" :value="opt.optionValue || opt.option_value">
                      {{ opt.optionValue || opt.option_value }}
                    </option>
                  </select>

                  <!-- 4. TEXTAREA -->
                  <textarea 
                    v-else-if="field.fieldType === 'textarea' || field.field_type === 'textarea'"
                    v-model="detailsForm.meta_data[field.key]"
                    rows="3"
                    class="w-full border-gray-200 rounded-xl text-sm font-bold text-gray-700 shadow-sm"
                  ></textarea>

                  <!-- 5. STANDARD TEXT / NUMBER INPUT -->
                  <input 
                    v-else 
                    v-model="detailsForm.meta_data[field.key]" 
                    :type="(field.fieldType === 'number' || field.field_type === 'number') ? 'number' : 'text'"
                    class="w-full border-gray-200 rounded-xl text-sm font-bold text-gray-700 h-[42px] shadow-sm"
                  >
                </div>

              </div>

              <div class="flex justify-end pt-4 border-t border-gray-100">
                <button type="submit" :disabled="isSaving" class="bg-brand-primary text-white text-xs px-6 py-2.5 rounded-xl font-bold shadow hover:opacity-90 disabled:opacity-50 transition-all">
                  {{ isSaving ? 'Saving...' : 'Save Case Details' }}
                </button>
              </div>
            </form>

            <!-- SUB-TAB: ROLE-PLAYER PARTICIPANTS -->
            <div v-if="setupTab === 'participants'" class="space-y-4">
              <div class="flex justify-between items-center">
                <h4 class="text-xs font-black uppercase text-gray-500 tracking-wider">
                  Case Role Players
                </h4>
                <button @click="openAssignParticipantModal" class="bg-brand-primary text-white text-[11px] px-3 py-1.5 rounded-lg font-bold shadow hover:opacity-90 transition-all">
                  + Add Participant
                </button>
              </div>

              <div class="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                <div v-for="part in (caseFile.participants || [])" :key="part.id" class="p-3 flex justify-between items-center hover:bg-gray-50">
                  <div>
                    <div class="text-sm font-bold text-gray-900">{{ part.entity?.name }}</div>
                    <div class="text-[10px] text-brand-primary font-bold uppercase tracking-wider">{{ part.roleKey || part.role_key }}</div>
                  </div>
                  <button @click="deleteParticipant(part)" class="text-red-500 hover:text-red-700 text-xs font-bold">Remove</button>
                </div>
                <div v-if="!caseFile.participants || caseFile.participants.length === 0" class="p-6 text-center text-xs text-gray-400 italic">
                  No participants assigned to this case yet.
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </transition>

    <!-- 5. ASSIGN PARTICIPANT MODAL -->
    <Modal :show="showAssignModal" @close="showAssignModal = false">
      <template #title>
        <span class="text-brand-primary font-bold">Assign Role-Player to Case</span>
      </template>

      <div class="p-6 space-y-4">
        <!-- Step 1: Select Contact (Entity) -->
        <div>
          <label class="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Select Contact / Entity</label>
          <select v-model="assignForm.entity_id" class="w-full border-gray-200 rounded-xl font-bold text-sm text-gray-700">
            <option :value="null" disabled>-- Choose Contact --</option>
            <option v-for="ent in availableEntities" :key="ent.id" :value="ent.id">
              {{ ent.name }} ({{ ent.email || ent.phone_primary || 'No Direct Contact' }})
            </option>
          </select>
        </div>

        <!-- Step 2: Select Role -->
        <div>
          <label class="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Assign Role</label>
          <select v-model="assignForm.role_key" class="w-full border-gray-200 rounded-xl font-bold text-sm text-gray-700">
            <option value="" disabled>-- Choose Role --</option>
            <option v-for="r in availableRoles" :key="r.id" :value="r.roleKey || r.role_key">
              {{ r.name }} {{ (r.groupOnDocuments || r.group_on_documents) ? '★ (Docs Target)' : '' }}
            </option>
          </select>
        </div>

        <!-- Primary Contact Toggle -->
        <div class="flex items-center gap-2 pt-2">
          <input type="checkbox" v-model="assignForm.is_primary_contact" id="is_prim" class="h-4 w-4 text-brand-primary rounded border-gray-300">
          <label for="is_prim" class="text-xs font-bold text-gray-700 cursor-pointer">Set as Primary Case Contact</label>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button type="button" @click="showAssignModal = false" class="px-4 py-2 text-xs font-bold text-gray-400 hover:text-gray-600">Cancel</button>
          <button 
            @click="submitAssignParticipant" 
            :disabled="isAssigning || !assignForm.entity_id || !assignForm.role_key"
            class="bg-brand-primary text-white text-xs px-6 py-2.5 rounded-xl font-bold shadow hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {{ isAssigning ? 'Assigning...' : 'Assign Participant' }}
          </button>
        </div>
      </div>
    </Modal>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, reactive } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/services/api';
import teamService from '@/services/teamService';
import { useAuthStore } from '@/store/auth';
import { useAlerts } from '@/composables/useAlerts';

import CaseWorkspaceHeader from '@/components/cases/CaseWorkspaceHeader.vue';
import CaseDocumentsTable from '@/components/cases/CaseDocumentsTable.vue';
import CaseWorkflowPanel from '@/components/cases/CaseWorkflowPanel.vue';
import Modal from '@/components/common/Modal.vue';

const props = defineProps({
  caseFile: { type: Object, required: true }
});

const availableNicheLogDefinitions = ref([]);
const availableUsers = ref([]);

const route = useRoute();
const authStore = useAuthStore();
const { showAlert, showConfirm } = useAlerts();

// Returns true if the active niche has at least one workflow definition
const hasActiveWorkflow = computed(() => {
  const wf = activeFileType.value?.workflow_definitions || activeFileType.value?.workflowDefinitions || [];
  return Array.isArray(wf) && wf.length > 0;
});

// --- PILLAR 3: OPERATIONAL TELEMETRY STATE ---
const workspaceView = ref('compliance'); // 'compliance' | 'telemetry'
const caseLogs = ref([]);
const isLoadingLogs = ref(false);

const fetchCaseLogs = async () => {
  if (!props.caseFile?.id) return;
  isLoadingLogs.value = true;
  try {
    const res = await apiClient.get(`/case-files/${props.caseFile.id}/logs`);
    caseLogs.value = res.data?.data?.data || res.data?.data || [];
  } catch (err) {
    console.error('Failed to load case logs', err);
  } finally {
    isLoadingLogs.value = false;
  }
};

const formatLogDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

watch(() => workspaceView.value, (newVal) => {
  if (newVal === 'telemetry' && caseLogs.value.length === 0) {
    fetchCaseLogs();
  }
});
// ----------------------------------------------


const teams = ref([]);
const fileClasses = ref([]);

const optionListOptions = reactive({});

const fetchOptionListOptions = async () => {
  const productSlug = props.slug || route.params.productSlug || route.params.slug;
  const listIds = [...new Set(
    currentNicheFields.value
      .filter(f => f.fieldType === 'select' || f.fieldType === 'checkbox_group')
      .map(f => f.optionListId)
      .filter(Boolean)
  )];

  await Promise.all(listIds.map(async (listId) => {
    if (optionListOptions[listId]) return;
    try {
      const { data } = await apiClient.get(`products/${productSlug}/option-lists/${listId}`);
      const options = Array.isArray(data) ? data : (data?.data || []);
      optionListOptions[listId] = options;
    } catch (e) {
      console.error(`Failed to load options for list ${listId}`, e);
      optionListOptions[listId] = [];
    }
  }));
};

const getOptionListOptions = (field) => {
  if (!field) return [];
  const listId = field.optionListId;
  if (listId) return optionListOptions[listId] || [];

  const inline = field.inlineOptions;
  if (Array.isArray(inline) && inline.length) {
    return inline.map(opt => {
      if (typeof opt === 'string' || typeof opt === 'number') {
        const value = String(opt);
        return { id: value, option_value: value };
      }
      return opt;
    });
  }
  return [];
};

const normalizeMultiselectValue = (v) => {
  if (v === true || v === 'true' || v === false || v === 'false'
      || v === null || v === undefined || v === '') {
    return [];
  }
  if (Array.isArray(v)) {
    return v.filter(x => x !== null && x !== undefined && x !== '').map(String);
  }
  if (typeof v === 'string') {
    try {
      const parsed = JSON.parse(v);
      if (Array.isArray(parsed)) {
        return parsed.filter(x => x !== null && x !== undefined && x !== '').map(String);
      }
    } catch (_) { /* not JSON; fall through to CSV split */ }
    return v.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
};

const ownershipTeams = computed(() => {
  return teams.value.filter(t => (t.team_type || t.teamType || 'ownership') === 'ownership');
});

const availableFileTypes = computed(() => {
  const product = props.caseFile.product;
  if (product && (product.file_types !== undefined || product.fileTypes !== undefined)) {
    const types = product.file_types || product.fileTypes || [];
    return [...types].sort((a, b) => (a.sort_order || a.sortOrder || 1) - (b.sort_order || b.sortOrder || 1));
  }
  return props.caseFile.fileType ? [props.caseFile.fileType] : [];
});

const activeFileType = ref(null);
const currentNicheFields = computed(() => {
  const fields = activeFileType.value?.fields || props.caseFile.fileType?.fields || [];
  return fields.map(f => {
    const key = f.fieldKey || f.field_key || f.key || '';
    const label = f.fieldLabel || f.field_label || f.label || key;
    const pRoleId = f.participantRoleId || f.participant_role_id;
    const showStar = f.showInQuickView === true || f.show_in_quick_view === true || f.show_in_quick_view === 1;

    return {
      id: f.id,
      label: label,
      key: key,
      fieldType: f.fieldType || f.field_type || 'text',
      showInQuickView: showStar,
      participantRoleId: (pRoleId && pRoleId !== "0") ? pRoleId : null,
      optionListId: f.documentOptionListId || f.document_option_list_id || null,
      inlineOptions: Array.isArray(f.options) ? f.options : []
    };
  });
});

const initActiveTab = async () => {
  if (availableFileTypes.value.length > 0 && !activeFileType.value) {
    const matched = availableFileTypes.value.find(ft => ft.id === props.caseFile.file_type_id);
    activeFileType.value = matched || availableFileTypes.value[0];
    await fetchOptionListOptions();
  }
  if (props.caseFile?.id) {
    fetchCaseLogs();
  }
};

watch(() => props.caseFile, initActiveTab, { immediate: true });
onMounted(initActiveTab);

// --- SETUP DRAWER STATE ---
const showSetupDrawer = ref(false);
const setupTab = ref('details');
const isSaving = ref(false);

const detailsForm = reactive({
  file_name: '',
  file_reference: '',
  current_team_id: null,
  file_class_id: null,
  meta_data: {}
});

const openSetupDrawer = async () => {
  showSetupDrawer.value = true;
  setupTab.value = 'details';

  detailsForm.file_name = props.caseFile.fileName || props.caseFile.file_name || '';
  detailsForm.file_reference = props.caseFile.fileReference || props.caseFile.file_reference || '';
  detailsForm.current_team_id = props.caseFile.currentTeamId || props.caseFile.current_team_id || null;
  detailsForm.file_class_id = props.caseFile.fileClassId || props.caseFile.file_class_id || null;
  detailsForm.subject_user_id = props.caseFile.subjectUserId || props.caseFile.subject_user_id || null;

  const rawMeta = props.caseFile.metaData || props.caseFile.meta_data || {};
  const nicheId = activeFileType.value?.id;
  const nicheScopedMeta = (nicheId && rawMeta[nicheId] && typeof rawMeta[nicheId] === 'object') ? rawMeta[nicheId] : {};

  detailsForm.meta_data = {};
  currentNicheFields.value.forEach(f => {
    const key = f.key;
    const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();

    const value = nicheScopedMeta[key] 
      ?? nicheScopedMeta[camelKey] 
      ?? nicheScopedMeta[snakeKey] 
      ?? rawMeta[key] 
      ?? rawMeta[camelKey] 
      ?? rawMeta[snakeKey] 
      ?? '';

    detailsForm.meta_data[key] = (f.fieldType === 'checkbox_group')
      ? normalizeMultiselectValue(value)
      : value;
  });

  await fetchOptionListOptions();

  if (teams.value.length === 0) {
    try {
      const [teamRes, classRes] = await Promise.all([
        teamService.getTeams(),
        apiClient.get(`/${route.params.productSlug}/file-classes`)
      ]);
      teams.value = teamRes.data.data || teamRes.data;
      fileClasses.value = classRes.data.data || classRes.data;
    } catch (err) {
      console.error("Failed to load setup collections", err);
    }
  }

  detailsForm.log_definition_id = props.caseFile.logDefinitionId || props.caseFile.log_definition_id || null;

  // Load the log definitions attached to this Niche via the Foundry pivot
  if (availableNicheLogDefinitions.value.length === 0 && activeFileType.value?.id) {
    try {
      const res = await apiClient.get(`file-types/${activeFileType.value.id}/log-definitions`);
      availableNicheLogDefinitions.value = res.data?.data || [];
    } catch (e) {
      console.error('Failed to load niche log definitions', e);
    }
  }

  // 👉 Load Users here (inside the function):
  if (availableUsers.value.length === 0) {
    try {
      const res = await apiClient.get('/users', { params: { per_page: 100 } });
      availableUsers.value = res.data.data || res.data || [];
    } catch (e) {
      console.error('Failed to load users for setup drawer', e);
    }
  }
};

const closeSetupDrawer = () => {
  showSetupDrawer.value = false;
};

const saveMetadata = async () => {
  isSaving.value = true;
  try {
    const rawMeta = { ...(props.caseFile.metaData || props.caseFile.meta_data || {}) };
    const nicheId = activeFileType.value?.id;

    if (nicheId) {
      rawMeta[nicheId] = {
        ...(rawMeta[nicheId] || {}),
        ...detailsForm.meta_data
      };
    } else {
      Object.assign(rawMeta, detailsForm.meta_data);
    }

    await apiClient.put(`/${route.params.productSlug}/cases/${props.caseFile.id}`, {
      file_name: detailsForm.file_name,
      file_reference: detailsForm.file_reference,
      current_team_id: detailsForm.current_team_id,
      file_class_id: detailsForm.file_class_id,
      subject_user_id: detailsForm.subject_user_id,
      log_definition_id: detailsForm.log_definition_id,
      meta_data: rawMeta
    });

    props.caseFile.log_definition_id = detailsForm.log_definition_id;
    props.caseFile.logDefinitionId = detailsForm.log_definition_id;
    props.caseFile.fileName = detailsForm.file_name;
    props.caseFile.file_name = detailsForm.file_name;
    props.caseFile.fileReference = detailsForm.file_reference;
    props.caseFile.file_reference = detailsForm.file_reference;
    props.caseFile.currentTeamId = detailsForm.current_team_id;
    props.caseFile.current_team_id = detailsForm.current_team_id;
    props.caseFile.fileClassId = detailsForm.file_class_id;
    props.caseFile.file_class_id = detailsForm.file_class_id;
    props.caseFile.subject_user_id = detailsForm.subject_user_id;
    props.caseFile.subjectUserId = detailsForm.subject_user_id;
    props.caseFile.meta_data = rawMeta;
    props.caseFile.metaData = rawMeta;

    if (detailsForm.file_class_id && fileClasses.value.length > 0) {
      const matched = fileClasses.value.find(c => c.id === detailsForm.file_class_id);
      if (matched) {
        props.caseFile.fileClass = matched;
        props.caseFile.file_class = matched;
      }
    } else {
      props.caseFile.fileClass = null;
      props.caseFile.file_class = null;
    }

    showAlert('Success', 'Case setup updated successfully.');
    closeSetupDrawer();
  } catch (err) {
    showAlert('Error', 'Failed to update setup.');
  } finally {
    isSaving.value = false;
  }
};

const showAssignModal = ref(false);
const isAssigning = ref(false);
const availableEntities = ref([]);
const availableRoles = ref([]);

const assignForm = reactive({
  entity_id: null,
  role_key: '',
  is_primary_contact: false
});

const openAssignParticipantModal = async () => {
  assignForm.entity_id = null;
  assignForm.role_key = '';
  assignForm.is_primary_contact = false;
  showAssignModal.value = true;

  try {
    const [entRes, roleRes] = await Promise.all([
      apiClient.get('/entities', { params: { per_page: 100 } }),
      apiClient.get(`/${route.params.productSlug}/participant-roles`)
    ]);
    availableRoles.value = roleRes.data.data || roleRes.data || [];

    const pageRecords = (res) => {
      const body = res && res.data;
      return (body && body.data) || (Array.isArray(body) ? body : []);
    };

    const allEntities = [...pageRecords(entRes)];
    const perPage = Number(entRes.data?.per_page) || 100;
    const total = Number(entRes.data?.total) || allEntities.length;
    const pages = total > 0 ? Math.ceil(total / perPage) : 1;

    const rest = await Promise.all(
      Array.from({ length: Math.max(0, pages - 1) }, (_, i) =>
        apiClient.get('/entities', { params: { page: i + 2, per_page: 100 } })
      )
    );
    rest.forEach(res => allEntities.push(...pageRecords(res)));

    availableEntities.value = allEntities;
  } catch (err) {
    console.error("Failed to load entities/roles", err);
  }
};

const submitAssignParticipant = async () => {
  if (!assignForm.entity_id || !assignForm.role_key) {
    showAlert('Warning', 'Please select both a Contact and a Role.');
    return;
  }

  isAssigning.value = true;
  try {
    const response = await apiClient.post(`/${route.params.productSlug}/cases/${props.caseFile.id}/participants`, {
      entity_id: assignForm.entity_id,
      role_key: assignForm.role_key,
      is_primary_contact: assignForm.is_primary_contact
    });

    const newPart = response.data.data || response.data;
    
    if (!props.caseFile.participants) {
      props.caseFile.participants = [];
    }

    const existingIndex = props.caseFile.participants.findIndex(p => p.id === newPart.id);
    if (existingIndex > -1) {
      props.caseFile.participants[existingIndex] = newPart;
    } else {
      props.caseFile.participants.push(newPart);
    }

    showAlert('Success', 'Participant assigned successfully.');
    showAssignModal.value = false;
    window.location.reload(); 
  } catch (err) {
    showAlert('Error', err.response?.data?.message || 'Failed to assign participant.');
  } finally {
    isAssigning.value = false;
  }
};

const deleteParticipant = async (part) => {
  const confirmed = await showConfirm('Remove Participant', `Remove ${part.entity?.name} from this case?`);
  if (!confirmed) return;

  try {
    await apiClient.delete(`/${route.params.productSlug}/cases/${props.caseFile.id}/participants/${part.id}`);
    
    if (props.caseFile.participants) {
      props.caseFile.participants = props.caseFile.participants.filter(p => p.id !== part.id);
    }
    
    showAlert('Success', 'Participant removed.');
  } catch (err) {
    showAlert('Error', 'Failed to remove participant.');
  }
};
</script>