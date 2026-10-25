export const createNavItem = (item, sitePath) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.textContent = item.text;
    
    // בדיקה: אם יש כתובת אמיתית משתמשים בה, אם היא ריקה - עוצרים את המעבר
    if (item.href) {
        a.href = sitePath(item.href);
    } else {
        a.href = '#';
        a.addEventListener('click', (e) => e.preventDefault());
    }
    
    li.appendChild(a);
    return li;
};