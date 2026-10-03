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
export default createProductCard;