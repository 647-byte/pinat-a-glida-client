/**
 * @file Requests to the /orders endpoints. Every request sends the
 * signed-in user's token, since all order routes are protected.
 */
import { handleResponse } from './apiClient.js';
import { getAuthHeaders } from './authService.js';
import { SERVER_URL } from '../config.js';

const URL = SERVER_URL + '/orders';

/**
 * Fetches all orders (admin only).
 * @returns {Promise<Array<Object>>} All orders.
 */
const getAllOrders = async () => {
    const response = await fetch(URL, { headers: getAuthHeaders() });
    return await handleResponse(response);
};

/**
 * Fetches one order. Customers can fetch only their own orders.
 * @param {string} id - Order id.
 * @returns {Promise<Object>} The order.
 */
const getOrderById = async (id) => {
    const response = await fetch(`${URL}/${id}`, { headers: getAuthHeaders() });
    return await handleResponse(response);
};

/**
 * Fetches the orders of a given user (admin only).
 * @param {string} userId - User id.
 * @returns {Promise<Array<Object>>} The user's orders.
 */
const getUserOrders = async (userId) => {
    const response = await fetch(`${URL}/user/${userId}`, { headers: getAuthHeaders() });
    return await handleResponse(response);
};

/**
 * Places an order for the signed-in customer. The server sets the user
 * from the token and calculates all prices.
 * @param {{ items: Array<Object>, customerDetails: Object, comments?: string }} orderData - Order body.
 * @returns {Promise<Object>} The created order, including the final totalPrice.
 */
const createOrder = async (orderData) => {
    const response = await fetch(URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(orderData)
    });
    return await handleResponse(response);
};

/**
 * Updates an order's status (admin only).
 * @param {string} id - Order id.
 * @param {string} statusOrder - New status: pending, preparing, on_the_way or delivered.
 * @returns {Promise<Object>} The updated order.
 */
const updateOrderStatus = async (id, statusOrder) => {
    const response = await fetch(`${URL}/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ statusOrder })
    });
    return await handleResponse(response);
};

/**
 * Fetches the signed-in customer's own orders.
 * @returns {Promise<Array<Object>>} The customer's orders.
 */
const getMyOrders = async () => {
    const response = await fetch(`${URL}/my`, { headers: getAuthHeaders() });
    return await handleResponse(response);
};

export { getAllOrders, getOrderById, getUserOrders, getMyOrders, createOrder, updateOrderStatus };