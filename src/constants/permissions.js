export const PERMISSIONS = {
  // Roles
  ROLE_SUBSCRIBER_ADMIN: 'Subscriber Admin',
  ROLE_TEAM_LEADER: 'Team Leader',
  ROLE_CASEFILE_ADMIN: 'Casefile Admin',
  ROLE_SYSTEM_ADMIN: 'System Admin',
  ROLE_TEAM_MEMBER: 'Team Member', 
  ROLE_FIELD_OPERATOR: 'Field Operator',

  // Permissions
  USERS_VIEW: 'view users',
  USERS_CREATE: 'create users',
  USERS_EDIT: 'edit users',
  USERS_DELETE: 'delete users',

  TEAMS_VIEW: 'view teams',
  TEAMS_CREATE: 'create teams',
  TEAMS_EDIT: 'edit teams',
  TEAMS_DELETE: 'delete teams',
  TEAMS_MANAGE_MEMBERS: 'manage team members',

  CASEFILES_VIEW: 'view case files',
  CASEFILES_CREATE: 'create case files',
  CASEFILES_EDIT: 'edit case files',
  CASEFILES_DELETE: 'delete case files',
  CASEFILES_TRANSFER: 'transfer case files',
  
  // Entity Permissions (replaces Company & Contact Permissions)
  ENTITIES_VIEW: 'view entities',
  ENTITIES_CREATE: 'create entities',
  ENTITIES_EDIT: 'edit entities',
  ENTITIES_DEACTIVATE: 'deactivate entities',
  ENTITIES_SHARE: 'share entities',

  // Field Telemetry & Compliance
  FIELD_TELEMETRY_SUBMIT: 'submit field telemetry',
  COMPLIANCE_VIEW_OWN: 'view own compliance profile',
};