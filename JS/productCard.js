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
 * Creates a product card.
 * @param {Object} product - Product from the server, or a preview object without an id.
 * @returns {HTMLElement} An <article> describing the product.
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