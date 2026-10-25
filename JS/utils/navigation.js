/**
 * Creates a navigation list item (`<li>`) containing a link (`<a>`) with the given text and href.
 * If no href is provided, it defaults to '#' and prevents the default click behavior.
 * 
 * @function createNavItem
 * @param {Object} item - The navigation item configuration object.
 * @param {string} item.text - The display text of the link.
 * @param {string} [item.href] - The destination URL or path for the link.
 * @param {Function} sitePath - A helper function used to resolve the absolute/relative path of the href.
 * @returns {HTMLElement} The constructed `<li>` element representing the navigation item.
 */
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