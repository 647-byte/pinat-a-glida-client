import { getPopularProducts } from '../services/productService.js';
import createHeader from './header.js'
import createFooter from './footer.js';
import createProductCard from './productCard.js';
import createCartButton from './components/cartButton.js';
createHeader();
createFooter();
createCartButton();              
/**
 * Asynchronously fetches popular products and renders them into the home page container.
 * When the site is closed, the closed notice may replace the page content (see closedNotice.js).
 * Handles errors by displaying an error message if the fetch fails.
 * 
 * @async
 * @function loadPopularProducts
 * @returns {Promise<void>} Resolves when the popular products are loaded or if the container is missing.
 */
const loadPopularProducts = async () => {
    const container = document.getElementById('popularProductsContainer');
    if (!container) return;
    try {
        const products = await getPopularProducts();
        renderProductsList(products, container);
    } catch (err) {
        const errorElement = document.createElement('p');
        errorElement.textContent = 'אירעה שגיאה בטעינת המוצרים,  אנא נסו שוב מאוחר יותר.';
        errorElement.classList.add('error-message');
        container.replaceChildren(errorElement);
    }
};
/**
 * Renders a list of product cards into the specified DOM container.
 * Displays an empty-state message if the product list is empty or null.
 * 
 * @function renderProductsList
 * @param {Array<Object>} products - An array of product objects to be rendered.
 * @param {HTMLElement} container - The container element where the product cards will be placed.
 * @returns {void}
 */
const renderProductsList = (products, container) => {
    if (!products || products.length === 0) {
        const emptyElement = document.createElement('p');
        emptyElement.textContent = 'לא נמצאו מוצרים פופולריים כרגע.';
        emptyElement.classList.add('no-products-message');
        container.replaceChildren(emptyElement);
        return;
    }
    const cardElements = products.map(product => createProductCard(product));
    container.replaceChildren(...cardElements);
};
document.addEventListener('DOMContentLoaded', loadPopularProducts);