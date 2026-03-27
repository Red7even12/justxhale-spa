<template>
  <div class="space-y-8 pb-12">
    <!-- Welcome Header: Branded to Product -->
    <div class="bg-white p-10 rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden">
        <div class="relative z-10">
            <h2 class="text-3xl font-black text-gray-800">
                {{ product?.name }} <span :style="{ color: 'var(--brand-primary)' }">Architect Workspace</span>
            </h2>
            <p class="text-gray-500 mt-2 text-lg font-medium">You are currently editing the master "DNA" for this product blueprint.</p>
        </div>
        <!-- Subtle decorative background element using brand color -->
        <div class="absolute -right-10 -bottom-10 opacity-[0.03]" :style="{ color: 'var(--brand-primary)' }">
            <svg width="300" height="300" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
        </div>
    </div>
    
    <!-- DNA Vital Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        <!-- Niche Count -->
        <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-600 transition-colors">Casefile Types</div>
            <div class="text-4xl font-black mt-2" :style="{ color: 'var(--brand-primary)' }">
                {{ product?.fileTypesCount ?? product?.file_types_count ?? 0 }}
            </div>
            <div class="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">Vertical Definitions</div>
        </div>

        <!-- Workflow Count -->
        <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-600 transition-colors">Workflows</div>
            <div class="text-4xl font-black mt-2" :style="{ color: 'var(--brand-primary)' }">
                {{ product?.workflowDefinitionsCount ?? product?.workflow_definitions_count ?? 0 }}
            </div>
            <div class="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">Automated Blueprints</div>
        </div>

        <!-- Participant Count -->
        <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-600 transition-colors">Character Roles</div>
            <div class="text-4xl font-black mt-2" :style="{ color: 'var(--brand-primary)' }">
                {{ product?.participantRolesCount ?? product?.participant_roles_count ?? 0 }}
            </div>
            <div class="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">Defined Participants</div>
        </div>

        <!-- License Count -->
        <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-600 transition-colors">Market Adoption</div>
            <div class="text-4xl font-black mt-2 text-green-500">
                {{ product?.subscribersCount ?? product?.subscribers_count ?? 0 }}
            </div>
            <div class="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">Active Licenses</div>
        </div>

    </div>

    <!-- Quick Actions / Checklist: Secondary Branded -->
    <div class="rounded-2xl p-8 text-white shadow-xl relative overflow-hidden" :style="{ backgroundColor: 'var(--brand-primary)' }">
        <div class="absolute inset-0 opacity-10 bg-gradient-to-br from-white to-transparent"></div>
        <div class="relative z-10">
            <h3 class="text-xs font-black uppercase tracking-widest opacity-60 mb-8 border-b border-white/10 pb-4">Architect Blueprinting Checklist</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div class="flex items-start gap-5">
                    <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-black shrink-0 border border-white/20 shadow-lg">1</div>
                    <div>
                        <h4 class="font-bold text-base leading-tight">Define your Niches</h4>
                        <p class="text-xs text-white/60 mt-2 font-medium leading-relaxed">Create the vertical file types, layout templates, and their specific custom metadata fields.</p>
                    </div>
                </div>
                <div class="flex items-start gap-5">
                    <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-black shrink-0 border border-white/20 shadow-lg">2</div>
                    <div>
                        <h4 class="font-bold text-base leading-tight">Sync Workflow Logic</h4>
                        <p class="text-xs text-white/60 mt-2 font-medium leading-relaxed">Configure the task sequences and dependency logic that drive the automation engine.</p>
                    </div>
                </div>
                <div class="flex items-start gap-5">
                    <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-black shrink-0 border border-white/20 shadow-lg">3</div>
                    <div>
                        <h4 class="font-bold text-base leading-tight">Setup Document Packs</h4>
                        <p class="text-xs text-white/60 mt-2 font-medium leading-relaxed">Group document requirements into reusable templates for different case scenarios.</p>
                    </div>
                </div>
                <div class="flex items-start gap-5">
                    <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-black shrink-0 border border-white/20 shadow-lg">4</div>
                    <div>
                        <h4 class="font-bold text-base leading-tight">Configure Comms</h4>
                        <p class="text-xs text-white/60 mt-2 font-medium leading-relaxed">Define the automated email templates and triggers for participant notifications.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
// Props inherited from the Layout
defineProps(['product', 'slug']);
</script>