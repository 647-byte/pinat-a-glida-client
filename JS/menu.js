import { SERVER_URL } from "../config.js";
const createProductCard = (product) => {
    const card = document.createElement('article');
    const video = document.createElement('video');
    video.src = product.videoUrl;
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    const contentDiv = document.createElement('div');
    const nameProduct = document.createElement('h3');
    nameProduct.textContent = product.name;
    const desciptionProduct = document.createElement('p');
    desciptionProduct.textContent = product.description;
    const div1 = document.createElement('div');
    const priceTitle = document.createElement('span');
    priceTitle.textContent = 'החל מ-'
    const price = document.createElement('span');
    price.textContent = `₪${product.price}`;
    div1.append(priceTitle, price);
    const div2 = document.createElement('div');
    const buttonChoose = document.createElement('button');
    buttonChoose.textContent = 'לבחירה';
    buttonChoose.disabled = !product.description;
    div2.append(div1, buttonChoose);
    contentDiv.append(nameProduct, desciptionProduct, div2);
    card.append(video, contentDiv);
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
        container.replaceChildren(errorElement);
    }
}
createMenu();