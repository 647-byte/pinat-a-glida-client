import { handleResponse } from './apiClient.js';
import { SERVER_URL } from '../config.js';
const URL=SERVER_URL+'/products';
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
const getProductById = async (id) => {
    const response = await fetch(`${URL}/${id}`);
    return await handleResponse(response);
};
const addProduct = async (productData) => {
    const response = await fetch(URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
    });
    return await handleResponse(response);
};
// עדכון updateProduct
const updateProduct = async (id, productData) => {
    const response = await fetch(`${URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
    });
    return await handleResponse(response);
};
const deleteProduct = async (id) => {
    const response = await fetch(`${URL}/${id}`, {
        method: 'DELETE'
    });
    return await handleResponse(response);
};
const updateQuantity = async (id, { quantity, isAvailable }) => {
    const response = await fetch(`${URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity, isAvailable })
    });
    return await handleResponse(response);
};
export { getAllProducts, getPopularProducts, getProductById, addProduct, updateProduct, deleteProduct, updateQuantity };