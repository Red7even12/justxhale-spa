export const helpSnippets = {
  // --- MATTER WORKSPACE & HEADERS ---
  // Under Script section:  import SectionHelp from '@/components/common/SectionHelp.vue';
  // Help trigger e.g. <SectionHelp topic="assign_role_players" />
  matter_header: {
    title: 'Casefile Reference & Audit Trail',
    body: 'Status changes, notes and document uploads write permanent timeline entries for quick overview. This Note pop-up shows all notes captured for this Case File',
  },
  assign_role_players: {
    title: 'Assign Role-Players to Case',
    body: 'Contacts/Companies shown here are from the Contacts top menu. Create them once and they will be available to all your Teams for other Case Files.',
  },
  niche_tabs: {
    title: 'Multi-Niche Clearance Tabs',
    body: 'Decoupled operational domains (e.g. Medical Clinic, Fleet Technicals, Disciplinary). POPIA tab clearances govern which teams have access to each tab.',
  },
  pillar_switch: {
    title: 'Engine Pillar Switcher',
    body: 'Toggle between the statutory Compliance Vault (documents & SOP workflows) and Operational Logbooks & Pre-trip Telemetry.',
  },
  checklist: {
    title: 'Statutory Document Slots',
    body: 'Rows are required compliance slots, not simple attachments. Uploading a document fulfills the statutory demand and activates automated expiry tracking.',
  },
  date_rules: {
    title: 'Why Dates are Mandatory',
    body: 'Dates feed the automated alarm engine. Enter the exact printed expiry date (for licenses) or bill stamp date (for FICA utility bills) to avoid compliance lapses.',
  },
    linked_system_user: {
    title: 'Special Field: Linked System User',
    body: 'This allows the linked User to upload log files to the Case File. Ignore if the Case File does not have such a requirement.',
  },
  case_file_priority: {
    title: 'Special Field: Case File Priority',
    body: 'Determines the priority level of the case file, affecting its handling and notification protocols. This is an optional field and can be left blank if not applicable.',
  },
    show_all_reminders_for_casefile: {
        title: 'Show All Reminders for Case File',
        body: 'The "Show all" option in this filter displays all reminders associated with the case file selected under "Search Casefile", regardless of its status or due dates.',
    },
  my_tagged_only: {
    title: 'My Tagged Only',
    body: 'This option filters the reminders to display only those that are tagged for the current user.',
  },
  due_date_colours: {
    title: 'Due Date Colour Indicators',
    body:
    '<p>The colour of the due date indicates the Due Status of the Reminder.</p>' +
    '<ul style="margin:8px 0 0 16px; list-style:disc;">' +
      '<li>Red → Overdue</li>' +
      '<li>Green → Due Today</li>' +
      '<li>Blue → Due in Future</li>' + 
    '</ul>'
    ,
  },
  case_file_priority: {
    title: 'Case File Priority',
    body:'<p>Casefiles are grouped by priority and indicated by colour. </p>' +
        '<p>The highest priority colour group is at the top.</p>' +
        '<p>This is not compulsory and will only be displayed if set up for this product.</p>'
    ,
  },
    tagged_for_field: {
    title: 'Tagged For Field',
    body:'<p>This field indicates the user that the specific reminder is tagged for. </p>' +
        '<p>Your team can decide how and when to override the tagged person and action on this reminder .</p>'
    ,
  },
    action_buttons: {
    title: 'Action Buttons',
    body:'<p>The 3 actions are:</p>' +
      '<ul style="margin:8px 0 0 16px; list-style:disc;">' +
      '<li>Open Case → Open the case file Mangement screen </li>' +
      '<li>Reminder Settings → Change the Due date or snooze the reminder and update its status</li>' +
      '<li>Note→ Notes created here are linked to the specific reminders.  It will always be visible here and is also shown in the Top Notes on the Case File Management screen and the Time Line.</li>' + 
    '</ul>'
    ,
  },

        

  // --- MATTER WORKSPACE & HEADERS ---

  // --- Subscriber Admin ---
  system_roles_optional: {
    title: 'System Roles (Optional)',
    body: 'System roles allow users to access specific functions. "Field Operator" and "WLP Member" apply only to certain setups. If unsure if it applies to you -> ignore them.',
  },

  // --- REGISTRY & DASHBOARD ---
  workspace_context: {
    title: 'Active Commercial Product',
    body: 'Everything displayed is strictly scoped to this commercial solution. You can switch between licensed operational products in the top bar.',
  },
  case_registry: {
    title: 'Operational Case Registry',
    body: 'Index of all active Case Files. Every vehicle, driver, patient or client exists as a dedicated case file containing its complete history.',
  },
  workflow_milestones: {
    title: 'SOP Milestones Progress',
    body: 'Color-coded progress indicators. As steps and checklists are verified inside the case, progress updates across all niches automatically.',
  },
  team_clearance: {
    title: 'POPIA Team Data Fencing',
    body: 'Enforces Section 21 data isolation. Functional teams can edit assigned tabs, Audit teams inspect without mutating, and Ownership teams manage the matter.',
  },
  pulse_exceptions: {
    title: 'Operational Exceptions (Pulse)',
    body: 'Flags safety-critical defects and pre-trip inspection failures. Grounded assets remain locked until a manager conducts a corrective CAPA sign-off.',
  },
  reminders: {
    title: 'Daily Action Alarm Hub',
    body: 'Your compliance radar. Automatically lists upcoming document expiries, overdue workflow milestones, and assigned operational reminders.',
  },
};

// Also export as default so either import style works:
export default helpSnippets;