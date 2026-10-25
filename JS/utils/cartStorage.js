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

/**
 * Returns the estimated cart total, based on the unit prices stored when
 * each item was added. The server recalculates the final price on checkout.
 * @returns {number} Estimated total; 0 when the cart is empty.
 */
const getCartTotal = () =>
    getCart().reduce((sum, item) => sum + (item.display?.unitPrice || 0) * (item.quantity || 0), 0);

/**
 * Removes the item at the given position and notifies listeners.
 * @param {number} index - Zero-based index of the item to remove.
 * @returns {Array<Object>} The updated cart.
 */
const removeFromCart = (index) => {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    return cart;
};

/**
 * Removes all items from the cart and notifies listeners.
 */
const clearCart = () => {
    localStorage.removeItem(CART_KEY);
    window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
};

/**
 * Converts cart items to the shape expected by POST /orders:
 * selections only, without display data or prices.
 * @param {Array<Object>} cart - Cart items.
 * @returns {Array<Object>} Order items.
 */
const toOrderItems = (cart) => cart.map(({ productId, quantity, size, options }) => ({
    productId,
    quantity,
    ...(size && { size }),
    options
}));

export {
    CART_KEY, CART_UPDATED_EVENT,
    getCart, addToCart, removeFromCart, clearCart,
    getCartCount, getCartTotal, toOrderItems
};