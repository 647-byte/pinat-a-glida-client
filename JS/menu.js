import createHeader from './header.js'
import createFooter from './footer.js';
import createProductCard from './productCard.js';
createHeader();
createFooter();
import { SERVER_URL } from "../config.js";
const createMenu = async () => {
    const container = document.getElementById('container');
    try {
        const response = await fetch(`${SERVER_URL}/products`);
        if (!response.ok) {
            throw new Error(`שגיאה בשרת: ${response.status}`);
        }
        const products = await response.json();
        container.replaceChildren();
        products.forEach((product) => {
            const cardElement = createProductCard(product);
            container.appendChild(cardElement);
        });
    }
    catch (err) {
        const errorElement = document.createElement('p');
        errorElement.textContent = 'ארעה שגיאה בטעינת המוצרים, אנא נסו שוב מאוחר יותר.';
        errorElement.classList.add('error-message');
        container.replaceChildren(errorElement);
    }
}
createMenu();