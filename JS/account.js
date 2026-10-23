/**
 * @file Customer account page controller (HTML/account.html).
 * Requires a signed-in customer. Shows a greeting, the profile with an
 * edit form, the order history and a logout button.
 */
import createHeader from './header.js';
import createFooter from './footer.js';
import createCartButton from './components/cartButton.js';
import createOrderCard from './components/orderCard.js';
import { requireLogin, getUser, logout } from '../services/authService.js';
import { getMe, updateMe } from '../services/userService.js';
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
/** The profile edit form. */
const profileForm = document.getElementById('profile-form');
/** Status line of the profile form. */
const profileStatus = profileForm.querySelector('.form-status');
/** Submit button of the profile form. */
const profileButton = profileForm.querySelector('button[type="submit"]');

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

/* ---------- Orders ---------- */

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

/* ---------- Profile ---------- */

/**
 * Shows a message under the profile form, in green for success or red for errors.
 * @param {string} text - The message.
 * @param {boolean} [isSuccess=false] - Whether the message reports success.
 */
const setProfileStatus = (text, isSuccess = false) => {
    profileStatus.textContent = text;
    profileStatus.classList.toggle('success', isSuccess);
};

/**
 * Fills the profile form with the user's details.
 * @param {Object} user - The user ({ name, email, phone }).
 */
const fillProfile = (user) => {
    profileForm.elements.name.value = user.name || '';
    profileForm.elements.email.value = user.email || '';
    profileForm.elements.phone.value = user.phone || '';
};

/**
 * Shows the stored details immediately, then refreshes them from the server.
 */
const loadProfile = async () => {
    fillProfile(getUser() || {});
    try {
        fillProfile(await getMe());
    } catch (err) {
        handleRequestError(err, setProfileStatus);
    }
};

/**
 * Saves the edited name and phone. HTML validation runs first, so this
 * only fires for a valid form.
 * @param {SubmitEvent} event - The submit event.
 */
const handleProfileSubmit = async (event) => {
    event.preventDefault();
    profileButton.disabled = true;
    setProfileStatus('');
    const { name, phone } = Object.fromEntries(new FormData(profileForm));
    try {
        const user = await updateMe({ name: name.trim(), ...(phone && { phone }) });
        fillProfile(user);
        showGreeting();
        setProfileStatus('הפרטים נשמרו בהצלחה ✓', true);
    } catch (err) {
        handleRequestError(err, setProfileStatus);
    } finally {
        profileButton.disabled = false;
    }
};

if (requireLogin(PAGE)) {
    showGreeting();
    setupLogout();
    loadProfile();
    loadOrders();
    profileForm.addEventListener('submit', handleProfileSubmit);
}