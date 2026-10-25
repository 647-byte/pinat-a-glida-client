/**
 * @file Product card component: image, name, description, starting price
 * and a link to the product page. Used on the home page, the menu and the
 * live preview in the add-product page.
 */
/** Absolute URL of the product page, resolved relative to this module. */
const PRODUCT_PAGE_URL = new URL('../HTML/product.html', import.meta.url);
/**
 * Builds the link to a product's page, e.g. HTML/product.html?id=...
 * @param {string} id - The product's id.
 * @returns {string} Absolute URL.
 */
const getProductUrl = (id) => {
    const url = new URL(PRODUCT_PAGE_URL);
    url.searchParams.set('id', id);
    return url.href;
};
/**
 * Builds the card's action: a link to the product page, or a disabled
 * "sold out" button when the product is unavailable. The live preview has
 * no id yet, so its link has no destination.
 * @param {Object} product - The product.
 * @returns {HTMLElement} The link or the button.
 */
const createChooseAction = (product) => {
    if (product.isAvailable === false) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn-select';
        button.textContent = 'אזל';
        button.disabled = true;
        return button;
    }
    const link = document.createElement('a');
    link.className = 'btn-select';
    link.textContent = 'לבחירה';
    if (product._id) link.href = getProductUrl(product._id);
    return link;
};
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
    div2.append(div1, createChooseAction(product));
    contentDiv.append(nameProduct, desciptionProduct, div2);
    card.append(image, contentDiv);
    return card;
};
export default createProductCard;