import { handleResponse } from './apiClient.js';
import { SERVER_URL } from '../../config.js';
const URL = SERVER_URL + '/optionGroup';
const getOptionGroups = async () => {
    const response = await fetch(URL);
    return await handleResponse(response);
};
const addOptionGroup = async (groupData) => {
    const response = await fetch(URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(groupData)
    });
    return await handleResponse(response);
};
export { getOptionGroups, addOptionGroup };