import createHeader from './header.js'
import createFooter from './footer.js';
import createProductCard from './productCard.js';
import { getAllProducts } from '../services/productService.js';
import createCartButton from './components/cartButton.js';   
createHeader();
createFooter();
createCartButton();  
/**
 * Asynchronously fetches all products from the service and renders them into the menu container.
 * Handles empty product lists and displays appropriate error messages if the fetch fails.
 * 
 * @async
 * @function createMenu
 * @returns {Promise<void>} Resolves when the menu has finished rendering or handling errors.
 */                                       
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