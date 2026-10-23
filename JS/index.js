import { SERVER_URL } from '../config.js';
import createHeader from './header.js'
import createFooter from './footer.js';
import createProductCard from './productCard.js';
import createCartButton from './components/cartButton.js';
createHeader();
createFooter();
createCartButton();              

const loadPopularProducts = async () => {
    const container = document.getElementById('popularProductsContainer');
    if (!container) return;
    try {
        const response = await fetch(`${SERVER_URL}/products/popular`);
        if (!response.ok) {
            throw new Error(`שגיאה בשרת: ${response.status}`);
        }
        const products = await response.json();
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