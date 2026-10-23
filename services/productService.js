/**
 * @file Requests to the /products endpoints. Reading products is public;
 * adding, updating and deleting require an admin token.
 */
import { handleResponse } from './apiClient.js';
import { getAuthHeaders } from './authService.js';
import { SERVER_URL } from '../config.js';

const URL = `${SERVER_URL}/products`;

/**
 * Fetches all products.
 * @returns {Promise<Array<Object>>} All products.
 */
const getAllProducts = async () => {
    const response = await fetch(URL);
    return await handleResponse(response);
};

/**
 * Fetches the popular products shown on the home page.
 * @returns {Promise<Array<Object>>} The popular products.
 */
const getPopularProducts = async () => {
    const response = await fetch(`${URL}/popular`);
    return await handleResponse(response);
};

/**
 * Fetches one product.
 * @param {string} id - Product id.
 * @returns {Promise<Object>} The product.
 */
const getProductById = async (id) => {
    const response = await fetch(`${URL}/${id}`);
    return await handleResponse(response);
};

/**
 * Creates a product (admin only).
 * @param {Object} productData - The new product's fields.
 * @returns {Promise<Object>} The created product.
 */
const addProduct = async (productData) => {
    const response = await fetch(URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(productData)
    });
    return await handleResponse(response);
};

/**
 * Replaces a product's fields (admin only).
 * @param {string} id - Product id.
 * @param {Object} productData - The product's full, updated fields.
 * @returns {Promise<Object>} The updated product.
 */
const updateProduct = async (id, productData) => {
    const response = await fetch(`${URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(productData)
    });
    return await handleResponse(response);
};

/**
 * Deletes a product (admin only).
 * @param {string} id - Product id.
 * @returns {Promise<Object>} The deleted product.
 */
const deleteProduct = async (id) => {
    const response = await fetch(`${URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    return await handleResponse(response);
};

/**
 * Updates a product's stock (admin only).
 * @param {string} id - Product id.
 * @param {{ quantity?: number, isAvailable?: boolean }} stock - New stock values.
 * @returns {Promise<Object>} The updated product.
 */
const updateQuantity = async (id, { quantity, isAvailable }) => {
    const response = await fetch(`${URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ quantity, isAvailable })
    });
    return await handleResponse(response);
};

export { getAllProducts, getPopularProducts, getProductById, addProduct, updateProduct, deleteProduct, updateQuantity };