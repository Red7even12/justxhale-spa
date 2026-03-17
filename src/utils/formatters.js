// frontend-spa/src/utils/formatters.js

/**
 * Safely parses a date string, ensuring Laravel's raw UTC timestamps 
 * are correctly interpreted as UTC before JavaScript converts them to local time.
 * 
 * @param {string} dateString 
 * @returns {Date|null}
 */
const parseLaravelDate = (dateString) => {
  if (!dateString) return null;
  
  let ds = String(dateString).trim();

  // If the string is in a standard "SQL" format without timezone info,
  // we assume it is UTC as per backend convention.
  // Match: "YYYY-MM-DD HH:mm:ss" or "YYYY-MM-DDTHH:mm:ss" 
  // without 'Z' or '+02:00' etc.
  if (!ds.includes('Z') && !/[+-]\d{2}(?::?\d{2})?$/.test(ds)) {
    // Standardize to ISO by replacing space with 'T' if present
    ds = ds.replace(' ', 'T');
    // Force UTC interpretation by appending 'Z'
    ds += 'Z';
  } 
  // If it's just a raw date (YYYY-MM-DD), assume midnight UTC
  else if (/^\d{4}-\d{2}-\d{2}$/.test(ds)) {
    ds = ds + 'T00:00:00Z';
  }

  const date = new Date(ds);
  return isNaN(date.getTime()) ? null : date;
};

/**
 * Formats an ISO date string to yyyy-MM-dd format.
 * Correctly shifts to the user's local timezone.
 * 
 * @param {string | null | undefined} dateString The date string to format.
 * @returns {string} e.g. "2026-03-16"
 */
export function formatDate(dateString) {
  const date = parseLaravelDate(dateString);
  if (!date) return '';

  try {
    // JavaScript Date methods (getFullYear, getDate, etc.) 
    // ALWAYS return the value in the user's local timezone.
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Could not format date:", dateString, error);
    return '';
  }
}

/**
 * Formats an ISO date string to include the Date and Time in the User's Local Timezone.
 * Guaranteed YYYY-MM-DD HH:mm format for international compatibility.
 * 
 * @param {string | null | undefined} dateString The date string to format.
 * @returns {string} e.g., "2026-03-16 07:33"
 */
export function formatDateTime(dateString) {
  const date = parseLaravelDate(dateString);
  if (!date) return '';

  try {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch (error) {
    console.error("Could not format datetime:", dateString, error);
    return '';
  }
}
