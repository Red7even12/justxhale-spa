/**
 * Formats a date string to "DD MMM YYYY" (e.g., 21 Mar 1998)
 */
export const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).format(date);
};

/**
 * NEW: Formats a date string to "DD MMM YYYY HH:mm" (e.g., 21 Mar 1998 14:30)
 */
export const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    // Reuse the same date logic
    const d = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).format(date);

    // Add the time part (24-hour format)
    const t = new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).format(date);

    return `${d} ${t}`;
};