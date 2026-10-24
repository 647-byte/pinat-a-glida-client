import {SERVER_URL} from '../../../config.js';
const DEFAULT_IMAGE = '/assets/images/pinata-logo3.png';
const formatDate = (dateString) => {
    if (!dateString) return 'תאריך לא ידוע';
    return new Date(dateString).toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' });
};
const getImageUrl = (url) => {
    if (!url || !url.trim()) return DEFAULT_IMAGE;
    if (url.startsWith('/uploads') || url.startsWith('uploads')) {
        const cleanPath = url.startsWith('/') ? url : `/${url}`;
        return `${SERVER_URL}${cleanPath}`;
    }
    return url;
};
export {formatDate,getImageUrl,DEFAULT_IMAGE}