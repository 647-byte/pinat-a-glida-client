import {createNavItem} from './utils/navigation.js';
import listenForSiteClosed from './components/closedNotice.js';
import { isLoggedIn, isAdmin } from '../services/authService.js';
/**
 * Creates the top informational bar element containing contact details, operating hours, and kashrut information.
 * 
 * @function createTopBar
 * @returns {HTMLElement} The constructed `<div>` element representing the top bar.
 */
const createTopBar = () => {
    const topBar = document.createElement('div');
    topBar.className = 'top-bar';
    const topBarRight = document.createElement('div');
    topBarRight.className = 'top-bar-right';
    const phoneSpan = document.createElement('span');
    phoneSpan.textContent = '073-8500597';
    const hoursSpan = document.createElement('span');
    hoursSpan.textContent = 'ראשון–חמישי 10:00–22:00';
    topBarRight.append(phoneSpan, hoursSpan);
    const topBarLeft = document.createElement('div');
    topBarLeft.className = 'top-bar-left';
    const kosherSpan = document.createElement('span');
    kosherSpan.textContent = 'כל המוצרים בהשגחת הרב לנדא';
    topBarLeft.append(kosherSpan);
    topBar.append(topBarRight, topBarLeft);
    return topBar;
}
/**
 * Resolves a site path relative to this file (JS/header.js), so header
 * links work from any page, whether it lives in the root or in HTML/.
 * @param {string} path - Path relative to the JS folder, e.g. '../HTML/menu.html'.
 * @returns {string} Absolute URL.
 */
const SITE_ROOT = new URL('../', import.meta.url);
const sitePath = (path) => new URL(path, SITE_ROOT).href;
/**
 * Builds the account link, which depends on the role in the token:
 * "login / register" for guests, the admin dashboard for admins, and the
 * account page for customers.
 * @returns {HTMLAnchorElement} The account link.
 */
const createAccountLink = () => {
    const link = document.createElement('a');
    link.className = 'account-link';
    if (isAdmin()) {
        link.textContent = '⚙️ ניהול';
        link.href = sitePath('Admin/HTML/index.html');
    } else if (isLoggedIn()) {
        link.textContent = '👤 האזור האישי';
        link.href = sitePath('HTML/account.html');
    } else {
        link.textContent = 'התחברות / הרשמה';
        link.href = sitePath('HTML/login.html');
    }
    return link;
};
/**
 * Builds the main navigation bar: logo, page links and the online order button.
 * All links are resolved with sitePath, so they work from every page.
 * @returns {HTMLElement} The nav element.
 */
const createMainNav = () => {
    const mainNav = document.createElement('nav');
    mainNav.className = 'main-nav';
    const linkLogo = document.createElement('a');
    linkLogo.className = 'logo-link';
    linkLogo.href = sitePath('index.html');
    const logoImg = document.createElement('img');
    logoImg.src = sitePath('assets/images/pinata-logo3.png');
    logoImg.alt = 'פינת הגלידה';
    logoImg.className = 'header-logo';
    linkLogo.append(logoImg);
    const navList = document.createElement('ul');
    navList.className = 'nav-list';
    const navItems = [
        { text: 'בית', href: 'index.html' },
        { text: 'תפריט', href: 'HTML/menu.html' },
        { text: 'אודות', href: 'HTML/about.html' },
        { text: 'סניפים', href: 'index.html#branches-section' },
        { text: 'אירועים', href: '' },
        { text: 'צור קשר', href: '' }
    ];
    navItems.forEach(item => navList.appendChild(createNavItem(item, sitePath)));
    const orderButton = document.createElement('a');
    orderButton.href = sitePath('HTML/menu.html');
    orderButton.className = 'btn-order';
    orderButton.textContent = 'הזמנה אונליין';
    mainNav.append(linkLogo, navList, createAccountLink(), orderButton);
    return mainNav;
};
/**
 * Adds the site header to the top of the page and starts listening for
 * the site-closed event, so every page that has a header reacts to it.
 * 
 * @function createHeader
 * @returns {void}
 */
const createHeader = () => {
    const header = document.createElement('header');
    header.className = 'site-header';
    const topBar = createTopBar();
    const mainNav = createMainNav();
    header.append(topBar, mainNav);
    // prepend מכניסה את האלמנט המבוקש הכי בתחילת ההורה
    document.body.prepend(header);
    listenForSiteClosed();
};
export default createHeader;