/**
 * @file Floating shopping-cart button.
 * A fixed button for customer pages that shows how many units are in the
 * cart and links to the cart page.
 *
 * Paths are resolved relative to this module, so the button works the same
 * from the site root (index.html) and from pages inside /HTML.
 */
import { getCartCount } from '../../services/cartService.js';

/** Absolute URL of the cart page. */
const CART_PAGE_URL = new URL('../../HTML/cart.html', import.meta.url).href;
/** Absolute URL of the button's stylesheet. */
const STYLESHEET_URL = new URL('../../CSS/cart-button.css', import.meta.url).href;

/**
 * Adds the button's stylesheet to the document, once.
 */
const loadStyles = () => {
    if (document.querySelector(`link[href="${STYLESHEET_URL}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = STYLESHEET_URL;
    document.head.append(link);
};

/**
 * Updates the badge number and the button's accessible label from the cart.
 * The badge is hidden when the cart is empty.
 * @param {HTMLAnchorElement} button - The cart button.
 * @param {HTMLSpanElement} badge - The counter badge inside the button.
 */
const updateCount = (button, badge) => {
    const count = getCartCount();
    badge.textContent = count > 99 ? '99+' : String(count);
    badge.hidden = count === 0;
    button.setAttribute('aria-label', count === 0 ? 'סל הקניות ריק' : `סל הקניות, ${count} פריטים`);
};

/**
 * Creates the floating cart button, appends it to the page and shows
 * the current cart count.
 * @returns {HTMLAnchorElement} The button element.
 */
const createCartButton = () => {
    loadStyles();

    const button = document.createElement('a');
    button.className = 'cart-fab';
    button.href = CART_PAGE_URL;

    const icon = document.createElement('span');
    icon.className = 'cart-fab-icon';
    icon.textContent = '🛒';
    icon.setAttribute('aria-hidden', 'true');

    const badge = document.createElement('span');
    badge.className = 'cart-fab-badge';
    badge.setAttribute('aria-hidden', 'true');

    button.append(icon, badge);
    document.body.append(button);

    updateCount(button, badge);
    return button;
};

export default createCartButton;