/**
 * Creates a DOM product card element based on the provided product details.
 * 
 * @function createProductCard
 * @param {Object} product - The product object containing its details.
 * @param {string} product._id - The unique identifier of the product.
 * @param {string} [product.name] - The name of the product.
 * @param {string} [product.description] - A short description of the product.
 * @param {string} [product.imageUrl] - The primary image URL of the product.
 * @param {string} [product.image] - Fallback image URL if imageUrl is missing.
 * @param {number} [product.price] - The base price of the product.
 * @param {Array<{price: number}>} [product.size] - An optional array of sizes, each containing a price.
 * @param {boolean} [product.isAvailable] - Flag indicating if the product is in stock.
 * @returns {HTMLElement} The constructed `<article>` element representing the product card.
 */
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
    priceTitle.classList.add('price-label');
    const price = document.createElement('span');
    const minPrice = product.size?.length ? Math.min(...product.size.map(s => s.price)) : product.price;
    price.textContent = `₪${minPrice}`;
    price.classList.add('price-value');
    div1.append(priceTitle, price);
    const div2 = document.createElement('div');
    div2.classList.add('product-actions');
    const buttonChoose = document.createElement('button');
    buttonChoose.textContent = 'לבחירה';
    buttonChoose.disabled = product.isAvailable === false;
    if (product.isAvailable === false) buttonChoose.textContent = 'אזל';
    const base = window.location.pathname.includes('/HTML/') ? '' : 'HTML/';
    buttonChoose.addEventListener('click', () => {
        window.location.href = `${base}product.html?id=${product._id}`;
    });
    buttonChoose.classList.add('btn-select');
    div2.append(div1, buttonChoose);
    contentDiv.append(nameProduct, desciptionProduct, div2);
    card.append(image, contentDiv);
    return card;
}
export default createProductCard;