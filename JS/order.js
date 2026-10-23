/**
 * @file Checkout page controller (HTML/order.html).
 * Requires a signed-in customer and a non-empty cart. Shows a read-only
 * order summary and pre-fills the delivery form from the user's profile.
 */
import createHeader from './header.js';
import createFooter from './footer.js';
import createCartItem from './components/cartItem.js';
import { getCart, getCartTotal } from '../services/cartService.js';
import { isLoggedIn, getUser } from '../services/authService.js';

createHeader();
createFooter();

/** The delivery details form. */
const form = document.getElementById('order-form');
/** Container of the order summary items. */
const itemsContainer = document.getElementById('order-items');
/** Element that displays the estimated total. */
const totalElement = document.getElementById('order-total');

/**
 * Sends guests to the login page and asks it to return here afterwards.
 * @returns {boolean} True when the user is signed in and may stay on the page.
 */
const requireLogin = () => {
    if (isLoggedIn()) return true;
    window.location.replace('login.html?redirect=order.html');
    return false;
};

/**
 * Sends the customer back to the cart page when there is nothing to order.
 * @returns {boolean} True when the cart has items.
 */
const requireItems = () => {
    if (getCart().length > 0) return true;
    window.location.replace('cart.html');
    return false;
};

/**
 * Renders the read-only order summary (no remove buttons) and the estimated total.
 */
const renderSummary = () => {
    itemsContainer.replaceChildren(...getCart().map(item => createCartItem(item)));
    totalElement.textContent = `₪${getCartTotal()}`;
};

/**
 * Pre-fills the delivery form from the signed-in user's profile. The first
 * word of the name becomes the first name and the rest the last name.
 */
const prefillForm = () => {
    const user = getUser();
    if (!user) return;
    const [firstName = '', ...lastNameParts] = (user.name || '').trim().split(/\s+/);
    form.elements.firstName.value = firstName;
    form.elements.lastName.value = lastNameParts.join(' ');
    form.elements.phone.value = user.phone || '';
};

if (requireLogin() && requireItems()) {
    renderSummary();
    prefillForm();
}