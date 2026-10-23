import { getUser, logout, SITE_HOME_URL } from '../../services/authService.js';
/**
 * Resolves a path relative to this file (Admin/JS/admin-header.js), so the
 * links work from every admin page.
 * @param {string} path - Path relative to the Admin/JS folder.
 * @returns {string} Absolute URL.
 */
const adminPath = (path) => new URL(path, import.meta.url).href;

/** Admin navigation links: label and page file name in Admin/HTML. */
const NAV_ITEMS = [
    { text: 'ראשי', page: 'index.html' },
    { text: 'ניהול הזמנות', page: 'admin-orders.html' },
    { text: 'ניהול מוצרים', page: 'admin-products.html' },
    { text: 'ניהול משתמשים', page: 'admin-users.html' }
];
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
/**
 * Builds the main admin navigation: logo (to the dashboard), page links
 * with the current page highlighted, and the add-product button.
 * @returns {HTMLElement} The nav element.
 */
const createAdminMainNav = () => {
    const mainNav = document.createElement('nav');
    mainNav.className = 'admin-main-nav';
    // לוגו פאנל הניהול
    const linkLogo = document.createElement('a');
    linkLogo.className = 'logo-link';
    linkLogo.href = adminPath('../HTML/index.html');
    const logoImg = document.createElement('img');
    logoImg.src = adminPath('../../assets/images/pinata-logo3.png');
    logoImg.alt = 'פינת הגלידה - ניהול';
    logoImg.className = 'header-logo';
    linkLogo.append(logoImg);
    // רשימת קישורי הניווט הראשיים
    const navList = document.createElement('ul');
    navList.className = 'nav-list';
    // זיהוי עמוד נוכחי לצורך הדגשת הקישור הפעיל
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    NAV_ITEMS.forEach(({ text, page }) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.textContent = text;
        a.href = adminPath(`../HTML/${page}`);
        if (currentPage === page) {
            a.className = 'active';
            a.setAttribute('aria-current', 'page');
        }
        li.appendChild(a);
        navList.appendChild(li);
    });
    // כפתור פעולה מהירה בולט
    const addProductBtn = document.createElement('a');
    addProductBtn.href = adminPath('../HTML/admin-add-product.html');
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