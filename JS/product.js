/**
 * @file Product page controller (HTML/product.html).
 * Loads a single product by the `id` query parameter, renders it with its
 * size and option choices, keeps the displayed price in sync with the
 * customer's selections, and adds the configured item to the cart.
 *
 * Server access goes through productService, cart storage through
 * cartService, and price rules live in utils/productPricing.
 */
import createHeader from './header.js';
import createFooter from './footer.js';
import { getProductById } from '../services/productService.js';

createHeader();
createFooter();

/** Maximum quantity of one configured item per cart entry. */
const MAX_QUANTITY = 20;

/** Root element the whole page is rendered into. */
const container = document.getElementById('product-container');

/** @type {Object} The product loaded from the server, with populated option groups. */
let product;


/**
 * Replaces the whole page content with a single message.
 * Used when the product cannot be shown (missing id, not found, closed, error).
 * @param {string} text - The message to display.
 */
const showMessage = (text) => {
    const message = document.createElement('p');
    message.className = 'message';
    message.textContent = text;
    container.replaceChildren(message);
};


/**
 * Builds the product image block.
 * @returns {HTMLDivElement} A wrapper containing the product image.
 */
const createImage = () => {
    const wrap = document.createElement('div');
    wrap.className = 'product-image-wrap';
    const image = document.createElement('img');
    image.src = product.imageUrl;
    image.alt = product.name;
    wrap.append(image);
    return wrap;
};

/**
 * Builds the product title and, when present, its description.
 * @returns {HTMLElement[]} The heading elements in display order.
 */
const createHeading = () => {
    const title = document.createElement('h1');
    title.textContent = product.name;
    if (!product.description) return [title];
    const description = document.createElement('p');
    description.className = 'product-description';
    description.textContent = product.description;
    return [title, description];
};


/**
 * Builds the whole page for the loaded product and syncs it with the initial state.
 */
const renderProduct = () => {
    const form = document.createElement('form');
    form.className = 'product-form';
    form.noValidate = true;
    form.append(...createHeading());
    container.replaceChildren(createImage(), form);
};

/**
 * Page entry point: reads the product id from the URL, loads the product
 * and renders it. Shows a suitable message when the id is missing, the
 * product is not found, the shop is closed, or the request fails.
 */
const loadProduct = async () => {
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) {
        showMessage('לא נבחר מוצר.');
        return;
    }
    try {
        product = await getProductById(id);
        product.size = product.size || [];
        product.options = (product.options || []).filter(group => group && group._id);
        document.title = `${product.name} - פינתה גלידה`;
        renderProduct();
    } catch (err) {
        if (err.status === 404 || err.status === 400) showMessage('המוצר לא נמצא.');
        else if (err.type === 'not_activity') showMessage(err.message);
        else showMessage('אירעה שגיאה בטעינת המוצר, אנא נסו שוב מאוחר יותר.');
    }
};

loadProduct();