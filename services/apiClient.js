/**
 * מחלקת שגיאה מותאמת אישית המייצגת שגיאה שהוחזרה משרת ה-Express
 */
class ApiError extends Error {
    constructor(message, status, type) {
        super(message);
        this.status = status;
        this.type = type;
        this.name = 'ApiError';
    }
}
const handleResponse = async (response) => {
    if (response.ok) {
        return await response.json();
    }
    // 2. חילוץ מבנה השגיאה שהשרת החזיר ({ message, status, type })
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.message || `שגיאת תקשורת מול השרת (${response.status})`;
    const status = errorData.status || response.status;
    const type = errorData.type || 'server_error';
    throw new ApiError(message, status, type);
}
export {ApiError,handleResponse};