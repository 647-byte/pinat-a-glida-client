import { SERVER_URL } from '../config.js';
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('admin-login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // מניעת רענון של העמוד

        const email = emailInput.value.trim();
        const password = passwordInput.value;
        //כשנגיע לשלב ההתחברות עם הפרויקטים נסדר את אימות זהות המנהל
        // try {
        //     // שליחת בקשת POST ל-API של התחברות המנהל בשרת
        //     const response = await fetch(`${SERVER_URL}/users/login`,{ // עדכני לנתיב ה-API הקיים בשרת שלך
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json'
        //         },
        //         body: JSON.stringify({ email, password })
        //     });

        //     const data = await response.json();

        //     if (response.ok) {
        //         // 1. שמירת הטוקן ופרטי המשתמש ב-localStorage
        //         if (data.token) {
        //             localStorage.setItem('adminToken', data.token);
        //         }
        //         if (data.user) {
        //             localStorage.setItem('adminUser', JSON.stringify(data.user));
        //         }

        //         // 2. מעבר לעמוד לוח הבקרה של המנהל
        //         window.location.href = 'admin-dashboard.html'; // עדכני לנתיב עמוד המנהל שלך
        //     } else {
        //         // 3. טיפול בשגיאה (לדוגמה: משתמש אינו מנהל או פרטים שגויים)
        //         alert(data.message || 'התחברות נכשלה: פרטים שגויים או שאין לך הרשאת מנהל');
        //     }
        // } catch (error) {
        //     console.error('שגיאה בתהליך ההתחברות:', error);
        //     alert('תרחשה שגיאה בתקשורת עם השרת, אנא נסה שנית.');
        // }
    });
});