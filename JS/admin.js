import createHeader from './header.js'
import createFooter from './footer.js';
createHeader();
createFooter();
document.addEventListener('DOMContentLoaded', () => {
    // 1. בדיקה אם המנהל כבר מחובר - אם כן, מעבירים אותו ישירות לדאשבורד
    const token = localStorage.getItem('adminToken');
    if (token) {
        window.location.href = 'admin-dashboard.html';
        return;
    }

    // 2. תפיסת הכפתור והוספת האזנה ללחיצה
    const loginBtn = document.getElementById('admin-login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            window.location.href = 'admin-login.html';
        });
    }
});