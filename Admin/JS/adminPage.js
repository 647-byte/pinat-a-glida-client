/**
 * @file Shared setup for every admin page. Lets only admins view the page,
 * adds the admin header, shows the site-closed notice on Shabbat and
 * holidays, and signs the user out if the server rejects the session or
 * role during the visit.
 */
import createAdminHeader from './admin-header.js';
import listenForSiteClosed from '../../JS/components/closedNotice.js';
import { requireAdmin, logout } from '../../services/authService.js';
import { AUTH_ERROR_EVENT } from '../../services/apiClient.js';

/**
 * Signs the user out and sends them to the login page. Runs when the
 * token expired, or when the user's role was changed after signing in
 * (the server checks the current role in the database, not the token).
 */
const handleAuthError = () => {
    logout();
    requireAdmin();
};

/**
 * Prepares an admin page. Call once, before loading any data.
 * @returns {boolean} True when the user is an admin and the page may load its data.
 */
const initAdminPage = () => {
    if (!requireAdmin()) return false;
    createAdminHeader();
    listenForSiteClosed();
    window.addEventListener(AUTH_ERROR_EVENT, handleAuthError);
    return true;
};

export default initAdminPage;