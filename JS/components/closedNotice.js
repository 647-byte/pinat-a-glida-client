/**
 * @file Site-closed notice.
 * When any request reports that the site is closed (Shabbat or a holiday),
 * hides the page content, keeping the header and footer, and shows the
 * server's message instead. The server decides when the site is closed;
 * this component only reacts to its answer.
 */
import { SITE_CLOSED_EVENT } from '../../services/apiClient.js';

/** Absolute URL of the notice's stylesheet. */
const STYLESHEET_URL = new URL('../../CSS/closed-notice.css', import.meta.url).href;

/**
 * Adds the notice's stylesheet to the document, once.
 */
const loadStyles = () => {
    if (document.querySelector(`link[href="${STYLESHEET_URL}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = STYLESHEET_URL;
    document.head.append(link);
};

/**
 * Hides everything on the page except the header and footer, and shows the
 * closed notice after the header. Runs once, even if several requests fail.
 * Content is hidden with a CSS class, not inline styles.
 * @param {string} message - The server's message, e.g. the reopening time.
 */
const showClosedNotice = (message) => {
    if (document.querySelector('.closed-notice')) return;
    loadStyles();

    [...document.body.children].forEach(element => {
        if (!element.matches('header, footer')) element.classList.add('closed-notice-hidden');
    });

    const notice = document.createElement('section');
    notice.className = 'closed-notice';
    notice.setAttribute('role', 'alert');
    const icon = document.createElement('p');
    icon.className = 'closed-notice-icon';
    icon.textContent = '🕯️';
    icon.setAttribute('aria-hidden', 'true');
    const title = document.createElement('h1');
    title.textContent = 'האתר סגור כעת';
    const text = document.createElement('p');
    text.textContent = message;
    notice.append(icon, title, text);

    const header = document.querySelector('header');
    if (header) header.after(notice);
    else document.body.prepend(notice);
};

/**
 * Starts listening for SITE_CLOSED_EVENT. Call once per page.
 */
const listenForSiteClosed = () => {
    window.addEventListener(SITE_CLOSED_EVENT, (event) => showClosedNotice(event.detail.message));
};

export default listenForSiteClosed;