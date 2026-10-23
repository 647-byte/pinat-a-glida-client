/**
 * @file Cart page controller (HTML/cart.html).
 * Shows the items stored in the cart, their estimated total and the
 * navigation actions (back to the menu, proceed to checkout), and lets the
 * customer remove items. Re-renders whenever the cart changes, including
 * changes made in other tabs. Cart data comes from cartService.
 */
import createHeader from './header.js';
import createFooter from './footer.js';
import { CART_KEY, CART_UPDATED_EVENT, getCart, getCartTotal, removeFromCart } from '../services/cartService.js';
import createCartItem from './components/cartItem.js';

createHeader();
createFooter();

/** Container the cart items are rendered into. */
const itemsContainer = document.getElementById('cart-items');
/** Element that displays the estimated total. */
const totalElement = document.getElementById('cart-total');
/** Link to the checkout page. */
const checkoutButton = document.getElementById('checkout-btn');

/**
 * Replaces the item list with an empty-cart message.
 */
const showEmptyCart = () => {
    const message = document.createElement('p');
    message.className = 'cart-empty';
    message.textContent = 'הסל ריק. אפשר לבחור פינוקים בתפריט 🍦';
    itemsContainer.replaceChildren(message);
};

/**
 * Enables or disables the checkout link. Links cannot be disabled natively,
 * so the link is marked with aria-disabled and a CSS class, removed from the
 * tab order, and its clicks are blocked while disabled.
 * @param {boolean} enabled - Whether checkout is allowed.
 */
const setCheckoutEnabled = (enabled) => {
    checkoutButton.classList.toggle('disabled', !enabled);
    checkoutButton.setAttribute('aria-disabled', String(!enabled));
    checkoutButton.tabIndex = enabled ? 0 : -1;
};

checkoutButton.addEventListener('click', (event) => {
    if (checkoutButton.getAttribute('aria-disabled') === 'true') event.preventDefault();
});

/**
 * Renders the cart: the item list with remove buttons (or an empty message),
 * the estimated total and the checkout availability.
 */
const renderCart = () => {
    const cart = getCart();
    totalElement.textContent = `₪${getCartTotal()}`;
    setCheckoutEnabled(cart.length > 0);
    if (cart.length === 0) {
        showEmptyCart();
        return;
    }
    itemsContainer.replaceChildren(
        ...cart.map((item, index) => createCartItem(item, { onRemove: () => removeFromCart(index) }))
    );
};

renderCart();
window.addEventListener(CART_UPDATED_EVENT, renderCart);
window.addEventListener('storage', (event) => {
    if (event.key === CART_KEY || event.key === null) renderCart();
});