/**
 * @file Order details modal on the admin orders page: customer details,
 * the order's items and the total.
 */
import { formatDate,getImageUrl,DEFAULT_IMAGE } from './utils/formatters.js';

/**
 * Builds one item row: product image, name, size and choices, quantity and
 * line price. The name comes from the order, so an item whose product was
 * deleted is still shown, with the default image.
 * @param {Object} item - Order item ({ productId, nameItem, size?, options?, quantity, price }).
 * @returns {HTMLDivElement} The item row.
 */
const createOrderItemRow = (item) => {
    const row = document.createElement('div');
    row.classList.add('order-item-row');
    // א. תמונת המוצר (productId ריק כשהמוצר נמחק מאז ההזמנה)
    const img = document.createElement('img');
    img.src = getImageUrl(item.productId?.imageUrl);
    img.alt = item.nameItem || 'מוצר';
    img.classList.add('order-item-thumb');
    img.onerror = () => { img.src = DEFAULT_IMAGE; };
    // ב. פרטי המוצר (שם + תוספות/גודל)
    const textWrapper = document.createElement('div');
    const nameEl = document.createElement('strong');
    nameEl.textContent = item.nameItem || 'מוצר';
    let optionsText = '';
    if (item.size) optionsText += `גודל: ${item.size.name} `;
    if (item.options && item.options.length > 0) {
        const choices = item.options.flatMap(opt => opt.selectedChoices || []).filter(Boolean).join(', ');
        if (choices) optionsText += `| תוספות: ${choices}`;
    }
    const optionsEl = document.createElement('div');
    optionsEl.classList.add('item-options-text');
    optionsEl.textContent = `כמות: ${item.quantity || 1} ${optionsText ? `(${optionsText})` : ''}`;
    textWrapper.append(nameEl, optionsEl);
    // ג. איגוד תמונה וטקסט לצד שמאל
    const leftContent = document.createElement('div');
    leftContent.classList.add('item-left-content');
    leftContent.append(img, textWrapper);
    // ד. מחיר
    const priceEl = document.createElement('div');
    priceEl.classList.add('item-price');
    priceEl.textContent = `₪${(item.price || 0) * (item.quantity || 1)}`;
    row.append(leftContent, priceEl);
    return row;
};

/**
 * Builds one customer detail line: a bold label and its value.
 * @param {string} label - The label, e.g. 'טלפון'.
 * @param {string} [value] - The value; 'לא צוין' when empty.
 * @param {boolean} [isLtr=false] - Show the value left-to-right (phone numbers).
 * @returns {HTMLParagraphElement} The line.
 */
const createInfoLine = (label, value, isLtr = false) => {
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = `${label}: `;
    const span = document.createElement('span');
    span.textContent = value || 'לא צוין';
    if (isLtr) span.dir = 'ltr';
    p.append(strong, span);
    return p;
};

/**
 * Fills the modal with an order's details and shows it.
 * @param {Object} order - Order from the server.
 */
const openOrderModal = (order) => {
    document.getElementById('modal-order-title').textContent = `פרטי הזמנה #${order._id.slice(-6)}`;
    const details = order.customerDetails || {};
    const address = details.address || {};
    // א. הרכבת פרטי הלקוח והמשלוח
    const customerInfoBox = document.getElementById('modal-customer-info');
    customerInfoBox.replaceChildren(
        createInfoLine('שם הלקוח', `${details.firstName || ''} ${details.lastName || ''}`.trim()),
        createInfoLine('טלפון', details.phone, true),
        createInfoLine('כתובת למשלוח', `${address.street || ''} ${address.numberHouse || ''}, ${address.city || ''}`),
        createInfoLine('הערות להזמנה', order.comments || 'אין הערות'),
        createInfoLine('תאריך ביצוע', formatDate(order.createdAt))
    );
    // ב. הרכבת רשימת הפריטים
    const itemsList = document.getElementById('modal-items-list');
    itemsList.replaceChildren();
    if (order.items && order.items.length > 0) {
        const fragment=document.createDocumentFragment();
        order.items.forEach(item => {
            fragment.appendChild(createOrderItemRow(item));
        });
        itemsList.append(fragment);
    }
    // ג. מחיר כולל והצגת המודאל
    document.getElementById('modal-total-price').textContent = `₪${order.totalPrice || 0}`;
    document.getElementById('order-details-modal').classList.remove('hidden');
};

/**
 * Connects the modal's close button, and closes it on a click outside its content.
 */
const setupOrderModal = () => {
    const modal = document.getElementById('order-details-modal');
    const closeBtn = document.getElementById('close-modal-btn');
    const closeModal = () => modal.classList.add('hidden');
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
};
export {openOrderModal,setupOrderModal};