/**
 * @file Image upload to the /upload endpoint (admin only).
 */
import { handleResponse } from './apiClient.js';
import { getAuthHeaders } from './authService.js';
import { SERVER_URL } from '../config.js';

const UPLOAD_URL = `${SERVER_URL}/upload`;

/**
 * Uploads an image file and returns the server's response with its URL.
 * The Content-Type header is not set here: the browser sets it, including
 * the multipart boundary, when the body is FormData.
 * @param {File} file - The image chosen by the admin.
 * @returns {Promise<Object>} The server response, including the image URL.
 */
const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('imageUrl', file); // Field name must match upload.single('imageUrl') on the server
    const response = await fetch(UPLOAD_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
    });
    return await handleResponse(response);
};

export default uploadImage;