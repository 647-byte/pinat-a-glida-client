/**
 * @file Requests to the /users endpoints that manage user data:
 * the signed-in user's own profile (/users/me) and, for admins,
 * listing, viewing, deleting and changing the role of users.
 * Signing in and up is handled by authService.
 */
import { handleResponse } from './apiClient.js';
import { getAuthHeaders, saveUser } from './authService.js';
import { SERVER_URL } from '../config.js';

const URL = `${SERVER_URL}/users`;
const ME_URL = `${URL}/me`;

/* ---------- Own profile ---------- */

/**
 * Fetches the signed-in user's profile from the server.
 * @returns {Promise<Object>} The user.
 */
const getMe = async () => {
    const response = await fetch(ME_URL, { headers: getAuthHeaders() });
    return await handleResponse(response);
};

/**
 * Updates the signed-in user's profile and refreshes the stored copy,
 * so the rest of the site (e.g. checkout prefill) shows the new details.
 * @param {{ name?: string, phone?: string }} changes - Fields to update.
 * @returns {Promise<Object>} The updated user.
 */
const updateMe = async (changes) => {
    const response = await fetch(ME_URL, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(changes)
    });
    const user = await handleResponse(response);
    saveUser(user);
    return user;
};

/* ---------- User management (admin only) ---------- */

/**
 * Fetches all users (admin only).
 * @returns {Promise<Array<Object>>} All users, without passwords.
 */
const getAllUsers = async () => {
    const response = await fetch(URL, { headers: getAuthHeaders() });
    return await handleResponse(response);
};

/**
 * Fetches one user (admin only).
 * @param {string} id - User id.
 * @returns {Promise<Object>} The user.
 */
const getUserById = async (id) => {
    const response = await fetch(`${URL}/${id}`, { headers: getAuthHeaders() });
    return await handleResponse(response);
};

/**
 * Deletes a user (admin only). The server refuses to delete the signed-in admin.
 * @param {string} id - User id.
 * @returns {Promise<Object>} The deleted user.
 */
const deleteUser = async (id) => {
    const response = await fetch(`${URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    return await handleResponse(response);
};

/**
 * Changes a user's role (admin only). The server refuses to change the
 * signed-in admin's own role.
 * @param {string} id - User id.
 * @param {'customer'|'admin'} role - The new role.
 * @returns {Promise<Object>} The updated user.
 */
const changeRole = async (id, role) => {
    const response = await fetch(`${URL}/${id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ role })
    });
    return await handleResponse(response);
};

export { getMe, updateMe, getAllUsers, getUserById, deleteUser, changeRole };