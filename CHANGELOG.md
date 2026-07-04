## [2.1.0] - 2026-05-17
### Added
Updated Audit trails

### Changed
DB table changed loggable_id to varchar from int to store text references e.g. UUID

### Fixed
Create New Case File logic that broke due to audit logs

## [2.1.1] - 2026-05-18
### Added
- None

### Changed
- None

### Fixed
- None

## [2.1.2] - 2026-05-19
### Added
- Display Version number on Layout templates

### Changed
- Filter by Participant and Note Reference Number in Case file index
- Sorting on Index table in CaseIndex.vue

### Fixed
- Resolved bug on Manage Reminder on Reminders Index: "Failed to load task details."
- Save Reference number correctly on Notes  

## [2.1.3] - 2026-05-20
### Added
- Local document path handling on Case File documents modal

### Changed
- 

### Fixed
- 

## [2.1.4] - 2026-05-24
### Added
- Admin Button added on ProductLayout.vue.  Reports main node button added.

### Changed
- Changed layout on Case File manage screen to see Quickview above the Timeline view.
    1. Created CaseTimeline.vue Component:
       * Extracted the core timeline logic, filters, and export functionality from the original report view into a new reusable component located at @frontend-spa/src/components/cases/CaseTimeline.vue.
       * Added support for props (caseId, caseFile) and emitted events (close) to make it easily embeddable.
       * Cleaned up styling to ensure it works well both as a standalone card and as a full-page report.

   2. Updated CaseWorkspaceHeader.vue:
       * Integrated the new CaseTimeline component to display directly below the CaseQuickViewHeader.
       * Refactored the "Timeline" button to toggle the embedded timeline view instead of navigating to a new page.
       * Added visual feedback to the Timeline button (primary color background when active) so it's clear when the timeline is open.
       * The Quickview identity and metadata remain fully visible at the top while you scroll through the timeline events below.

   3. Refactored CaseTimelineReport.vue:
       * Updated the original full-screen report view to use the new CaseTimeline component. This maintains the existing route for deep-linking or dedicated printing while ensuring both views share the same logic (DRY).
       
- Changed Menu Item labels:  Dashboard => Reminders;  Registry => People

-    1. Defined isPrimarySearchActive:
       * Added a computed property in CaseIndex.vue that returns true if either the "Search Participant" or "External Reference" filters are active.
       * This property is used in the template to visually disable standard filters (Status, Niche, Team) when an identity-based search is being performed, as these are handled as primary searches.

   2. Updated handleSearchInput:
       * Modified the function to accept a type argument, matching the calls made in the template (e.g., @input="handleSearchInput('general')"). This prevents potential runtime issues where the template was passing arguments to a function that
         expected none.

- Changed Indigo to Brand Colours on Edit Case file Screen. 

### Fixed
- Casenumbers now display on Notes
 1. Frontend: CaseTimeline.vue

  • New Filter Input: Added an input field for "Case Number" next to the other filter groups under the filters bar.
  • Reactive Binding: Bound it to a new  caseNumberFilter  reactive reference.
  • Debounced Auto-Search: Added the new filter ref to the watcher array. Typing into the Case Number filter now automatically triggers a debounced API query (after 500ms) to update the list live.
  • CSV Export & Clearing: Included the filter parameter in the CSV download action and updated the "Clear Filters" button to reset the case number search.

## [2.1.5] - 2026-05-25
### Added
-  Import Roll back function to have option for deep delete to includ Entities. Confirmation modal for deep deletes.

### Changed
- 

### Fixed
- Workflow screen layout to react on template specs.

## [2.1.6] - 2026-05-26
### Added
-  

### Changed
- 

### Fixed
- Role-Key Normalization (The "executor" vs "Executor" Fix) 
	1. The Problem:  Users were entering capitalized roles in Excel. The system’s logic (filtering fields by character context) is case-sensitive and requires lowercase keys to match the database.
	2. The Fix (Backend):  Updated `CaseImportController.php` in both `dryRun` and `commitImport`. We now wrap all incoming role keys in `strtolower(trim())`.
	3. The Fix (Template):  Updated `CaseFileTemplateExport.php` to ensure the Excel dropdown selectors also provide lowercase values.  
	4. Architectural Outcome:  Data is "sanitized on arrival." The database is now guaranteed to store `executor` instead of a mix of casing, preventing logic failures in the character-context engine.

- Strict Match Correction (Edit Modal)
    1. The Problem:  When opening the "Update Participant" modal, the Role dropdown appeared blank even though data existed. This was due to a Javascript syntax error where the normalization logic was only looking at an empty string fallback.
    2.   The Fix:  Corrected the logic in `CaseDetail.vue` by wrapping the data chain in parentheses: `(part.roleKey || part.role_key || '').toLowerCase()`.
    3.    Architectural Outcome:  The UI now correctly "selects" the existing role in the dropdown by ensuring the data loaded from the database exactly matches the options list.


## [2.1.7] - 2026-05-31
### Added
- 

### Changed
- Display on Workflow screen changed to use Tickboxes for Boolean rather than Named buttons - the button naming was not contextually correct in most instances.

### Fixed
- CaseFieldDefinitionIndex.vue flag to only use snake_case.
- Filtering of Document Checklist to exclude inactive document_types
-  **Case-Agnostic Resolution:** Updated the **QuickView Header** with a robust "Deep Search" logic. It now checks for metadata using both snake_case and camelCase conventions, ensuring the UI is resilient to variations in backend JSON serialization on the VPS.

## [2.1.8] - 2026-05-31 11:56
### Added
- 

### Changed
- 

### Fixed
- 405 Not Allowed error on Server after 2.1.7
   1. Internalizing the proxying in the frontend container, removing the dependency on the external **Nginx Proxy Manager (NPM)** being perfectly configured for sub-paths. The Frontend now manages its own API traffic for a Dockerized SPA.
- **"Double-Gated" Architecture**:
    1.  **Gate 1 (NPM):** Handles SSL and the initial split.
    2.  **Gate 2 (Frontend Nginx):** Acts as a safety net to ensure API and Storage requests always find their way home. 

## [3.0.0] - 2026-06-01  
Major update:  Removed V1 Legacy structures
### Added
- RemindersDashboard.vue:
    * Added the "Tagged For" header before the "Status" column.
    * Added the corresponding data cell in the table body.
    * Used robust logic to handle both taggedUser and tagged_user keys, displaying the member's first name in a styled orange badge.
### Changed
- Removed all legacy code of V1 - all objects referring to "estate" that was replaced with the "case file" objects.

### Fixed

## [3.0.1] - 2026-06-01
### Added
- 

### Changed
- Show only active team members on Reminder Tagging
- Show both Firstname and Lastname on tagged reminders in reminder dashboard.

### Fixed

## [3.0.3] - 2026-06-06
### Added
- Update the status of opened Reminder
    1. Implement frontend status dropdown filter options in `RemindersDashboard.vue`
    2. Add date status highlighting class helper in `RemindersDashboard.vue`
    3. Add business status badge helpers in `RemindersDashboard.vue`
    4. Update table cells in `RemindersDashboard.vue` to render styled due dates and statuses
- Workflow visualizer on Superadmin Workflow setup screen.
    1. Parent-to-Child Prop Pipeline: Updated WorkflowBlueprint.vue to explicitly pass down the standard  :product="product"  object into the  WorkflowStepManager  child component.
    2. Double-Insured Title Fallback: Inside WorkflowStepManager.vue, declared the optional  product  prop and added a computed property  formattedProductName  that:
        • Uses  props.product.name  if passed down.
        • Automatically splits and transforms the route's kebab-case  slug  (e.g.  justxhale-co-op  into a beautiful Title Case fallback like  Justxhale Co Op ) if the product object is ever missing, guaranteeing it never breaks.
    3. Pristine Document Title layout: I updated the modal header's title block to dynamically render:
        [Product Name] — [Workflow Definition Name] 
        (e.g., "Justxhale — Standard Estate Liquidation" or "Funeral Co-op — Default Workflow")
    4. SVG Print Decoupling: I added the  no-print  helper class to the indigo flow chart icon in the title, keeping the final printable PDF clean and text-focused.

### Changed
- Show only active team members on Reminder Tagging
- Show both Firstname and Lastname on tagged reminders in reminder dashboard.
- Added Company to the Participant on Quickview bar. 
- Improved Partcicipant Selector on the Modal screen to a dropdown driven by first letter selection filter.
- Applied Participant role sort order to the quick view bar.
- Supply "Company" as part of the select string where you select Participants.
- Added Company to the participant cards above the quick view bar.

### Fixed
-   Repair workflow step sort order.
    1. Refactored the  index()  query to fetch the processes eager-loaded with  workflowStep , and then sort them in-memory by their  sort_order  using the Eloquent Collection  sortBy()  helper.
    2. Chained  ->values()  to guarantee the serialized JSON response is an ordered, zero-indexed list.

## [3.1.0] - 2026-06-11
Sub Major Update:  Reporting layer launched
    ### Added
    - Added is_milestone to workflow steps
    1. Steps Table: Added a new Milestone column that displays a distinct amber badge for steps marked as milestones, making them easy to identify in the list.
    2. Flow Chart Visualization:
        * Card Updates: Added a "Milestone" indicator inside the step cards within the flow visualizer.
        * Legend: Updated the flow chart legend to include a "Milestone Step" entry with its corresponding styling.
        * Data Handling: Ensured the frontend correctly handles both snake_case (`is_milestone) and potential camelCase (isMilestone`) properties from the API.
    - Reporting engine
        The frontend introduces a **two-stage administrative workflow** that decouples data engineering from UI design.
        1 **Stage 1 (View Creator):** A high-density SQL Console for System Admins to deploy relational PostgreSQL views (`rp_`) directly to the VPS. It supports complex joins and JSONB extraction (promoting niche-specific data to first-class columns).
        2 **Stage 2 (Report Builder):** A metadata-driven interface to define user-facing reports. It utilizes dynamic "introspection" to discover columns from any `rp_` view and allows Admins to "tag" columns as dynamic filters or grouping keys.
        3 **Consumption (Viewer & Dashboard):** A generic, high-density table component that renders any report by interpreting JSON metadata, providing subscribers with real-time filtering, grouping, and memory-efficient CSV exports.

    ### Changed

    ### Fixed

## [3.1.2] - 2026-06-11
### Added
- 
### Changed
- Field and Column sort order on Report builder and Report viewer

### Fixed

## [3.1.3] - 2026-06-12
### Added
- 
### Changed
- Default sort order on reports.

### Fixed

## [3.1.4] - 2026-06-14
### Added
- 
### Changed
- Moved Report cluster nodes to Main Menu on ProductBlueprintLayout.vue

## Fixed
- Company Dropdown on entity person create modal now do Dynamic select based on entered letters. 

## [JX-3.1.5] - 2026-06-15
### Added
- New Sync Button to Document Pack Management

### Changed
-

### Fixed
- Repaired Document pack sync triggering when Workflows were synced.

## [JX-3.1.6] - 2026-06-16
### Added
- Dashboard functionality
    1. Super admin dashboard factory
    2. Subscriber Dashboard node under Reporting Menu  

- Delete option on Case file Participant
   1. UI Update: Added a "Delete" button next to the "Edit" button in the "Assigned Entities" table

- Upload facility for indexes on View Factory

### Changed
-

### Fixed
- 

## [JX-3.1.7] - 2026-06-xx
### Added
- 

### Changed
- Widget displays for better UI.
- Added parameters for more flexibility on Gauge Dials

### Fixed
- Dimension dropdown not populating on widgets
- Debugged LocalHost Logo uploads and displays

## [JX-3.1.8] - 2026-06-21
### Added
- 

### Changed
-

### Fixed
- Export to CSV path for Reports from Subscriber Viewer repaired.


## [JX-3.1.9] - 2026-06-21
### Added
- Add in Roll back option for Case file workflow 
    1. Hover "undo" buttons visible on each line once it was actioned. 
- Add in option to deactivate a casefile
    1. Add Deactivate buttpon on Notes capture for Subscriber Admins and Case File Managers.
    2. Adde filter for inactive on Case File Index
    3. Blocked editing of inactive case files while still having access to the timeline for audit purposes. 

### Changed
-

### Fixed
- 

## [JX-3.1.10] - 2026-06-27
### Added
- System admin screens to manage Case File classes.

### Changed
- Use Updated_at on Case file index
- Apply priority sort order to Case files with colour badges in the index and management screens.

### Fixed
- 

## [JX-3.1.11] - 2026-07-04
### Added
- Milestone indicator on Case File Index page
- User Interface & Visibility
    1.  **Real-time Recognition**: High-priority cases now feature distinct color-coded badges and "Glass Pane" styling, ensuring critical files are instantly recognizable during high-volume processing.

### Changed
- 

### Fixed
- 