// frontend-spa/src/utils/formatters.js

/**
 * Formats an ISO date string to yyyy-MM-dd format as per SANS 8601.
 * @param {string | null | undefined} dateString The date string to format.
 * @returns {string} The formatted date or an empty string if the input is invalid.
 */
export function formatDate(dateString) {
  if (!dateString) {
    return ''; // Return empty for null or undefined dates
  }

  try {
    const date = new Date(dateString);

    // Get day, month, and year
    // padStart ensures single digits get a leading zero (e.g., 7 -> 07)
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed, so we add 1
    const year = date.getFullYear();

    // Check if the date is valid before returning
    if (isNaN(year)) {
        return '';
    }

    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Could not format date:", dateString, error);
    return ''; // Return empty string on error
  }
}
