const createTopBanner = () => {
    const section = document.createElement('section');
    section.classList.add('footer-cta');
    const title = document.createElement('h2');
    title.textContent = 'רוצים להתפנק כבר עכשיו?';
    const subtitle = document.createElement('p');
    subtitle.textContent = 'הזמינו אונליין או מצאו את הסניף הקרוב אליכם';
    const buttonsDiv = document.createElement('div');
    buttonsDiv.classList.add('cta-buttons');
    const onlineBtn = document.createElement('a');
    onlineBtn.href = '';
    onlineBtn.textContent = 'הזמנה אונליין';
    onlineBtn.classList.add('btn-cta-white');
    const branchBtn = document.createElement('a');
    branchBtn.href = '';
    branchBtn.textContent = 'מצאו סניף קרוב';
    branchBtn.classList.add('btn-cta-outline');
    buttonsDiv.append(onlineBtn, branchBtn);
    section.append(title, subtitle, buttonsDiv);
    return section;
};
const createFooterNav = () => {
    const footerMain = document.createElement('div');
    footerMain.classList.add('footer-main');
    const gridContainer = document.createElement('div');
    gridContainer.classList.add('footer-nav-container');
    const navCol = document.createElement('div');
    navCol.classList.add('footer-col');
    const navTitle = document.createElement('h3');
    navTitle.textContent = 'ניווט מהיר';
    const navList = document.createElement('ul');
    const navItems = [
        { text: 'בית', href: 'index.html' },
        { text: 'תפריט', href: '' },
        { text: 'אודות', href: '' },
        { text: 'סניפים', href: '' },
        { text: 'אירועים', href: '' },
        { text: 'צור קשר', href: '' },
        { text: 'שאלות ותשובות', href: '' }
    ];
    navItems.forEach(item => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.textContent = item.text;
        a.href = item.href;
        li.appendChild(a);
        navList.appendChild(li);
    });
    navCol.append(navTitle, navList)
    const extraCol = document.createElement('div');
    extraCol.classList.add('footer-col');
    const extraTitle = document.createElement('h3');
    extraTitle.textContent = 'עוד באתר';
    const extraList = document.createElement('ul');
    const extraItems = [
        { text: 'זכיינות', href: '' },
        { text: 'דרושים', href: '' },
        { text: 'הצהרת נגישות', href: '' },
        { text: 'תקנון ומדיניות פרטיות', href: '' }
    ];
    extraItems.forEach(item => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.textContent = item.text;
        a.href = item.href;
        li.appendChild(a);
        extraList.appendChild(li);
    });
    extraCol.append(extraTitle, extraList);
    gridContainer.append(navCol, extraCol);
    footerMain.appendChild(gridContainer);

    return footerMain;
};
const createFooterBottom = () => {
    const bottomBar = document.createElement('div');
    bottomBar.classList.add('footer-bottom');
    const container = document.createElement('div');
    container.classList.add('footer-bottom-container', 'container');
    const priceNote = document.createElement('span');
    priceNote.classList.add('price-note');
    priceNote.textContent = '*המחירים בהזמנות עלולים להיות שונים מהמחירים בחנות';
    const copyright = document.createElement('span');
    copyright.textContent = '© כל הזכויות שמורות לפינתה';
    copyright.classList.add('copyright');
    const adminLink = document.createElement('a');
    adminLink.href = '/HTML/admin.html';
    adminLink.classList.add('admin-lock-btn');
    adminLink.setAttribute('aria-label', 'כניסת מנהל');

    // 2. יצירת אייקון ה-SVG של המנעול באמצעות createElementNS
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');

    const rect = document.createElementNS(svgNS, 'rect');
    rect.setAttribute('x', '3');
    rect.setAttribute('y', '11');
    rect.setAttribute('width', '18');
    rect.setAttribute('height', '11');
    rect.setAttribute('rx', '2');
    rect.setAttribute('ry', '2');

    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', 'M7 11V7a5 5 0 0 1 10 0v4');

    svg.append(rect, path);
    adminLink.appendChild(svg);
    container.append(priceNote, copyright, adminLink);
    bottomBar.appendChild(container);
    return bottomBar;
};
const createFooter = () => {
    const footer = document.createElement('footer');
    footer.classList.add('site-footer');
    const ctaBanner = createTopBanner();
    const footerNav = createFooterNav();
    const footerBottom = createFooterBottom();
    footer.append(ctaBanner, footerNav, footerBottom);
    document.body.append(footer);
};

export default createFooter;