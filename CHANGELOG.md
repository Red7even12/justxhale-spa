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