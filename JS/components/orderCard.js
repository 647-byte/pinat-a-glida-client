/**
 * @file Order card component for the customer's order history.
 */
import { formatOrderNumber, formatStatus, formatDate } from '../utils/orderFormat.js';

/**
 * Returns the item's product name, as saved in the order when it was placed.
 * The name is kept in the order itself, so it stays correct even if the
 * product is renamed or deleted later.
 * @param {Object} item - Order item.
 * @returns {string} The product name, or a generic label for old orders without one.
 */
const getItemName = (item) => item.nameItem || 'מוצר';

/**
 * Builds the display line of one order item: name, size (when the product
 * has sizes) and quantity, e.g. "גביע (גדול) × 2".
 * @param {Object} item - Order item ({ nameItem, size?, quantity }).
 * @returns {string} The item line.
 */
const formatItemLine = (item) => {
    const size = item.size?.name ? ` (${item.size.name})` : '';
    return `${getItemName(item)}${size} × ${item.quantity}`;
};

/**
 * Builds the list of the order's items, one line per item.
 * @param {Array<Object>} [items] - The order's items.
 * @returns {HTMLUListElement} The items list.
 */
const createItemsList = (items = []) => {
    const list = document.createElement('ul');
    list.className = 'order-card-items';
    items.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = formatItemLine(item);
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