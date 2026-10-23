/**
 * @file Requests for the signed-in user's own profile (/users/me).
 */
import { handleResponse } from './apiClient.js';
import { getAuthHeaders, saveUser } from './authService.js';
import { SERVER_URL } from '../config.js';

const URL = `${SERVER_URL}/users/me`;

/**
 * Returns the user object from a response that may wrap it as { user }.
 * @param {Object} data - Parsed response body.
 * @returns {Object} The user.
 */
const unwrapUser = (data) => data.user ?? data;

/**
 * Fetches the signed-in user's profile from the server.
 * @returns {Promise<Object>} The user.
 */
const getMe = async () => {
    const response = await fetch(URL, { headers: getAuthHeaders() });
    return unwrapUser(await handleResponse(response));
};

/**
 * Updates the signed-in user's profile and refreshes the stored copy,
 * so the rest of the site (e.g. checkout prefill) shows the new details.
 * @param {{ name?: string, phone?: string }} changes - Fields to update.
 * @returns {Promise<Object>} The updated user.
 */
const updateMe = async (changes) => {
    const response = await fetch(URL, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(changes)
    });
    const user = unwrapUser(await handleResponse(response));
    saveUser(user);
    return user;
};

export { getMe, updateMe };