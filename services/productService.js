import { handleResponse } from './apiClient.js';
import { SERVER_URL } from '../../config.js';
const URL=SERVER_URL+'/products';
const getAllProducts = async () => {
    const response = await fetch(URL);
    return await handleResponse(response);
};
// ///-------------לבדוק כשאני אצטרך את זה האם הקוד אכן טוב לי ומתאים
// export const getProductById = async (id) => {
//     const response = await fetch(`${URL}/${id}`);
//     return await handleResponse(response);
// };
// export const addProduct = async (productData) => {
//     const response = await fetch(   URL, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(productData)
//     });
//     return await handleResponse(response);
// };
// export const deleteProduct = async (id) => {
//     const response = await fetch(`${URL}/${id}`, {
//         method: 'DELETE'
//     });
//     return await handleResponse(response);
// };
// export const updateQuantity = async (id, { quantity, isAvailable }) => {
//     const response = await fetch(`${URL}/${id}/quantity`, { // התאימי לנתיב הראוטר המדויק אצלך
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ quantity, isAvailable })
//     });
//     return await handleResponse(response);
// };
export {getAllProducts}