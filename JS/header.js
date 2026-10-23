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
const sitePath = (path) => new URL(path, import.meta.url).href;
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
    linkLogo.href = sitePath('../index.html');
    const logoImg = document.createElement('img');
    logoImg.src = sitePath('../assets/images/pinata-logo3.png');
    logoImg.alt = 'פינת הגלידה';
    logoImg.className = 'header-logo';
    linkLogo.append(logoImg);
    const navList = document.createElement('ul');
    navList.className = 'nav-list';
    const navItems = [
        { text: 'בית', href: '../index.html' },
        { text: 'תפריט', href: '../HTML/menu.html' },
        { text: 'אודות', href: '../HTML/about.html' },
        { text: 'סניפים', href: '../HTML/branches.html' },
        { text: 'אירועים', href: '../HTML/events.html' },
        { text: 'צור קשר', href: '../HTML/contact.html' }
    ];
    navItems.forEach(item => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.textContent = item.text;
        a.href = sitePath(item.href);
        li.appendChild(a);
        navList.appendChild(li);
    });
    const orderButton = document.createElement('a');
    orderButton.href = sitePath('../HTML/menu.html');
    orderButton.className = 'btn-order';
    orderButton.textContent = 'הזמנה אונליין';
    mainNav.append(linkLogo, navList, orderButton);
    return mainNav;
};
const createHeader = () => {
    const header = document.createElement('header');
    header.className = 'site-header'
    const topBar = createTopBar();
    const mainNav = createMainNav();
    header.append(topBar, mainNav);
    // prepend מכניסה את האלמנט המבוקש הכי בתחילת ההורה
    document.body.prepend(header);
}
export default createHeader;