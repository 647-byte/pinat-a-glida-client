import { getUser, logout, SITE_HOME_URL } from '../../services/authService.js';
/**
 * Builds the logout button: removes the session and returns to the customer site.
 * @returns {HTMLButtonElement} The logout button.
 */
const createLogoutButton = () => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn-logout';
    button.textContent = '🚪 התנתקות';
    button.addEventListener('click', () => {
        logout();
        window.location.href = SITE_HOME_URL;
    });
    return button;
};

/**
 * Builds the top bar: a greeting with the admin's name, a link that opens
 * the customer site in a new tab, and the logout button.
 * @returns {HTMLDivElement} The top bar.
 */
const createAdminTopBar = () => {
    const topBar = document.createElement('div');
    topBar.className = 'admin-top-bar';
    // צד ימין: חיווי משתמש
    const topBarRight = document.createElement('div');
    topBarRight.className = 'top-bar-right';
    const userSpan = document.createElement('span');
    userSpan.className = 'user-welcome';
    userSpan.textContent = `שלום ${getUser()?.name || 'מנהל מערכת'}`;
    topBarRight.append(userSpan);
    // צד שמאל: מעבר לאתר לקוחות + כפתור התנתקות
    const topBarLeft = document.createElement('div');
    topBarLeft.className = 'top-bar-left';
    const viewSiteLink = document.createElement('a');
    viewSiteLink.href = SITE_HOME_URL;
    viewSiteLink.target = '_blank';
    viewSiteLink.rel = 'noopener';
    viewSiteLink.className = 'btn-view-site';
    viewSiteLink.textContent = 'תצוגת אתר לקוחות';
    topBarLeft.append(viewSiteLink, createLogoutButton());
    topBar.append(topBarRight, topBarLeft);
    return topBar;
};
// 2. יצירת סרגל ניווט מרכזי
const createAdminMainNav = () => {
    const mainNav = document.createElement('nav');
    mainNav.className = 'admin-main-nav';
    // לוגו פאנל הניהול
    const linkLogo = document.createElement('a');
    linkLogo.className = 'logo-link';
    linkLogo.href = '';
    const logoImg = document.createElement('img');
    logoImg.src = '/assets/images/pinata-logo3.png';
    logoImg.alt = 'פינת הגלידה - ניהול';
    logoImg.className = 'header-logo';
    linkLogo.append(logoImg);
    // רשימת קישורי הניווט הראשיים
    const navList = document.createElement('ul');
    navList.className = 'nav-list';
    const navItems = [
        { text: 'ראשי', href: 'index.html' },
        { text: 'ניהול הזמנות', href: 'admin-orders.html' },
        { text: 'ניהול מוצרים', href: 'admin-products.html' }
    ];
    // זיהוי עמוד נוכחי לצורך הדגשת הקישור הפעיל
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    navItems.forEach(item => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.textContent = item.text;
        a.href = item.href;
        if (currentPath === item.href) {
            a.className = 'active';
        }
        li.appendChild(a);
        navList.appendChild(li);
    });
    // כפתור פעולה מהירה בולט (כמו כפתור "הזמנה אונליין" בלקוחות)
    const addProductBtn = document.createElement('a');
    addProductBtn.href = '';
    addProductBtn.className = 'btn-add-product';
    addProductBtn.textContent = '➕ הוספת מוצר';
    mainNav.append(linkLogo, navList, addProductBtn);
    return mainNav;
};
// 3. יצירת ה-Header הכללי והזרקתו לתחילת ה-body
const createAdminHeader = () => {
    const header = document.createElement('header');
    header.className = 'admin-site-header';
    const topBar = createAdminTopBar();
    const mainNav = createAdminMainNav();
    header.append(topBar, mainNav);
    document.body.prepend(header);
};
export default createAdminHeader;