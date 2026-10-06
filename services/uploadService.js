import { handleResponse } from './apiClient.js';
import { SERVER_URL } from '../../config.js';
const URL = SERVER_URL + '/upload';
const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('imageUrl', file); // 'imageUrl' תואם ל-upload.single('imageUrl') בשרת
    const response = await fetch(URL, {
        method: 'POST',
        body: formData // הדפדפן מגדיר את ה-boundary אוטומטית
    });
    return await handleResponse(response);
};
export default uploadImage;