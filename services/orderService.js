import { handleResponse } from './apiClient.js';
import { SERVER_URL } from '../../config.js';
const URL = SERVER_URL + '/orders';
const getAllOrders = async () => {
    const response = await fetch(URL);
    return await handleResponse(response);
};
const getOrderById = async (id) => {
    const response = await fetch(`${URL}/${id}`);
    return await handleResponse(response);
};
const getUserOrders = async (userId) => {
    const response = await fetch(`${URL}/user/${userId}`);
    return await handleResponse(response);
};
const createOrder = async (orderData) => {
    const response = await fetch(URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
    });
    return await handleResponse(response);
};
const updateOrderStatus = async (id, statusOrder) => {
    const response = await fetch(`${URL}/${id}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ statusOrder })
    });
    return await handleResponse(response);
};
export {getAllOrders, getOrderById, getUserOrders, createOrder, updateOrderStatus};