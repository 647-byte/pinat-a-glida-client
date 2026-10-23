/**
 * @file Shopping cart persistence in localStorage.
 * Each cart item holds the customer's selections, which are sent to the
 * server, and a `display` object used only for rendering the cart.
 */
const CART_KEY = 'cart';

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
 * Writes the cart to localStorage.
 * @param {Array<Object>} cart - The items to store.
 */
const saveCart = (cart) => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
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

export { getCart, addToCart };