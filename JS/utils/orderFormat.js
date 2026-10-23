/**
 * @file Display helpers for orders, shared by the checkout confirmation
 * and the account page.
 */

/** Hebrew labels of the server's order statuses. */
const STATUS_LABELS = {
    pending: 'ממתינה לאישור',
    preparing: 'בהכנה',
    on_the_way: 'בדרך אליך',
    delivered: 'נמסרה'
};

/**
 * Builds a short, readable order number from the order id.
 * @param {string} id - The order's _id.
 * @returns {string} The last 6 characters, uppercased.
 */
const formatOrderNumber = (id) => String(id).slice(-6).toUpperCase();

/**
 * Translates an order status to Hebrew.
 * @param {string} status - Status from the server.
 * @returns {string} The Hebrew label, or the raw status when unknown.
 */
const formatStatus = (status) => STATUS_LABELS[status] || status;

/**
 * Formats a date for display in Hebrew (e.g. "23.10.2026, 12:30").
 * @param {string} [value] - ISO date string.
 * @returns {string} The formatted date, or an empty string when missing.
 */
const formatDate = (value) =>
    value ? new Date(value).toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' }) : '';

export { formatOrderNumber, formatStatus, formatDate };