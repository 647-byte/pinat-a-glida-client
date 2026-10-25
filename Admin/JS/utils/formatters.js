import {SERVER_URL} from '../../../config.js';
/**
 * Default fallback image path used when product or item images are missing or invalid.
 * @type {string}
 */
const DEFAULT_IMAGE = '/assets/images/pinata-logo3.png';
/**
 * Formats a date string into a localized Hebrew short date and time format.
 * 
 * @function formatDate
 * @param {string|Date} dateString - The date string or object to format.
 * @returns {string} The formatted date and time string, or a default fallback text if invalid.
 */
const formatDate = (dateString) => {
    if (!dateString) return 'תאריך לא ידוע';
    return new Date(dateString).toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' });
};
/**
 * Resolves and returns the full image URL, appending the server URL for uploaded assets 
 * or falling back to a default image if the URL is empty.
 * 
 * @function getImageUrl
 * @param {string} [url] - The relative or absolute image URL.
 * @returns {string} The resolved full image URL.
 */
const getImageUrl = (url) => {
    if (!url || !url.trim()) return DEFAULT_IMAGE;
    if (url.startsWith('/uploads') || url.startsWith('uploads')) {
        const cleanPath = url.startsWith('/') ? url : `/${url}`;
        return `${SERVER_URL}${cleanPath}`;
    }
    return url;
};
export {formatDate,getImageUrl,DEFAULT_IMAGE}