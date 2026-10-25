/**
 * @file Order details modal on the admin orders page: customer details,
 * the order's items and the total.
 */
import { formatDate,getImageUrl,DEFAULT_IMAGE } from './utils/formatters.js';
/**
 * Creates a DOM row element for an individual item inside the order details modal.
 * 
 * @function createOrderItemRow
 * @param {Object} item - The order item object.
 * @param {Object} item.productId - The product reference object containing image details.
 * @param {string} [item.productId.imageUrl] - The image URL of the product.
 * @param {string} [item.nameItem] - The name of the item.
 * @param {Object} [item.size] - The size details of the item.
 * @param {string} item.size.name - The name of the selected size.
 * @param {Array<Object>} [item.options] - Selected option groups for the item.
 * @param {number} [item.quantity=1] - The quantity ordered of this item.
 * @param {number} [item.price=0] - The unit price of the item.
 * @returns {HTMLElement} The constructed `<div>` element representing the order item row.
 */
// 1. יצירת שורת פריט במודאל
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
 * Creates a single paragraph information line consisting of a bold label and a value span.
 * 
 * @function createInfoLine
 * @param {string} label - The label describing the information field.
 * @param {string} value - The value to display.
 * @param {boolean} [isLtr=false] - Flag indicating whether the value text direction should be set to LTR.
 * @returns {HTMLElement} The constructed `<p>` element containing the info line.
 */
// 2. יצירת שורת מידע בודדת עבור פרטי הלקוח
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
 * Opens the order details modal and injects the order's customer info, items list, and total price.
 * 
 * @function openOrderModal
 * @param {Object} order - The full order object containing customer details, items, and pricing.
 * @param {string} order._id - The unique identifier of the order.
 * @param {Object} [order.customerDetails] - Customer and shipping details.
 * @param {Array<Object>} [order.items] - An array of items included in the order.
 * @param {number} [order.totalPrice=0] - The total price of the order.
 * @param {string} [order.createdAt] - The creation timestamp of the order.
 * @returns {void}
 */
// 3. פונקציית פתיחת המודאל והזרקת הנתונים
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
 * Sets up event listeners for closing the order details modal via the close button or background backdrop click.
 * 
 * @function setupOrderModal
 * @returns {void}
 */
// 4. הגדרת אירועי סגירה למודאל
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