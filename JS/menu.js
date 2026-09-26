import createHeader from './header.js'
import createFooter from './footer.js';
createHeader();
createFooter();
import { SERVER_URL } from "../config.js";
const createProductCard = (product) => {
    const card = document.createElement('article');
    card.classList.add('product-card');
    const image = document.createElement('img');
    image.src = product.imageUrl || product.image;
    image.alt = product.name;
    image.classList.add('product-image');
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('product-info');
    const nameProduct = document.createElement('h3');
    nameProduct.textContent = product.name;
    nameProduct.classList.add('product-title');
    const desciptionProduct = document.createElement('p');
    desciptionProduct.textContent = product.description;
    desciptionProduct.classList.add('product-desc');
    const div1 = document.createElement('div');
    div1.classList.add('product-price-container');
    const priceTitle = document.createElement('span');
    priceTitle.textContent = 'החל מ-'
    const price = document.createElement('span');
    price.textContent = `₪${product.price}`;
    price.classList.add('price-value');
    div1.append(priceTitle, price);
    const div2 = document.createElement('div');
    div2.classList.add('product-actions');
    const buttonChoose = document.createElement('button');
    buttonChoose.textContent = 'לבחירה';
    buttonChoose.disabled = !product.description;
    buttonChoose.classList.add('btn-select');
    div2.append(div1, buttonChoose);
    contentDiv.append(nameProduct, desciptionProduct, div2);
    card.append(image, contentDiv);
    return card;
}
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