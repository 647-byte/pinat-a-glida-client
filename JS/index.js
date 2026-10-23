import { getPopularProducts } from '../services/productService.js';
import createHeader from './header.js'
import createFooter from './footer.js';
import createProductCard from './productCard.js';
import createCartButton from './components/cartButton.js';
createHeader();
createFooter();
createCartButton();              

/**
 * Loads the popular products into the home page. When the site is closed,
 * the closed notice replaces the page (see closedNotice.js).
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