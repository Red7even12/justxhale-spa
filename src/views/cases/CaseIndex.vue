<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <!-- TOUR ANCHOR 1: Workspace Context -->
      <div id="tour-workspace-context">
        <h1 class="text-2xl font-black text-gray-800 uppercase tracking-tight">
          {{ productName }} Index
        </h1>
        <p class="text-xs text-gray-500 mt-0.5">Manage case files, compliance milestones and operational exceptions.</p>
      </div>
      
      <div class="flex items-center gap-2 self-start sm:self-auto">
        <!-- Persistent Walkthrough Replay Button -->
        <button
          @click="startTour(true)"
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition-all shadow-xs cursor-pointer"
          title="Click to replay the guided interactive walkthrough"
        >
          <span>💡</span>
          <span>Tour</span>
        </button>

        <!-- TOUR ANCHOR 5: Create Case Button -->
        <button 
          id="tour-create-case-btn"
          v-if="canCreateCase && activeTab === 'cases'" 
          @click="showModal = true" 
          class="bg-brand-primary text-white px-4 py-2.5 rounded-xl shadow-md font-bold text-xs hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer">
          <span>+</span> Create New Case
        </button>
      </div>
    </div>

    <!-- Product Sub-View Mode Switcher (POPIA Scoped) -->
    <div class="flex items-center gap-2 border-b border-gray-200">
      <button 
        @click="activeTab = 'cases'"
        class="py-3 px-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 cursor-pointer"
        :class="activeTab === 'cases' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-400 hover:text-gray-700'"
      >
        <span>📋</span> Active Cases
        <span v-if="pagination.total > 0" class="bg-gray-100 text-gray-700 text-[10px] font-mono px-2 py-0.5 rounded-full">
          {{ pagination.total }}
        </span>
        <SectionHelp topic="case_registry" />
      </button>

      <!-- Operational Exceptions (Pulse) is only surfaced when at least one
           Niche in this product has an entry in public.file_type_log_definition
           (i.e. Operational Logbooks are actually configured). -->
      <button 
        v-if="hasOperationalLogbooks"
        @click="switchTab('pulse')"
        class="py-3 px-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 cursor-pointer"
        :class="activeTab === 'pulse' ? 'border-rose-600 text-rose-600' : 'border-transparent text-gray-400 hover:text-gray-700'"
      >
        <span>🚨</span> Operational Exceptions (Pulse)
        <span 
          v-if="productPulseDefects.length > 0" 
          class="bg-rose-100 text-rose-800 text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse"
        >
          {{ productPulseDefects.length }}
        </span>
        <SectionHelp topic="pulse_exceptions" />
      </button>
    </div>

    <!-- ================================================================= -->
    <!-- TAB 1: ALL CASES (Existing Search & Table View)                    -->
    <!-- ================================================================= -->
    <div v-if="activeTab === 'cases'" class="space-y-6">
      <!-- Enhanced Search & Filter Console -->
      <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-200 space-y-5">
        
        <!-- Top Row: The 3 Search Blocks -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-100 pb-5">
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Search Case Name / File Reference</label>
            <input 
              v-model="filters.search_general" 
              @input="handleSearchInput('general')" 
              type="text" 
              placeholder="e.g. Estate Late J Doe" 
              class="w-full border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary text-sm bg-gray-50 focus:bg-white transition-colors"
            >
          </div>

          <div>
            <label class="block text-xs font-bold text-brand-primary uppercase mb-1">Search Participant</label>
            <input 
              v-model="filters.search_participant" 
              @input="handleSearchInput('participant')" 
              type="text" 
              placeholder="e.g. John Doe" 
              class="w-full border-brand-primary/30 rounded-lg focus:ring-brand-primary focus:border-brand-primary text-sm bg-blue-50/30 focus:bg-white transition-colors"
            >
          </div>

          <div>
            <label class="block text-xs font-bold text-brand-primary uppercase mb-1">External Reference (Notes)</label>
            <input 
              v-model="filters.search_external_ref" 
              @input="handleSearchInput('external')" 
              type="text" 
              placeholder="e.g. 9123456789" 
              class="w-full border-brand-primary/30 rounded-lg focus:ring-brand-primary focus:border-brand-primary text-sm bg-blue-50/30 focus:bg-white transition-colors"
            >
          </div>
        </div>

        <!-- Bottom Row: Select Filters (Disabled if Primary Search is active) -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4" :class="{'opacity-50 pointer-events-none': isPrimarySearchActive}">
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
            <select v-model="filters.status" @change="applyFilters" class="w-full border-gray-300 rounded-lg text-sm">
              <option value="">All Open</option>
              <option value="open">Open</option>

              <template v-if="canSeeInactive">
                  <option value="pending">Pending</option>
                  <option value="closed">Closed</option>
                  <option value="cancelled">Cancelled</option>
              </template>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Niche (Type)</label>
            <select v-model="filters.file_type_id" @change="applyFilters" class="w-full border-gray-300 rounded-lg text-sm">
              <option value="">All Niches</option>
              <option v-for="type in fileTypes" :key="type.id" :value="type.id">{{ type.name }}</option>
            </select>
          </div>

          <!-- TOUR ANCHOR 4: POPIA Teams & Clearance Filter -->
          <div id="tour-team-clearance">
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Assigned Team</label>
            <select v-model="filters.current_team_id" @change="applyFilters" class="w-full border-gray-300 rounded-lg text-sm">
              <option value="">All Teams</option>
              <option v-for="team in teams" :key="team.id" :value="team.id">{{ team.name }}</option>
            </select>
          </div>

          <div class="flex gap-2 items-end">
            <button @click="clearFilters" class="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-2 px-4 rounded-lg transition-colors text-sm border border-gray-200 pointer-events-auto">
              Reset All
            </button>
          </div>
        </div>
        
        <div v-if="isPrimarySearchActive" class="text-xs font-bold text-amber-600 flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          Primary search active. Standard filters are temporarily disabled.
        </div>
      </div>

      <!-- TOUR ANCHOR 2: Case Registry Table -->
      <div id="tour-case-table" class="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden relative">
        <div v-if="isLoading" class="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>

        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th @click="toggleSort('file_name')" class="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-brand-primary transition-colors group select-none">
                <div class="flex items-center gap-1">
                  Case Details
                  <span class="text-gray-300 group-hover:text-brand-primary transition-colors">
                    <svg v-if="filters.sort_by === 'file_name' && filters.sort_dir === 'asc'" class="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
                    <svg v-else-if="filters.sort_by === 'file_name' && filters.sort_dir === 'desc'" class="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    <svg v-else class="w-4 h-4 opacity-0 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path></svg>
                  </span>
                </div>
              </th>
              
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Type / Niche</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
              
              <th @click="toggleSort('updated_at')" class="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-brand-primary transition-colors group select-none">
                <div class="flex items-center gap-1">
                  Updated
                  <span class="text-gray-300 group-hover:text-brand-primary transition-colors">
                    <svg v-if="filters.sort_by === 'updated_at' && filters.sort_dir === 'asc'" class="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
                    <svg v-else-if="filters.sort_by === 'updated_at' && filters.sort_dir === 'desc'" class="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    <svg v-else class="w-4 h-4 opacity-0 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path></svg>
                  </span>
                </div>
              </th>
              
              <!-- TOUR ANCHOR 3: SOP Milestones Progress Header -->
              <th id="tour-milestone-matrix" class="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                Progress
              </th>
              <th class="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="caseFile in cases" :key="caseFile.id" 
              :class="[
                'hover:bg-gray-50 transition-colors', 
                { 'opacity-60 grayscale-[30%]': ['cancelled', 'closed'].includes(caseFile.status) }
              ]"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <div 
                    :style="caseFile.fileClass ? { 
                      backgroundColor: caseFile.fileClass.bg_color || caseFile.fileClass.bgColor, 
                      color: caseFile.fileClass.text_color || caseFile.fileClass.textColor 
                    } : {}"
                    :class="[
                      'text-sm font-bold', 
                      caseFile.fileClass ? 'px-2 py-0.5 rounded shadow-sm' : 'text-gray-900'
                    ]"
                  >
                    {{ caseFile.fileName || caseFile.file_name }}
                  </div>

                  <!-- Operational Red-Tag Mini Badge -->
                  <span
                    v-if="caseFile.operationalStatus === 'grounded' || caseFile.operational_status === 'grounded'"
                    class="bg-rose-100 text-rose-800 border border-rose-300 text-[9px] font-black px-1.5 py-0.5 rounded uppercase animate-pulse"
                  >
                    ● GROUNDED
                  </span>
                </div>
                
                <div class="text-xs text-gray-400 font-medium mt-0.5">
                  {{ caseFile.fileReference || caseFile.file_reference || 'No Reference' }}
                </div>
              </td>

              <td class="px-6 py-4">
                <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-bold uppercase">
                  {{ caseFile.fileType?.name || caseFile.file_type?.name }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide border',
                  caseFile.status === 'open' ? 'bg-green-100 text-green-800 border-green-200' : 
                  caseFile.status === 'pending' ? 'bg-amber-100 text-amber-800 border-amber-200' : 
                  caseFile.status === 'closed' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                  'bg-gray-200 text-gray-700 border-gray-300'
                ]">
                  {{ caseFile.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                 {{ $formatDate(caseFile.updatedAt || caseFile.updated_at) }}
              </td>

              <!-- Adaptive Stacked Milestones -->
              <td class="px-6 py-4">
                <div v-if="getNicheMilestones(caseFile).length" class="space-y-2 min-w-[180px]">
                  <div 
                    v-for="(niche, nIdx) in (
                      isCaseExpanded(caseFile.id) || getNicheMilestones(caseFile).length <= 3
                        ? getNicheMilestones(caseFile)
                        : getNicheMilestones(caseFile).slice(0, 2)
                    )" 
                    :key="niche.file_type_id || nIdx"
                    class="flex flex-col gap-0.5"
                  >
                    <div class="flex items-center justify-between text-[10px] uppercase font-bold tracking-tight">
                      <span class="text-gray-600 truncate max-w-[120px]" :title="niche.file_type_name">
                        {{ niche.file_type_name }}
                      </span>
                      <span class="font-mono text-[9px] font-black text-gray-400">
                        {{ niche.milestones_completed }}/{{ niche.milestones_total }}
                      </span>
                    </div>

                    <div class="flex gap-0.5 items-center">
                      <div 
                        v-for="(m, mIdx) in niche.milestone_matrix" 
                        :key="mIdx"
                        :title="m.name"
                        :class="[
                          'w-2 h-3.5 rounded-xs border transition-colors duration-200',
                          m.status === 1 
                            ? 'bg-green-400 border-green-500 shadow-2xs' 
                            : 'bg-gray-100 border-gray-200'
                        ]"
                      ></div>
                    </div>
                  </div>

                  <div v-if="getNicheMilestones(caseFile).length > 3" class="pt-0.5">
                    <button 
                      @click.stop="toggleCaseMilestones(caseFile.id)" 
                      type="button" 
                      class="text-[10px] font-bold text-brand-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>
                        {{ isCaseExpanded(caseFile.id) 
                          ? '▲ Show less' 
                          : `+ ${getNicheMilestones(caseFile).length - 2} more niches ▾` 
                        }}
                      </span>
                    </button>
                  </div>
                </div>

                <div v-else class="text-xs text-gray-300 italic">
                  No milestones
                </div>
              </td>
              <td class="px-6 py-4 text-right text-sm font-medium">
                <router-link :to="`/${productSlug}/cases/${caseFile.id}`" class="text-brand-primary hover:underline font-bold">
                  View Details
                </router-link>
              </td>
            </tr>
            <tr v-if="cases.length === 0 && !isLoading">
              <td colspan="6" class="px-6 py-12 text-center text-gray-500 italic">
                No cases found matching your criteria.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Server-Side Pagination Controls -->
      <div class="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between rounded-xl">
        <div class="text-sm text-gray-500 font-medium">
          Showing <span class="font-bold">{{ pagination.from }}</span> to <span class="font-bold">{{ pagination.to }}</span> of <span class="font-bold">{{ pagination.total }}</span> results
        </div>
        <div class="flex gap-2">
          <button 
            @click="changePage(pagination.current_page - 1)" 
            :disabled="pagination.current_page <= 1"
            class="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            Previous
          </button>
          <button 
            @click="changePage(pagination.current_page + 1)" 
            :disabled="pagination.current_page >= pagination.last_page"
            class="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- ================================================================= -->
    <!-- TAB 2: OPERATIONAL EXCEPTIONS (PULSE) — POPIA Product Scope        -->
    <!-- Gated behind hasOperationalLogbooks (file_type_log_definition)      -->
    <!-- ================================================================= -->
    <div v-if="activeTab === 'pulse' && hasOperationalLogbooks" class="space-y-6">
      <!-- Pulse Console Header -->
      <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-xl shadow-inner">
            🚨
          </div>
          <div>
            <h2 class="text-sm font-black text-gray-800 uppercase tracking-tight">Unresolved Operational Defects</h2>
            <p class="text-xs text-gray-500 mt-0.5">
              Real-time queue of safety grounding events, failed inspection routines and pending CAPA sign-offs for
              <span class="font-bold text-gray-700">{{ productName }}</span>.
            </p>
          </div>
        </div>

        <button
          @click="fetchProductPulse"
          :disabled="isPulseLoading"
          type="button"
          class="self-start sm:self-auto px-4 py-2.5 text-xs font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <span :class="{ 'animate-spin inline-block': isPulseLoading }">↻</span>
          Refresh Pulse
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isPulseLoading" class="py-16 flex justify-center items-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
      </div>

      <!-- Empty State (All Clear) -->
      <div v-else-if="productPulseDefects.length === 0" class="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
        <div class="mx-auto w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-2xl text-emerald-600 mb-3 shadow-sm">
          ✓
        </div>
        <h3 class="text-sm font-bold text-gray-800">Zero Unresolved Operational Defects</h3>
        <p class="text-xs text-gray-500 max-w-md mx-auto mt-1">
          Every equipment asset and matter in this workspace is operational with no pending corrective action tasks.
        </p>
      </div>

      <!-- Exception Queue -->
      <div v-else class="space-y-3">
        <div
          v-for="(item, idx) in productPulseDefects"
          :key="pulseDefectId(item, idx)"
          class="bg-white rounded-xl border shadow-sm overflow-hidden transition-colors"
          :class="isSafetyCriticalDefect(item) ? 'border-rose-300 hover:border-rose-400' : 'border-amber-300 hover:border-amber-400'"
        >
          <div class="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <!-- Left: Casefile & Defect Metadata -->
            <div class="space-y-1.5 flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span
                  class="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full text-white"
                  :class="isSafetyCriticalDefect(item) ? 'bg-rose-600 animate-pulse' : 'bg-amber-600'"
                >
                  {{ isSafetyCriticalDefect(item) ? 'GROUNDED / RED-TAG' : 'ADVISORY' }}
                </span>

                <h3 class="text-sm font-black text-gray-900">
                  {{ item.fileName || item.file_name }}
                </h3>

                <span class="text-[11px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  Ref: {{ item.fileReference || item.file_reference || 'N/A' }}
                </span>

                <template v-if="item.fileTypeName || item.file_type_name">
                  <span class="text-xs text-gray-400">|</span>
                  <span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-bold uppercase">
                    {{ item.fileTypeName || item.file_type_name }}
                  </span>
                </template>
              </div>

              <div class="text-xs text-gray-600 flex items-center gap-3 flex-wrap">
                <span>📋 <strong>{{ item.logDefinitionName || item.log_definition_name }}</strong></span>
                <span>👤 Logged by: <strong>{{ item.loggedByName || item.logged_by_name }}</strong> ({{ item.loggedByRole || item.logged_by_role || 'Field Operator' }})</span>
                <span>⏱ {{ formatDateTime(item.loggedAt || item.logged_at) }}</span>
              </div>

              <!-- Telemetry Answers Preview -->
              <div
                v-if="Object.keys(parsePayload(item.payload)).length"
                class="mt-2 bg-gray-50 p-2.5 rounded-lg border border-gray-200 text-[11px] font-mono flex flex-wrap gap-2"
              >
                <span
                  v-for="(val, key) in parsePayload(item.payload)"
                  :key="key"
                  class="px-2 py-0.5 rounded bg-white border border-gray-200"
                >
                  <strong class="text-gray-600">{{ key }}:</strong>
                  <span :class="val === false ? 'text-rose-600 font-black ml-1' : 'text-gray-700 ml-1'">
                    {{ val === false ? 'FAIL' : (val === true ? 'PASS' : val) }}
                  </span>
                </span>
              </div>
            </div>

            <!-- Right: CAPA Actions -->
            <div class="flex items-center gap-2 shrink-0 self-end md:self-center">
              <button
                @click="openResolveModal(item)"
                type="button"
                class="px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow transition-colors cursor-pointer"
              >
                Sign-Off & Resolve (CAPA)
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- CAPA Resolution Modal -->
      <div
        v-if="activeResolvingItem"
        class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4"
      >
        <div class="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <div>
              <h3 class="text-sm font-bold text-gray-900">CAPA Sign-Off & Defect Resolution</h3>
              <p class="text-[11px] text-gray-500 font-mono">
                {{ activeResolvingItem.fileName || activeResolvingItem.file_name }}
              </p>
            </div>
            <button @click="activeResolvingItem = null" type="button" class="text-gray-400 hover:text-gray-600 text-base cursor-pointer">✕</button>
          </div>

          <div class="p-6 space-y-4">
            <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
              <div class="font-bold">
                Original Defect: {{ activeResolvingItem.logDefinitionName || activeResolvingItem.log_definition_name }}
              </div>
              <div>
                Reported by {{ activeResolvingItem.loggedByName || activeResolvingItem.logged_by_name }}
                at {{ formatDateTime(activeResolvingItem.loggedAt || activeResolvingItem.logged_at) }}
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase mb-1">
                Corrective Action Notes / Repair Sign-off *
              </label>
              <textarea
                v-model="resolutionNotes"
                rows="4"
                placeholder="Detail parts replaced, mechanic work order #, or risk mitigation steps..."
                class="w-full text-xs rounded-xl border-gray-300 focus:ring-rose-500 focus:border-rose-500"
              ></textarea>
            </div>

            <label class="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer">
              <input
                type="checkbox"
                v-model="restoreOperationalStatus"
                class="rounded text-rose-600 focus:ring-rose-500 border-gray-300"
              />
              <span class="text-xs text-gray-700 font-medium">
                Restore Asset Operational Status to <strong class="text-emerald-600">Operational</strong>
              </span>
            </label>
          </div>

          <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
            <button
              @click="activeResolvingItem = null"
              type="button"
              class="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              @click="submitResolution"
              :disabled="isResolving || resolutionNotes.trim().length < 5"
              type="button"
              class="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow disabled:opacity-50 transition-colors cursor-pointer"
            >
              {{ isResolving ? 'Submitting...' : 'Sign Off & Close Defect' }}
            </button>
          </div>
        </div>
      </div>
    </div>
        <!-- Create Case Modal (Unchanged structurally, just using the pre-loaded data) -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div class="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div class="bg-brand-primary p-6 text-white">
          <h2 class="text-xl font-bold">Initialize New Case</h2>
          <p class="text-xs opacity-80 uppercase tracking-widest mt-1">Product: {{ productName }}</p>
        </div>
        
        <form @submit.prevent="createCase" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 uppercase mb-1">Classification (Niche)</label>
            <select v-model="form.fileTypeId" required class="w-full border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary text-sm font-medium">
              <option value="">-- Select File Type --</option>
              <option v-for="type in fileTypes" :key="type.id" :value="type.id">{{ type.name }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 uppercase mb-1">Assigned Team</label>
            <select v-model="form.currentTeamId" required class="w-full border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary text-sm font-medium">
              <option value="">-- Select Team --</option>
              <option v-for="team in teams" :key="team.id" :value="team.id">{{ team.name }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 uppercase mb-1">Case Name</label>
            <input v-model="form.fileName" type="text" required placeholder="e.g. Estate Late J Doe" class="w-full border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary">
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 uppercase mb-1">Internal Reference</label>
            <input v-model="form.fileReference" type="text" placeholder="REF-2026-001" class="w-full border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary">
          </div>

          <div class="flex justify-end gap-3 mt-8">
            <button type="button" @click="showModal = false" class="text-gray-400 font-bold hover:text-gray-600 px-4 py-2">Cancel</button>
            <button type="submit" class="bg-brand-primary text-white px-6 py-2 rounded-lg font-bold shadow-md hover:opacity-90">
              Create Case File
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import caseService from '@/services/caseService';
import teamService from '@/services/teamService';
import apiClient from '@/services/api';
import { useAuthStore } from '@/store/auth'; 
import { useGuidedTour } from '@/composables/useGuidedTour';
import { useOperationalPulse } from '@/composables/useOperationalPulse';
import SectionHelp from '@/components/common/SectionHelp.vue';

const authStore = useAuthStore();
const route = useRoute();
const productSlug = computed(() => route.params.productSlug);

// Workspace display context. Prefers the licensed Product's own name
// (resolved from the tenant /products/{slug} endpoint - the same call
// ProductLayout uses for branding) and gracefully degrades to a
// Title-Cased slug (e.g. `justxhale-co-op` -> `Justxhale Co Op`).
const product = ref(null);
const productName = computed(() => {
  if (product.value?.name) return product.value.name;
  return productSlug.value
    ? productSlug.value.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'Product';
});
//const guidedTour = useGuidedTour();
const { startTour } = useGuidedTour(); 

// Shared Operational Pulse accessors (logId / log_id, severity key-casing).
const { isSafetyCriticalDefect, pulseDefectId } = useOperationalPulse();

// --- TAB SWITCHER & PRODUCT PULSE STATE ---
const activeTab = ref('cases'); // 'cases' | 'pulse'
const productPulseDefects = ref([]);
const isPulseLoading = ref(false);

const activeResolvingItem = ref(null);
const resolutionNotes = ref('');
const restoreOperationalStatus = ref(true);

const switchTab = (tab) => {
  // Hard gate: the Pulse view only exists when this workspace actually has
  // Operational Logbooks configured on at least one Niche
  // (an entry in public.file_type_log_definition).
  if (tab === 'pulse' && !hasOperationalLogbooks.value) {
    activeTab.value = 'cases';
    return;
  }

  activeTab.value = tab;
  if (tab === 'pulse') {
    fetchProductPulse();
  }
};

const fetchProductPulse = async () => {
  if (!productSlug.value) return;

  // Never hit the telemetry endpoint when no Niche in this product has an
  // entry in public.file_type_log_definition - nothing can raise a defect.
  if (!hasOperationalLogbooks.value) {
    productPulseDefects.value = [];
    return;
  }

  isPulseLoading.value = true;
  try {
    const res = await apiClient.get('/telemetry/pulse', {
      params: { product_slug: productSlug.value }
    });
    productPulseDefects.value = res.data?.data?.data || res.data?.data || [];
  } catch (err) {
    console.error('Failed to load product operational pulse', err);
  } finally {
    isPulseLoading.value = false;
  }
};

const openResolveModal = (item) => {
  activeResolvingItem.value = item;
  resolutionNotes.value = '';
  restoreOperationalStatus.value = true;
};

const submitResolution = async () => {
  if (!activeResolvingItem.value || resolutionNotes.value.trim().length < 5) return;
  
  const targetLogId = activeResolvingItem.value.logId 
    ?? activeResolvingItem.value.log_id 
    ?? activeResolvingItem.value.id;

  if (!targetLogId) return;
  isResolving.value = true;

  try {
    await apiClient.post(`/telemetry/logs/${targetLogId}/resolve`, {
      resolution_notes: resolutionNotes.value,
      restore_operational_status: restoreOperationalStatus.value
    });
    activeResolvingItem.value = null;
    await fetchProductPulse();
    fetchCases(); // Refresh main cases list
  } catch (err) {
    console.error('Failed to resolve defect', err);
    alert(err.response?.data?.message || 'Resolution failed.');
  } finally {
    isResolving.value = false;
  }
};

const isResolving = ref(false);

const parsePayload = (payload) => {
  if (!payload) return {};
  if (typeof payload === 'string') {
    try {
      return JSON.parse(payload);
    } catch (_) {
      return {};
    }
  }
  return payload;
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
// ------------------------------------------

const canSeeInactive = computed(() => {
  return authStore.hasRole('Subscriber Admin') || authStore.hasRole('Case File Admin');
});

const canCreateCase = computed(() => {
  const permissions = authStore.permissions || [];
  return permissions.includes('create case files');
});

const cases = ref([]);
const fileTypes = ref([]);
const teams = ref([]);
const showModal = ref(false);
const isLoading = ref(false);

/**
 * Operational Pulse (logbook) gate.
 *
 * `{productSlug}/file-types` returns each assembled Niche together with an
 * `active_log_definitions_count` aggregate sourced from the
 * public.file_type_log_definition pivot. The Operational Exceptions tab is
 * only offered when at least one Niche has a live logbook configured.
 * (Defensive dual-casing: the API camelCases every response key.)
 */
const hasOperationalLogbooks = computed(() => {
  return fileTypes.value.some((type) => Number(
    type.activeLogDefinitionsCount
      ?? type.active_log_definitions_count
      ?? type.logDefinitionsCount
      ?? type.log_definitions_count
      ?? 0
  ) > 0);
});

const filters = ref({ 
  search_general: '',
  search_participant: '',
  search_external_ref: '',
  status: 'open',
  file_type_id: '',
  current_team_id: '',
  sort_by: 'updated_at',
  sort_dir: 'desc',
  page: 1
});

const toggleSort = (column) => {
  if (filters.value.sort_by === column) {
    filters.value.sort_dir = filters.value.sort_dir === 'asc' ? 'desc' : 'asc';
  } else {
    filters.value.sort_by = column;
    filters.value.sort_dir = 'asc';
  }
  filters.value.page = 1;
  fetchCases();
};

// State for users
const subscriberUsers = ref([]);

const isHumanSelectedNiche = computed(() => {
  if (!form.value.fileTypeId) return false;
  const selected = fileTypes.value.find(t => t.id === form.value.fileTypeId);
  const archetype = selected?.subject_archetype || selected?.subjectArchetype;
  return archetype === 'human_individual';
});

const formatArchetypeLabel = (arch) => {
  const map = {
    human_individual: 'Human',
    asset_equipment: 'Asset',
    corporate_entity: 'Corporate',
    fiduciary_estate: 'Estate',
    transactional_matter: 'Matter'
  };
  return map[arch] || 'Matter';
};

const onNicheChange = () => {
  if (!isHumanSelectedNiche.value) {
    form.value.subjectUserId = null;
  }
};

// In initializePage(), fetch users for the subscriber dropdown
const fetchSubscriberUsers = async () => {
  try {
    const res = await apiClient.get('/users', { params: { per_page: 100 } });
    subscriberUsers.value = res.data.data || res.data || [];
  } catch (err) {
    console.error('Failed to load subscriber users for binding', err);
  }
};

const getNicheMilestones = (caseFile) => {
  let matrix = caseFile.milestoneMatrix || caseFile.milestone_matrix;
  if (typeof matrix === 'string') {
    try {
      matrix = JSON.parse(matrix);
    } catch (e) {
      matrix = [];
    }
  }
  if (!matrix || !Array.isArray(matrix) || matrix.length === 0) return [];

  const groups = {};
  for (const m of matrix) {
    const typeId = m.fileTypeId ?? m.file_type_id;
    const typeName = m.fileTypeName ?? m.file_type_name ?? 'General';
    const key = typeId ?? typeName;

    if (!groups[key]) {
      groups[key] = {
        file_type_id: typeId,
        file_type_name: typeName,
        milestones_total: 0,
        milestones_completed: 0,
        milestone_matrix: []
      };
    }
    groups[key].milestone_matrix.push(m);
    groups[key].milestones_total++;
    if (m.status === 1) {
      groups[key].milestones_completed++;
    }
  }
  return Object.values(groups);
};

const expandedCases = ref([]);
const toggleCaseMilestones = (caseId) => {
  const index = expandedCases.value.indexOf(caseId);
  if (index > -1) {
    expandedCases.value.splice(index, 1);
  } else {
    expandedCases.value.push(caseId);
  }
};
const isCaseExpanded = (caseId) => expandedCases.value.includes(caseId);

const pagination = ref({
  current_page: 1,
  last_page: 1,
  total: 0,
  from: 0,
  to: 0
});

const isPrimarySearchActive = computed(() => {
  return !!filters.value.search_participant || !!filters.value.search_external_ref;
});

const form = ref({ fileTypeId: '', currentTeamId: '', fileName: '', fileReference: '' });
let searchTimeout = null;

/**
 * Resolve the human-readable Product Name for the active workspace.
 * Mirrors ProductLayout's branding call so subscribers (not just platform
 * admins) receive the licensed label; silently degrades to the prettified
 * slug (productName) when the call is unavailable.
 */
const fetchProduct = async () => {
  if (!productSlug.value) return;
  try {
    const { data } = await apiClient.get(`products/${productSlug.value}`);
    product.value = data;
  } catch (error) {
    console.error("Failed to load product context", error);
    product.value = null;
  }
};

const initializePage = async () => {
  try {
    const [ftRes, teamRes] = await Promise.all([
        caseService.getFileTypes(productSlug.value),
        teamService.getTeams()
    ]);
    fileTypes.value = Array.isArray(ftRes.data) ? ftRes.data : (ftRes.data.data || []);
    teams.value = Array.isArray(teamRes.data) ? teamRes.data : (teamRes.data.data || []);
    
    fetchCases();
    fetchProduct();
    // Pre-load the tab badge. fetchProductPulse() is self-gated by
    // hasOperationalLogbooks, so workspaces without logbooks never fire
    // an unnecessary telemetry request.
    fetchProductPulse();
  } catch (error) {
    console.error("Failed to load initial data", error);
  }
};

const fetchCases = async () => {
  isLoading.value = true;
  try {
    const { data } = await caseService.getCases(productSlug.value, filters.value);
    cases.value = data.data;
    
    const meta = data.meta || data;
    const totalRecords = Number(meta.total) || 0;
    const perPage = Number(meta.per_page || meta.perPage) || 15;

    pagination.value = {
      current_page: Number(meta.current_page || meta.currentPage) || filters.value.page,
      last_page: Number(meta.last_page || meta.lastPage) || Math.ceil(totalRecords / perPage) || 1,
      total: totalRecords,
      from: Number(meta.from) || 0,
      to: Number(meta.to) || 0
    };
  } catch (error) {
    console.error("Error fetching cases", error);
  } finally {
    isLoading.value = false;
  }
};

const handleSearchInput = (type) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    applyFilters();
  }, 400);
};

const applyFilters = () => {
  filters.value.page = 1;
  fetchCases();
};

const clearFilters = () => {
  filters.value = { 
    search_general: '', search_participant: '', search_external_ref: '', 
    status: 'open', file_type_id: '', current_team_id: '', 
    sort_by: 'created_at', sort_dir: 'desc', page: 1 
  };
  fetchCases();
};

const changePage = (pageNumber) => {
  if (pageNumber > 0 && pageNumber <= pagination.value.last_page) {
    filters.value.page = pageNumber;
    fetchCases();
  }
};

const createCase = async () => {
  try {
    await caseService.createCase(productSlug.value, form.value);
    showModal.value = false;
    form.value = { fileTypeId: '', currentTeamId: '', fileName: '', fileReference: '', subjectUserId: null };
    filters.value.page = 1;
    fetchCases();
  } catch (error) {
    alert("Error creating case. Ensure all required fields are selected.");
  }
};

watch(productSlug, () => {
  clearFilters();
  initializePage();
});

// If the workspace is switched to a product whose Niches have no logbooks
// while the Pulse tab is open, gracefully fall back to the Case Registry.
watch(hasOperationalLogbooks, (enabled) => {
  if (!enabled && activeTab.value === 'pulse') {
    activeTab.value = 'cases';
  }
});

onMounted(async () => {
  await initializePage();
  const userId = authStore.user?.id || null;
  startTour(false, userId); // Runs for this specific user; never skipped by previous testers
});
</script>