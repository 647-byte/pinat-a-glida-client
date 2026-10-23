/**
 * @file Authentication for customers and admins.
 * Signs users in and up through the /users endpoints, keeps the JWT and the
 * signed-in user in localStorage, reads the user's role from the token,
 * guards pages by login and role, and builds the Authorization header that
 * protected requests need.
 */
import { handleResponse } from './apiClient.js';
import { SERVER_URL } from '../config.js';

const URL = `${SERVER_URL}/users`;
/** localStorage key of the JWT. */
const TOKEN_KEY = 'token';
/** localStorage key of the signed-in user (JSON). */
const USER_KEY = 'user';

/**
 * Stores the session returned by the server after login or registration.
 * @param {{ token: string, user: Object }} session - The server response.
 */
const saveSession = ({ token, user }) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Replaces the stored user, e.g. after a profile update.
 * @param {Object} user - The updated user.
 */
const saveUser = (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Returns the stored JWT.
 * @returns {string|null} The token, or null when signed out.
 */
const getToken = () => localStorage.getItem(TOKEN_KEY);

/**
 * Returns the signed-in user as stored at login time.
 * @returns {Object|null} The user ({ _id, name, email, phone, role }), or null.
 */
const getUser = () => {
    try {
        return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
        return null;
    }
};

/**
 * Decodes the payload of the stored JWT: { id, role, iat, exp }.
 * The payload is readable by anyone and only the server can verify the
 * signature, so the client uses it for display and navigation only.
 * @returns {Object|null} The payload, or null when there is no valid token.
 */
const getTokenPayload = () => {
    const token = getToken();
    if (!token) return null;
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    } catch {
        return null;
    }
};

/**
 * Tells whether a valid, unexpired session is stored. An expired session
 * is removed. The server still validates the token on every request.
 * @returns {boolean} True when the user is signed in.
 */
const isLoggedIn = () => {
    const payload = getTokenPayload();
    if (!payload) return false;
    if (payload.exp && payload.exp * 1000 <= Date.now()) {
        logout();
        return false;
    }
    return true;
};

/**
 * Returns the signed-in user's role, as written in the token by the server.
 * @returns {'customer'|'admin'|null} The role, or null when signed out.
 */
const getRole = () => (isLoggedIn() ? getTokenPayload().role : null);

/**
 * Tells whether the signed-in user is an admin.
 * @returns {boolean} True for admins.
 */
const isAdmin = () => getRole() === 'admin';

/**
 * Builds the Authorization header for protected requests.
 * @returns {Object} `{ Authorization: 'Bearer <token>' }`, or an empty object when signed out.
 */
const getAuthHeaders = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Removes the stored session.
 */
const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

/** Absolute URL of the login page, resolved relative to this module. */
const LOGIN_PAGE_URL = new URL('../HTML/login.html', import.meta.url).href;
/** Absolute URL of the customer site's home page. */
const SITE_HOME_URL = new URL('../index.html', import.meta.url).href;
/** Absolute URL of the menu page, the default page for customers after signing in. */
const MENU_PAGE_URL = new URL('../HTML/menu.html', import.meta.url).href;
/** Absolute URL of the admin dashboard. */
const ADMIN_HOME_URL = new URL('../Admin/HTML/index.html', import.meta.url).href;

/**
 * Guards a page that requires a signed-in user. Guests are sent to the
 * login page, which returns them to the given page after signing in.
 * @param {string} returnPage - File name of the current page, e.g. 'account.html'.
 * @returns {boolean} True when the user is signed in and may stay on the page.
 */
const requireLogin = (returnPage) => {
    if (isLoggedIn()) return true;
    const url = new URL(LOGIN_PAGE_URL);
    url.searchParams.set('redirect', returnPage);
    window.location.replace(url.href);
    return false;
};

/**
 * Guards an admin page. Guests are sent to the login page; signed-in
 * customers are sent to the customer site. This only controls what is
 * displayed: the server rejects admin requests from non-admins anyway.
 * @returns {boolean} True when the user is an admin and may stay on the page.
 */
const requireAdmin = () => {
    if (isAdmin()) return true;
    window.location.replace(isLoggedIn() ? SITE_HOME_URL : LOGIN_PAGE_URL);
    return false;
};

/**
 * Returns the default page for the signed-in user's role: the admin
 * dashboard for admins and the menu for customers.
 * @returns {string} Absolute URL.
 */
const getHomeUrl = () => (isAdmin() ? ADMIN_HOME_URL : MENU_PAGE_URL);

/**
 * Signs in with email and password and stores the session.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<Object>} The signed-in user.
 * @throws {ApiError} When the credentials are wrong or the request fails.
 */
const login = async (email, password) => {
    const response = await fetch(`${URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const session = await handleResponse(response);
    saveSession(session);
    return session.user;
};

/**
 * Creates a customer account and stores the session (the user is signed in).
 * @param {{ name: string, email: string, password: string, phone?: string }} userData - New account details.
 * @returns {Promise<Object>} The new user.
 * @throws {ApiError} When the email is taken, the data is invalid or the request fails.
 */
const register = async (userData) => {
    const response = await fetch(`${URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    const session = await handleResponse(response);
    saveSession(session);
    return session.user;
};

export {
    getToken, getUser, saveUser, getRole, isLoggedIn, isAdmin, getAuthHeaders, logout,
    requireLogin, requireAdmin, getHomeUrl, SITE_HOME_URL, login, register
};