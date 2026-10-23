/**
 * @file Checkout page controller (HTML/order.html).
 * Requires a signed-in customer and a non-empty cart. Shows a read-only
 * order summary, pre-fills the delivery form from the user's profile, and
 * submits the order. The server sets the customer from the token and
 * calculates the final price; the confirmation shows that price.
 */
import createHeader from './header.js';
import createFooter from './footer.js';
import createCartItem from './components/cartItem.js';
import { getCart, getCartTotal, clearCart, toOrderItems } from '../services/cartService.js';
import { isLoggedIn, getUser, logout } from '../services/authService.js';
import { createOrder } from '../services/orderService.js';
import { ApiError } from '../services/apiClient.js';

createHeader();
createFooter();

/** Login page that returns to this page after signing in. */
const LOGIN_URL = 'login.html?redirect=order.html';

/** The delivery details form. */
const form = document.getElementById('order-form');
/** Container of the order summary items. */
const itemsContainer = document.getElementById('order-items');
/** Element that displays the estimated total. */
const totalElement = document.getElementById('order-total');
/** Line under the submit button for error messages. */
const statusElement = form.querySelector('.form-status');
/** The form's submit button. */
const submitButton = form.querySelector('button[type="submit"]');

/**
 * Sends guests to the login page and asks it to return here afterwards.
 * @returns {boolean} True when the user is signed in and may stay on the page.
 */
const requireLogin = () => {
    if (isLoggedIn()) return true;
    window.location.replace(LOGIN_URL);
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

/**
 * Builds the POST /orders body from the form values and the cart.
 * Only selections are sent; the server calculates all prices.
 * @returns {Object} The order body: { items, customerDetails, comments? }.
 */
const buildOrder = () => {
    const values = Object.fromEntries(new FormData(form));
    const field = (name) => values[name].trim();
    return {
        items: toOrderItems(getCart()),
        customerDetails: {
            firstName: field('firstName'),
            lastName: field('lastName'),
            phone: field('phone'),
            address: {
                city: field('city'),
                street: field('street'),
                numberHouse: field('numberHouse')
            }
        },
        ...(field('comments') && { comments: field('comments') })
    };
};

/**
 * Replaces the checkout layout with an order confirmation that shows the
 * order number and the final price calculated by the server.
 * @param {Object} order - The order returned by the server.
 */
const showConfirmation = (order) => {
    const section = document.createElement('section');
    section.className = 'form-card order-confirmation';
    const title = document.createElement('h2');
    title.textContent = 'ההזמנה התקבלה! 🎉';
    const number = document.createElement('p');
    number.textContent = `מספר הזמנה: ${order._id.slice(-6).toUpperCase()}`;
    const total = document.createElement('p');
    total.textContent = `סכום לתשלום: ₪${order.totalPrice}`;
    const backLink = document.createElement('a');
    backLink.href = 'menu.html';
    backLink.className = 'order-back-link';
    backLink.textContent = 'חזרה לתפריט';
    section.append(title, number, total, backLink);
    document.querySelector('.order-layout').replaceWith(section);
};

/**
 * Handles a failed order request: an expired session sends the user to log
 * in again; any other error is shown under the submit button.
 * @param {Error} err - The error thrown while placing the order.
 */
const handleOrderError = (err) => {
    if (err instanceof ApiError && err.status === 401) {
        logout();
        window.location.replace(LOGIN_URL);
        return;
    }
    statusElement.textContent = err instanceof ApiError
        ? err.message
        : 'לא ניתן להתחבר לשרת. נסו שוב מאוחר יותר.';
};

/**
 * Submits the order. HTML validation runs first, so this only fires for a
 * valid form. On success the cart is cleared and a confirmation is shown.
 * @param {SubmitEvent} event - The submit event.
 */
const handleSubmit = async (event) => {
    event.preventDefault();
    submitButton.disabled = true;
    statusElement.textContent = '';
    try {
        const order = await createOrder(buildOrder());
        clearCart();
        showConfirmation(order);
    } catch (err) {
        handleOrderError(err);
        submitButton.disabled = false;
    }
};

if (requireLogin() && requireItems()) {
    renderSummary();
    prefillForm();
    form.addEventListener('submit', handleSubmit);
}