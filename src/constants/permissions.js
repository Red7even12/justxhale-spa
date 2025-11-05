export const PERMISSIONS = {
  // Roles
  ROLE_SUBSCRIBER_ADMIN: 'Subscriber Admin',
  ROLE_TEAM_LEADER: 'Team Leader',
  ROLE_ESTATE_ADMIN: 'Estate Admin',
  ROLE_SYSTEM_ADMIN: 'System Admin',
  ROLE_TEAM_MEMBER: 'Team Member', 

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

  ESTATES_VIEW: 'view estates',
  ESTATES_CREATE: 'create estates',
  ESTATES_EDIT: 'edit estates',
  ESTATES_DELETE: 'delete estates',
  ESTATES_TRANSFER: 'transfer estates',
  
  // --- START: NEW COMPANY & CONTACT PERMISSIONS (The Missing Piece) ---
  COMPANIES_VIEW: 'view companies',
  COMPANIES_CREATE: 'create companies',
  COMPANIES_EDIT: 'edit companies',
  COMPANIES_DEACTIVATE: 'deactivate companies',
  COMPANIES_SHARE: 'share companies',

  CONTACTS_VIEW: 'view contacts',
  CONTACTS_CREATE: 'create contacts',
  CONTACTS_EDIT: 'edit contacts',
  CONTACTS_DEACTIVATE: 'deactivate contacts',
  MANAGE_PRICING_PLANS: 'manage pricing plans',
  RUN_BILLING_CYCLES: 'run billing cycles',
  // --- END: NEW PERMISSIONS ---
};