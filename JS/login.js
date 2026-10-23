/**
 * @file Login and registration page (HTML/login.html), shared by customers
 * and admins. Field validation is done by HTML attributes; this script
 * submits the forms, shows server errors and, on success, opens the page
 * given in the `redirect` query parameter, or the default page for the
 * user's role (the admin dashboard for admins, the menu for customers).
 */
import createHeader from './header.js';
import createFooter from './footer.js';
import { login, register, getHomeUrl } from '../services/authService.js';
import { ApiError } from '../services/apiClient.js';

createHeader();
createFooter();

/**
 * Page requested in the `redirect` query parameter, or null. Only plain
 * page names in this folder (e.g. "order.html") are accepted, so the
 * parameter cannot send users to another site.
 */
const redirectTarget = (() => {
    const requested = new URLSearchParams(window.location.search).get('redirect');
    return requested && /^[\w-]+\.html$/.test(requested) ? requested : null;
})();

/**
 * Connects a form to an async action: disables the button while waiting,
 * shows the server's error message on failure and redirects on success.
 * @param {HTMLFormElement} form - The form to handle.
 * @param {(values: Object) => Promise<unknown>} action - Receives the form values by input name.
 */
const handleForm = (form, action) => {
    const button = form.querySelector('button[type="submit"]');
    const status = form.querySelector('.form-status');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        button.disabled = true;
        status.textContent = '';
        try {
            await action(Object.fromEntries(new FormData(form)));
            window.location.href = redirectTarget || getHomeUrl();
        } catch (err) {
            status.textContent = err instanceof ApiError ? err.message : 'לא ניתן להתחבר לשרת. נסו שוב מאוחר יותר.';
            button.disabled = false;
        }
    });
};

handleForm(document.getElementById('login-form'), ({ email, password }) => login(email, password));
handleForm(document.getElementById('register-form'), ({ name, email, password, phone }) =>
    register({ name, email, password, ...(phone && { phone }) })
);