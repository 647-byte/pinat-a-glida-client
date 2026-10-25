/**
 * @file Status messages for admin pages: shows loading, success and error
 * messages in a page's status line, and turns request errors into text.
 * Session and Shabbat errors are handled elsewhere (adminPage.js and the
 * closed notice); these helpers show every other error.
 */
import { ApiError } from '../../../services/apiClient.js';

/** Message shown when the server cannot be reached. */
const CONNECTION_ERROR = 'לא ניתן להתחבר לשרת. נסו שוב מאוחר יותר.';

/**
 * Returns a message to display for a failed request.
 * @param {Error} err - The error thrown by a service.
 * @returns {string} The server's message, or a connection error message.
 */
const getErrorMessage = (err) => (err instanceof ApiError ? err.message : CONNECTION_ERROR);

/**
 * Shows a message in a status element: red for errors, green otherwise.
 * An empty text clears the message.
 * @param {HTMLElement} element - The status element (class "page-status").
 * @param {string} text - The message.
 * @param {boolean} [isError=false] - Whether the message reports an error.
 */
const setStatus = (element, text, isError = false) => {
    element.textContent = text;
    element.classList.toggle('error', isError);
};

/**
 * Shows the message of a failed request, as an error.
 * @param {HTMLElement} element - The status element.
 * @param {Error} err - The error thrown by a service.
 */
const showError = (element, err) => setStatus(element, getErrorMessage(err), true);

export { getErrorMessage, setStatus, showError };