/**
 * @file Customer account page controller (HTML/account.html).
 * Requires a signed-in customer. Shows a greeting and a logout button.
 */
import createHeader from './header.js';
import createFooter from './footer.js';
import createCartButton from './components/cartButton.js';
import { requireLogin, getUser, logout } from '../services/authService.js';

createHeader();
createFooter();
createCartButton();

/** This page's file name, used to return here after signing in. */
const PAGE = 'account.html';

/** Greeting line under the page title. */
const greetingElement = document.getElementById('account-greeting');

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

if (requireLogin(PAGE)) {
    showGreeting();
    setupLogout();
}