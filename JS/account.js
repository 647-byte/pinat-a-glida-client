/**
 * @file Customer account page controller (HTML/account.html).
 * Requires a signed-in customer. Shows a greeting, the order history and
 * a logout button.
 */
import createHeader from './header.js';
import createFooter from './footer.js';
import createCartButton from './components/cartButton.js';
import createOrderCard from './components/orderCard.js';
import { requireLogin, getUser, logout } from '../services/authService.js';
import { getMyOrders } from '../services/orderService.js';
import { ApiError } from '../services/apiClient.js';

createHeader();
createFooter();
createCartButton();

/** This page's file name, used to return here after signing in. */
const PAGE = 'account.html';

/** Greeting line under the page title. */
const greetingElement = document.getElementById('account-greeting');
/** Container of the order cards. */
const ordersList = document.getElementById('orders-list');

/**
 * Handles a failed request: an expired session sends the user to log in
 * again; any other error is passed to showMessage.
 * @param {Error} err - The error thrown by the request.
 * @param {(text: string) => void} showMessage - Displays the error text.
 */
const handleRequestError = (err, showMessage) => {
    if (err instanceof ApiError && err.status === 401) {
        logout();
        requireLogin(PAGE);
        return;
    }
    showMessage(err instanceof ApiError ? err.message : 'לא ניתן להתחבר לשרת. נסו שוב מאוחר יותר.');
};

/**
 * Greets the signed-in user by name.
 */
const showGreeting = () => {
    const name = getUser()?.name;
    greetingElement.textContent = name ? `שלום ${name} 👋` : '';
};

/**
 * Signs the user out and returns to the home page.
 */
const setupLogout = () => {
    document.getElementById('logout-btn').addEventListener('click', () => {
        logout();
        window.location.href = '../index.html';
    });
};

/**
 * Replaces the order list with a message (loading, empty or error).
 * @param {string} text - The message.
 */
const showOrdersMessage = (text) => {
    const message = document.createElement('p');
    message.className = 'account-message';
    message.textContent = text;
    ordersList.replaceChildren(message);
};

/**
 * Sorts orders from newest to oldest by creation date. Falls back to the
 * id, which also grows over time.
 * @param {Array<Object>} orders - Orders from the server.
 * @returns {Array<Object>} A new, sorted array.
 */
const sortNewestFirst = (orders) =>
    [...orders].sort((a, b) => String(b.createdAt || b._id).localeCompare(String(a.createdAt || a._id)));

/**
 * Loads and renders the customer's orders.
 */
const loadOrders = async () => {
    showOrdersMessage('טוען הזמנות...');
    try {
        const orders = await getMyOrders();
        if (orders.length === 0) {
            showOrdersMessage('עדיין לא ביצעת הזמנות 🍦');
            return;
        }
        ordersList.replaceChildren(...sortNewestFirst(orders).map(createOrderCard));
    } catch (err) {
        handleRequestError(err, showOrdersMessage);
    }
};

if (requireLogin(PAGE)) {
    showGreeting();
    setupLogout();
    loadOrders();
}