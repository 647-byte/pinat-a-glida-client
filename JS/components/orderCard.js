/**
 * @file Order card component for the customer's order history.
 */
import { formatOrderNumber, formatStatus, formatDate } from '../utils/orderFormat.js';

/**
 * Returns an item's product name when the server includes it.
 * @param {Object} item - Order item.
 * @returns {string|undefined} The product name.
 */
const getItemName = (item) => item.productId?.name || item.name;

/**
 * Builds the list of the order's items. When the server returns product
 * names, each item is listed by name; otherwise the number of units is shown.
 * @param {Array<Object>} [items] - The order's items.
 * @returns {HTMLUListElement} The items list.
 */
const createItemsList = (items = []) => {
    const list = document.createElement('ul');
    list.className = 'order-card-items';
    const allNamed = items.length > 0 && items.every(getItemName);
    const lines = allNamed
        ? items.map(item => `${getItemName(item)} × ${item.quantity}`)
        : [`${items.reduce((sum, item) => sum + (item.quantity || 0), 0)} פריטים`];
    lines.forEach(line => {
        const listItem = document.createElement('li');
        listItem.textContent = line;
        list.append(listItem);
    });
    return list;
};

/**
 * Creates a card for one order: number, status, date, items, delivery
 * address and total.
 * @param {Object} order - Order from the server.
 * @returns {HTMLElement} An <article> describing the order.
 */
const createOrderCard = (order) => {
    const article = document.createElement('article');
    article.className = 'order-card';

    const head = document.createElement('div');
    head.className = 'order-card-head';
    const number = document.createElement('strong');
    number.textContent = `הזמנה #${formatOrderNumber(order._id)}`;
    const status = document.createElement('span');
    status.className = `order-status status-${order.statusOrder}`;
    status.textContent = formatStatus(order.statusOrder);
    head.append(number, status);
    article.append(head);

    const date = formatDate(order.createdAt);
    if (date) {
        const dateElement = document.createElement('p');
        dateElement.className = 'order-card-date';
        dateElement.textContent = date;
        article.append(dateElement);
    }

    article.append(createItemsList(order.items));

    const address = order.customerDetails?.address;
    if (address) {
        const addressElement = document.createElement('p');
        addressElement.className = 'order-card-address';
        addressElement.textContent = `משלוח ל: ${address.street} ${address.numberHouse}, ${address.city}`;
        article.append(addressElement);
    }

    const total = document.createElement('p');
    total.className = 'order-card-total';
    total.textContent = `סה"כ: ₪${order.totalPrice}`;
    article.append(total);

    return article;
};

export default createOrderCard;