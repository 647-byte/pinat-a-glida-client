import createHeader from './header.js'
import createFooter from './footer.js';
import createProductCard from './productCard.js';
import { getAllProducts } from '../services/productService.js';
createHeader();
createFooter();
const createMenu = async () => {
    const container = document.getElementById('container');
    try {
        const products = await getAllProducts();
        container.replaceChildren();
        if (products.length === 0) {
            const emptyElement = document.createElement('p');
            emptyElement.textContent = 'אין כרגע מוצרים מוצגים בתפריט.';
            emptyElement.classList.add('message');
            container.appendChild(emptyElement);
            return;
        }
        const fragment=document.createDocumentFragment();
        products.forEach((product) => {
            const cardElement = createProductCard(product);
            fragment.appendChild(cardElement);
        });
        container.appendChild(fragment);
    }
    catch (err) {
        const errorElement = document.createElement('p');
        errorElement.textContent = 'ארעה שגיאה בטעינת המוצרים, אנא נסו שוב מאוחר יותר.';
        errorElement.classList.add('message');
        container.replaceChildren(errorElement);
    }
}
createMenu();