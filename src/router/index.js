// File: frontend-spa/src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../store/auth';

// --- Import your main layout and views ---
import AppLayout from '../layouts/AppLayout.vue';
import Login from '../views/Login.vue';
import Dashboard from '../views/Dashboard.vue';
import RemindersDashboard from '@/views/RemindersDashboard.vue';
import EstatesIndex from '../views/estates/EstatesIndex.vue'; 
import TeamIndex from '../views/admin/TeamIndex.vue';
import Administration from '../views/Administration.vue';
import SubscriberIndex from '../views/admin/subscribers/SubscriberIndex.vue';
import UserIndex from '../views/admin/UserIndex.vue'; 
import EstateEditor from '../views/estates/EstateEditor.vue'; 
import EstateForm from '../views/estates/EstateForm.vue'; // This might eventually be renamed to EstateCreateForm.vue or similar
import DocumentTypeManager from '@/views/admin/DocumentTypeManager.vue';
import CompanyIndex from '@/views/clients/CompanyIndex.vue';
import CompanyForm from '@/views/clients/CompanyForm.vue';
import SetPassword from '../views/SetPassword.vue';
import ForgotPassword from '@/views/ForgotPassword.vue';
import ResetPassword from '@/views/ResetPassword.vue';



const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/set-password/:token', 
    name: 'SetPassword',
    component: SetPassword,
  },
    // --- Password management routes ---
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword,
  },
  {
    path: '/reset-password/:token',
    name: 'ResetPassword',
    component: ResetPassword,
  },
  // ------
  {
    // All authenticated routes will live inside this path
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
    {
        path: '/',
        name: 'Dashboard', // Making this the new home page
        component: RemindersDashboard,
        meta: { requiresAuth: true, displayName: 'Reminders' }
      },
      // --- START: ESTATE ROUTES ---
      { 
          path: 'estates', 
          name: 'estates.index',
          component: EstatesIndex,
          meta: { displayName: 'Estates' }
      },
      {
          path: 'estates/create',
          name: 'estates.create', // This is for the "Add Estate" button
          component: EstateForm,   // It should load the simple form
          meta: { displayName: 'Create Estate' }
      },
      {
          path: 'estates/:id',
          name: 'estates.edit',     // This is the main "Control Panel" dashboard
          component: EstateEditor,
          props: true,
          meta: { displayName: 'Estate Details' }
      },
      {
          path: 'estates/:id/edit-data', // A distinct path for the editing form
          name: 'estates.form.edit',
          component: EstateForm,
          props: true,
          meta: { displayName: 'Edit Estate Data' }
      },
      // --- END: ESTATE ROUTES ---

      // --- START: COMPANY/CONTACT ROUTES ---
      {
        path: 'companies',
        name: 'companies.index',
        component: CompanyIndex,
        meta: { permission: 'view companies', displayName: 'Companies' },
      },
      {
        path: 'companies/create',
        name: 'companies.create',
        component: CompanyForm,
        meta: { permission: 'create companies', displayName: 'Create Client' },
      },
      {
        path: 'companies/:id/edit',
        name: 'companies.edit',
        component: CompanyForm,
        props: true, 
        meta: { permission: 'edit companies', displayName: 'Edit Client' },
      },
      // --- END: COMPANY/CONTACT ROUTES ---

      {
        path: 'admin/teams',
        name: 'AdminTeams',
        component: TeamIndex,
        meta: { displayName: 'Team Management' }
      },
      {
        path: 'admin/users',
        name: 'AdminUsers',
        component: UserIndex,
        meta: { displayName: 'User Management' }
      },
      {
        path: 'administration',
        name: 'Administration',
        component: Administration,
        meta: { displayName: 'Administration' }
      },
      {
        path: 'admin/subscribers',
        name: 'AdminSubscribers',
        component: SubscriberIndex,
        meta: { displayName: 'Subscribers' }
      },
      {
        path: 'admin/workflow-management',
        name: 'admin.workflows',
        component: () => import('@/views/admin/workflows/WorkflowIndex.vue'),
        meta: { displayName: 'Workflow Management' }
        // meta: { permission: 'manage workflows' } // Optional: Add permission check
      }, 
      {
        path: 'admin/document-management',
        name: 'admin.documents',
        component: DocumentTypeManager,
        meta: { requiresAuth: true, isAdmin: true, displayName: 'Document Management' } // Or your equivalent admin protection
      },
      {
        path: 'admin/option-lists',
        name: 'admin.option-lists',
        component: () => import('@/views/admin/OptionListsManager.vue'),
        meta: { requiresAuth: true, isAdmin: true, displayName: 'Option Lists' }
      },
      {
        path: '/admin/non-working-days',
        name: 'admin.non-working-days',
        component: () => import('@/views/admin/NonWorkingDays.vue'),
        meta: { requiresAuth: true, isAdmin: true, displayName: 'Non-Working Days' }
      },    
      {
        path: 'estates/:id/timeline',
        name: 'estates.timeline',
        component: () => import('@/views/reports/EstateTimelineReport.vue'),
        props: true, // This passes the :id from the URL as a prop to the component
        meta: { requiresAuth: true, displayName: 'Estate Timeline' }
      }, 
      {
        path: 'estates/:id/case-numbers',
        name: 'estates.case-numbers',
        component: () => import('@/views/estates/EstateCaseNumbersReport.vue'),
        props: true,
        meta: { requiresAuth: true, displayName: 'Estate Case Numbers' }
      },
      {
        path: '/search',
        name: 'search.results',
        component: () => import('@/views/SearchResults.vue'),
        meta: { requiresAuth: true, displayName: 'Search Results' }
      },

      // --- Billing routes  // 
      {
          path: '/admin/billing',
          name: 'admin-billing',
          component: () => import('@/views/admin/BillingDashboard.vue'),
          meta: { requiresAuth: true, permission: 'run billing cycles' } // Use your permission enum
      },
      {
          path: '/admin/pricing-plans',
          name: 'admin-pricing-plans',
          component: () => import('@/views/admin/PricingPlanManager.vue'), 
          meta: { requiresAuth: true, permission: 'manage pricing plans' }
      },
      {
          path: '/admin/invoices',
          name: 'admin-invoices',
          component: () => import('@/views/admin/InvoiceList.vue'),
          meta: { requiresAuth: true, permission: 'view invoices' }
      }, 

      // --- Subscriber Management routes  // 
      {
        path: '/admin/subscribers',
        name: 'admin-subscribers',
        component: () => import('@/views/admin/subscribers/SubscriberIndex.vue'),
        meta: { requiresAuth: true, permission: 'view subscribers' } // Add appropriate permission
      },
      {
        path: '/admin/subscribers/create',
        name: 'admin-subscribers-create',
        component: () => import('@/views/admin/subscribers/Create.vue'),
        meta: { requiresAuth: true, permission: 'edit subscribers' } // Or a 'create' permission
      },
      {
        path: '/admin/subscribers/:id/edit',
        name: 'admin-subscribers-edit',
        component: () => import('@/views/admin/subscribers/Edit.vue'),
        meta: { requiresAuth: true, permission: 'edit subscribers' }
      },
      /// --- Business Users routes  // 
      {
        path: '/admin/core-users',
        name: 'AdminUserManagement',
        component: () => import('@/views/admin/AdminUserManagement.vue'),
        // This is the navigation guard that protects the route
        beforeEnter: (to, from, next) => {
          const authStore = useAuthStore();
          if (authStore.hasRole('System Admin')) {
            next(); // Allow access
          } else {
            next({ name: 'Dashboard' }); // Or wherever you want to redirect them
          }
        },
      },

      /// --- Users routes  // 
      {
        path: '/my-profile', // Or '/profile', '/account', etc.
        name: 'MyProfile',
        component: () => import('@/views/MyProfile.vue'),
        meta: { 
          requiresAuth: true,
          displayName: 'My Profile' // Optional: for your header
        },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// This navigation guard protects our authenticated routes
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login' });
  } else if (to.name === 'Login' && authStore.isAuthenticated) {
    next({ name: 'Dashboard' });
  } else {
    next();
  }
});

export default router;