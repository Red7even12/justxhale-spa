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
