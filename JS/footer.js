const createTopBanner = () => {
    const section = document.createElement('section');
    const title = document.createElement('h2');
    title.textContent = 'רוצים להתפנק כבר עכשיו?';
    const subtitle = document.createElement('p');
    subtitle.textContent = 'הזמינו אונליין או מצאו את הסניף הקרוב אליכם';
    const buttonsDiv = document.createElement('div');
    const onlineBtn = document.createElement('a');
    onlineBtn.href = '';
    onlineBtn.textContent = 'הזמנה אונליין';
    const branchBtn = document.createElement('a');
    branchBtn.href = '';
    branchBtn.textContent = 'מצאו סניף קרוב';
    buttonsDiv.append(onlineBtn, branchBtn);
    section.append(title, subtitle, buttonsDiv);
    return section;
};
const createFooterNav = () => {
    const footerMain = document.createElement('div');
    const gridContainer = document.createElement('div');
    const navCol = document.createElement('div');  
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
    const priceNote = document.createElement('span');
    priceNote.textContent = '*המחירים בהזמנות עלולים להיות שונים מהמחירים בחנות';
    const copyright = document.createElement('span');
    copyright.textContent = '© כל הזכויות שמורות לפינתה';
    bottomBar.append(priceNote, copyright);
    return bottomBar;
};
const createFooter = () => {
    const footer = document.createElement('footer');
    const ctaBanner = createTopBanner();
    const footerNav = createFooterNav();
    const footerBottom = createFooterBottom();
    footer.append(ctaBanner, footerNav, footerBottom);
    document.body.append(footer);
};

export default createFooter;