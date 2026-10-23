/**
 * @file Shared helpers for talking to the Express server: the ApiError
 * class and handleResponse, which parses every server response.
 */

/** Window event dispatched when the server reports that the site is closed (Shabbat or a holiday). */
const SITE_CLOSED_EVENT = 'site:closed';

/**
 * An error returned by the Express server ({ success: false, type, message }).
 */
class ApiError extends Error {
    /**
     * @param {string} message - Error message from the server (Hebrew, ready to display).
     * @param {number} status - HTTP status code.
     * @param {string} type - Error type from the server, e.g. 'not_activity'.
     */
    constructor(message, status, type) {
        super(message);
        this.status = status;
        this.type = type;
        this.name = 'ApiError';
    }
}

/**
 * Parses a server response. Returns the JSON body on success; otherwise
 * throws an ApiError. When the site is closed, also dispatches
 * SITE_CLOSED_EVENT so the page can replace its content with a notice.
 * @param {Response} response - The fetch response.
 * @returns {Promise<any>} The parsed JSON body.
 * @throws {ApiError} When the response status is not OK.
 */
const handleResponse = async (response) => {
    if (response.ok) {
        return await response.json();
    }
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.message || `שגיאת תקשורת מול השרת (${response.status})`;
    const status = errorData.status || response.status;
    const type = errorData.type || 'server_error';
    if (type === 'not_activity') {
        window.dispatchEvent(new CustomEvent(SITE_CLOSED_EVENT, { detail: { message } }));
    }
    throw new ApiError(message, status, type);
};

export { ApiError, handleResponse, SITE_CLOSED_EVENT };