// Setup:
// Add to script:  import { useGuidedTour } from '@/composables/useGuidedTour';
// const { startTour } = useGuidedTour(); 
//  Wrap target section in a div with an id, e.g. <div id="tour-workspace-context">...</div>
//  Call startTour() to launch the tour, e.g. onMounted(() => { startTour(); });
//  Add tour element below here in useGuidedTour.js

import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const REGISTRY_TOUR_KEY = 'justxhale_registry_tour_completed';
const CASE_DETAIL_TOUR_KEY = 'justxhale_casedetail_tour_completed';
const REMINDERS_INDEX_TOUR_KEY = 'justxhale_remindersindex_tour_completed';

// 1. TOP-LEVEL CONFIG: Case Index / Registry Tour Steps
const registryTourSteps = [
  {
    element: '#tour-workspace-context',
    popover: {
      title: '1. Your whole product portfolio',
      description:
        'This is where all Case Files in this product are listed. The files are "owned" by various teams and users can only see data allocated to the teams they belong to.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#tour-case-table',
    popover: {
      title: '2. The Operational Registry (Case Files)',
      description:
        'The Index list of all your Case Files.  Using the filters allow you to easily find the Case File you are looking for.  Click on action "View Details" to manage a specific case file.',
      side: 'top',
    },
  },
  {
    element: '#tour-milestone-matrix',
    popover: {
      title: '3. Workflow Milestones',
      description:
        'If there is a workflow for this module, these color-coded markers display real-time SOP progress. When workflow steps are completed inside the file, progress updates automatically.',
      side: 'left',
    },
  },
  {
    element: '#tour-team-clearance',
    popover: {
      title: '4. Teams & Data Security',
      description:
        'JustXhale automatically isolates confidential data tabs. Functional and Audit teams ensure staff only access data they are cleared to inspect.',
      side: 'bottom',
    },
  },
  {
    element: '#tour-create-case-btn',
    popover: {
      title: '5. Start a New Case File',
      description:
        'Click here to launch a Case File. The engine will instantly inject compliance document packs and workflow steps. You can then allocate the file to a team and start working on it.',
      side: 'bottom',
      align: 'end',
    },
  },
];

// 2. TOP-LEVEL CONFIG: Case Workspace / Detail Tour Steps
const caseDetailTourSteps = [
  {
    element: '#tour-case-meta-header',
    popover: {
      title: '1. Case File Reference & Operational State',
      description:
        'Contains the Case File reference, primary operational status and action bar for notes, audit timelines and setup.',
      side: 'bottom',
    },
  },
  {
    element: '#tour-niche-tabs',
    popover: {
      title: '2. Multiple Tabs',
      description:
        'Operational domains (e.g. Health, Competency, Access) often span many different but related child case files. If you see nothing here (!) - then this product has no additional tabs for you...',
      side: 'bottom',
    },
  },
  {
    element: '#tour-pillar-switch',
    popover: {
      title: '3. Pillar Switcher',
      description:
        '<p>Tabs for management areas for each product.</p>' +
        '<p>There will be multiple tabs only when set up for the environment</p>',
      side: 'bottom',
    },
  },
  {
    element: '#tour-checklist-vault',
    popover: {
      title: '4. Automated Compliance',
      description:
        'Required statutory document slots (IDs, Medicals, Permits). Upload files, track expiries, or issue upload requests to participants.',
      side: 'top',
    },
  },
];

// 3. TOP-LEVEL CONFIG: Reminders / Detail Tour Steps
const remindersIndexTourSteps = [
  {
    // No `element` on this welcome step: driver.js v1.8 then falls back to its
    // centred `#driver-dummy-element`, so the popover renders in the middle of
    // the page with no spotlight instead of anchoring to the empty
    // #tour-landing-page spacer (kept in the view for top padding only).
    // NOTE: when the dummy element is used, driver.js forces side to 'over'
    // and centres the popover, so the `side` below is intentionally ignored.
    popover: {
      title: '1. Reminders Landing Page',
      description:
        '<p>This page is your daily task list that drives all operations. It wil start filling up with reminders as you work with your Case Files.</p>' +
        '<p>To start working, go to "Case Files" on the top menu bar.</p>' +
        '<p></p>' +
        '<p class="driver-popover-tip">Tip: Once you have some reminders, run this page tour again to understand colours and indicators.</p>'
    //    '<ul style="margin:8px 0 0 16px; list-style:disc;">' +
    //        '<li>Case File search</li>' +
    //       '<li>Task keyword</li>' +
    //        '<li>Status &amp; date range</li>' +
    //    '</ul>',
            ,
      side: 'top',
    },
  },
  {
    element: '#tour-filter-controls',
    popover: {
      title: '2. Filter Controls',
      description:
        '<p>Use these filters to narrow down the list of reminders based on various criteria.</p>' +
        '<p class="driver-popover-tip">Tip: combine the Case File search with a Status filter for precise results.</p>',
      side: 'bottom',
    },
  },
    {
    element: '#tour-context-help',
    popover: {
      title: '3. Context Help',
      description:
        'Click these Question Mark buttons to get help with specific features or functionality. They are all over the application, so keep an eye out for them.',
      side: 'bottom',
    },
  },
  {
    element: '#tour-action-buttons',
    popover: {
      title: '4. Action Buttons',
      description:
      '<p>The 3 actions are:</p>' +
      '<ul style="margin:8px 0 0 16px; list-style:disc;">' +
      '<li>Open Case → Open the case file Mangement screen </li>' +
      '<li>Edit reminder Icon → Change the due date or snooze the reminder and update its status</li>' +
      '<li>Note Icon → Notes created here are linked to the specific reminder and will be available for readfing here. It is also shown along with all the Case File Notes on the Case File management screen.</li>' + 
    '</ul>',
      side: 'bottom',
    },
  },
];

export function useGuidedTour() {
  /**
   * Helper: Creates a styled Driver.js instance with clean close handling
   */
  const createDriver = (steps, storageKey) => {
    let driverInstance;

    driverInstance = driver({
      showProgress: true,
      animate: true,
      allowClose: true,             // Enables ESC key and backdrop click to close
      overlayColor: '#0f172a',
      overlayOpacity: 0.75,
      nextBtnText: 'Next →',
      prevBtnText: '← Back',
      doneBtnText: 'Got It! 🚀',
      // Steps whose anchor is absent from the current DOM are dropped:
      // driver.js v1.8 substitutes a centred "dummy element" popover with no
      // spotlight, which reads as a broken tour. Filtering keeps this shared
      // step list coherent across the different workspace templates.
      steps: (steps || []).filter(
        (step) => !step.element || typeof step.element !== 'string' || document.querySelector(step.element)
      ),
      // Fired when the 'X' button is clicked:
      onCloseClick: () => {
        localStorage.setItem(storageKey, 'true');
        driverInstance.destroy();
      },
      // Fired when 'Got It!' (done) or ESC key or backdrop is clicked:
      onDestroyed: () => {
        localStorage.setItem(storageKey, 'true');
      },
    });

    return driverInstance;
  };

  // Function now accepts the optional userId to guarantee per-user execution:
  const getStorageKey = (prefix, userId) => {
    return userId ? `${prefix}_${userId}` : prefix;
  };

  /**
   * Starts the Registry / Case Index Tour (CaseIndex.vue)
   */
  const startRegistryTour = (force = false, userId = null) => {
  const key = getStorageKey(REGISTRY_TOUR_KEY, userId);
  const alreadyCompleted = localStorage.getItem(key) === 'true';

  if (force || !alreadyCompleted) {
    setTimeout(() => {
      const d = createDriver(registryTourSteps, key);
      d.drive();
    }, 400);
  }
};

  /**
   * Starts the Deep Case Detail Tour (CaseWorkspaceHeader.vue / CaseDetail.vue)
   */
  const startCaseDetailTour = (force = false, userId = null) => {
    const key = getStorageKey(CASE_DETAIL_TOUR_KEY, userId);
    const alreadyCompleted = localStorage.getItem(key) === 'true';
    if (force || !alreadyCompleted) {
      setTimeout(() => {
        const d = createDriver(caseDetailTourSteps, key);
        d.drive();
      }, 300);
    }
  };

    /**
   * Starts the Reminder Index Tour (RemindersDashboard.vue)
   */
  const startRemindersIndexTour = (force = false, userId = null) => {
    const key = getStorageKey(REMINDERS_INDEX_TOUR_KEY, userId);
    const alreadyCompleted = localStorage.getItem(key) === 'true';
    if (force || !alreadyCompleted) {
      setTimeout(() => {
        const d = createDriver(remindersIndexTourSteps, key);
        d.drive();
      }, 300);
    }
  };

  /**
   * Reset all tour completion states
   */
  const resetTours = () => {
    // Every tour key is suffixed with the user id (see getStorageKey), so a
    // bare removeItem() would leave the per-user flags behind and "reset"
    // would appear to do nothing. Clear the bare and suffixed variants alike.
    const prefixes = [REGISTRY_TOUR_KEY, CASE_DETAIL_TOUR_KEY, REMINDERS_INDEX_TOUR_KEY];
    Object.keys(localStorage)
      .filter((key) => prefixes.some((prefix) => key === prefix || key.startsWith(`${prefix}_`)))
      .forEach((key) => localStorage.removeItem(key));
  };

  return {
    startTour: startRegistryTour, // Backwards compatible alias for CaseIndex.vue
    startRegistryTour,
    startCaseDetailTour,
    startRemindersIndexTour,
    resetTours,
  };

  
}