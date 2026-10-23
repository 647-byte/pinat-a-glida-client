/**
 * @file Cart item component.
 * Builds the markup for a single cart entry. Used by the cart page and
 * intended for reuse in the checkout summary.
 */

/**
 * Builds the list of the item's selections: its size and the
 * human-readable option lines stored in `display.details`.
 * @param {Object} item - Cart item.
 * @returns {HTMLUListElement|null} The details list, or null when there is nothing to show.
 */
const createDetails = (item) => {
    const lines = [];
    if (item.size) lines.push(`גודל: ${item.size.name}`);
    lines.push(...(item.display?.details || []));
    if (lines.length === 0) return null;
    const list = document.createElement('ul');
    list.className = 'cart-item-details';
    lines.forEach(line => {
        const listItem = document.createElement('li');
        listItem.textContent = line;
        list.append(listItem);
    });
    return list;
};

/**
 * Creates the element for a single cart item: image, name, selections,
 * quantity, line total and, optionally, a remove button.
 * @param {Object} item - Cart item ({ quantity, size?, display }).
 * @param {Object} [options] - Optional behavior.
 * @param {Function} [options.onRemove] - Called when the remove button is clicked.
 *   When omitted, no remove button is rendered (e.g. in a read-only summary).
 * @returns {HTMLElement} An <article> describing the item.
 */
const createCartItem = (item, { onRemove } = {}) => {
    const { name = 'מוצר', imageUrl = '', unitPrice = 0 } = item.display || {};

    const article = document.createElement('article');
    article.className = 'cart-item';

    const image = document.createElement('img');
    image.className = 'cart-item-image';
    image.src = imageUrl;
    image.alt = name;

    const info = document.createElement('div');
    info.className = 'cart-item-info';
    const title = document.createElement('h2');
    title.className = 'cart-item-title';
    title.textContent = name;
    info.append(title);
    const details = createDetails(item);
    if (details) info.append(details);
    const quantity = document.createElement('p');
    quantity.className = 'cart-item-quantity';
    quantity.textContent = `כמות: ${item.quantity} × ₪${unitPrice}`;
    info.append(quantity);

    const lineTotal = document.createElement('strong');
    lineTotal.className = 'cart-item-total';
    lineTotal.textContent = `₪${unitPrice * item.quantity}`;

    article.append(image, info, lineTotal);

    if (onRemove) {
        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'cart-item-remove';
        removeButton.textContent = 'הסרה';
        removeButton.setAttribute('aria-label', `הסרת ${name} מהסל`);
        removeButton.addEventListener('click', onRemove);
        article.append(removeButton);
    }
    return article;
};

export default createCartItem;