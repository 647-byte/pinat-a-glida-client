/**
 * @file Shopping cart persistence in localStorage.
 * Each cart item holds the customer's selections, which are sent to the
 * server, and a `display` object used only for rendering the cart.
 */
const CART_KEY = 'cart';

/** Name of the window event dispatched whenever the cart changes. */
const CART_UPDATED_EVENT = 'cart:updated';

/**
 * Reads the cart from localStorage.
 * @returns {Array<Object>} The cart items, or an empty array if the cart is missing or unreadable.
 */
const getCart = () => {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
        return [];
    }
};

/**
 * Writes the cart to localStorage and notifies listeners on this page
 * by dispatching CART_UPDATED_EVENT on `window`.
 * @param {Array<Object>} cart - The items to store.
 */
const saveCart = (cart) => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
};

/**
 * Appends an item to the cart.
 * @param {Object} item - Cart item: { productId, quantity, size?, options, display }.
 * @returns {number} The number of items in the cart after adding.
 */
const addToCart = (item) => {
    const cart = getCart();
    cart.push(item);
    saveCart(cart);
    return cart.length;
};

/**
 * Returns the total number of units in the cart (the sum of item quantities).
 * @returns {number} Units in the cart; 0 when the cart is empty.
 */
const getCartCount = () => getCart().reduce((sum, item) => sum + (item.quantity || 0), 0);

export { CART_KEY, CART_UPDATED_EVENT, getCart, addToCart, getCartCount };