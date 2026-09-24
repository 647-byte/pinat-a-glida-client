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
const createMainNav = () => {
    const mainNav = document.createElement('nav');
    mainNav.className = 'main-nav';
    const linkLogo=document.createElement('a');
    linkLogo.className = 'logo-link';
    const logoImg = document.createElement('img');
    logoImg.src='/assets/images/pinata-logo3.png'
    logoImg.alt = 'פינת הגלידה';
    logoImg.className = 'header-logo';
    linkLogo.append(logoImg);
    linkLogo.href='../index.html';
    const navList = document.createElement('ul');
    navList.className = 'nav-list';
    const navItems = [
        { text: 'בית', href: 'index.html' },
        { text: 'תפריט', href: 'menu.html' },
        { text: 'אודות', href: 'about.html' },
        { text: 'סניפים', href: 'branches.html' },
        { text: 'אירועים', href: 'events.html' },
        { text: 'צור קשר', href: 'contact.html' }
    ];
    navItems.forEach(item => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.textContent = item.text;
        a.href = item.href;
        li.appendChild(a);
        navList.appendChild(li);
    })
    const orderButton = document.createElement('a');
    orderButton.href = 'menu.html';
    orderButton.className = 'btn-order';
    orderButton.textContent = 'הזמנה אונליין';
    mainNav.append(linkLogo, navList, orderButton);
    return mainNav;
}
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