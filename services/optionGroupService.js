/**
 * @file Requests to the /optionGroup endpoints. Reading option groups is
 * public; creating one requires an admin token.
 */
import { handleResponse } from './apiClient.js';
import { getAuthHeaders } from './authService.js';
import { SERVER_URL } from '../config.js';

const OPTION_GROUPS_URL = `${SERVER_URL}/optionGroup`;

/**
 * Fetches all option groups (e.g. flavors, toppings).
 * @returns {Promise<Array<Object>>} All option groups.
 */
const getOptionGroups = async () => {
    const response = await fetch(OPTION_GROUPS_URL);
    return await handleResponse(response);
};

/**
 * Creates an option group (admin only).
 * @param {Object} groupData - The new group's fields.
 * @returns {Promise<Object>} The created option group.
 */
const addOptionGroup = async (groupData) => {
    const response = await fetch(OPTION_GROUPS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(groupData)
    });
    return await handleResponse(response);
};

export { getOptionGroups, addOptionGroup };