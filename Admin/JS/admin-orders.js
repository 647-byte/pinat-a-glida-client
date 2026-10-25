import { getAllOrders, updateOrderStatus } from '../../services/orderService.js';
import initAdminPage from './adminPage.js';
import { openOrderModal, setupOrderModal } from './orderModal.js';
import { formatDate } from './utils/formatters.js';
let orders = [];
const tbody = document.getElementById('orders-tbody');
/**
 * Creates an order table row element from an HTML template, populated with order details securely.
 * 
 * @function createOrderRowFromTemplate
 * @param {Object} order - The order object.
 * @param {string} order._id - The unique identifier of the order.
 * @param {string} [order.createdAt] - The creation timestamp of the order.
 * @param {Object} [order.customerDetails] - Customer contact and personal details.
 * @param {string} [order.customerDetails.firstName] - Customer's first name.
 * @param {string} [order.customerDetails.lastName] - Customer's last name.
 * @param {string} [order.customerDetails.phone] - Customer's phone number.
 * @param {Array<Object>} [order.items] - Array of items included in the order.
 * @param {number} [order.totalPrice] - Total price of the order.
 * @param {string} [order.statusOrder] - Current status of the order.
 * @returns {DocumentFragment} The cloned template content containing the order table row.
 */
// --- 2. יצירת שורה מתוך ה-Template (אבטחת XSS מלאה) ---
const createOrderRowFromTemplate = (order) => {
    const template = document.getElementById('order-row-template');
    // 2. משכפלים את התוכן שלה בזיכרון בלבד (שכפול עמוק עם true)
    const clone = template.content.cloneNode(true);
    const tr = clone.querySelector('tr');
    tr.dataset.id = order._id;
    // מזהה ותאריך
    clone.querySelector('.order-short-id').textContent = `#${order._id.slice(-6)}`;
    clone.querySelector('.order-date').textContent = formatDate(order.createdAt);
    // פרטי לקוח
    const details = order.customerDetails || {};
    const customerName = `${details.firstName || ''} ${details.lastName || ''}`.trim() || 'לקוח מזדמן';
    const customerPhone = details.phone || 'ללא טלפון';
    clone.querySelector('.customer-name').textContent = customerName;
    clone.querySelector('.customer-phone').textContent = customerPhone;
    // כמות פריטים וסה"כ לתשלום
    const totalItemsCount = order.items ? order.items.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0;
    clone.querySelector('.items-count-cell').textContent = `${totalItemsCount} פריטים`;
    clone.querySelector('.total-price-cell').textContent = `₪${order.totalPrice || 0}`;
    // סטטוס
    const statusSelect = clone.querySelector('.status-select');
    const currentStatus = order.statusOrder || 'pending';
    statusSelect.value = currentStatus;
    //הוספת התכונה נועדה בשביל העיצוב של הצבעים לפי הסטטוס
    statusSelect.dataset.status = currentStatus;
    return clone;
};
/**
 * Asynchronously fetches all orders from the server and triggers the rendering process.
 * 
 * @async
 * @function loadOrders
 * @returns {Promise<void>} Resolves when orders are fetched and rendered.
 */
// --- 3. טעינה ורינדור ---
const loadOrders = async () => {
    try {
        orders = await getAllOrders();
        renderOrders();
    } catch (error) {
    }
};
/**
 * Filters the orders list based on search input and status filter criteria, then renders the table rows.
 * 
 * @function renderOrders
 * @returns {void}
 */
const renderOrders = () => {
    const emptyState = document.getElementById('empty-state');
    const countBadge = document.getElementById('orders-count');
    tbody.replaceChildren();
    const searchValue = document.getElementById('search-input').value.trim().toLowerCase();
    const statusValue = document.getElementById('status-filter').value;
    const filtered = orders.filter(order => {
        const details = order.customerDetails || {};
        const fullName = `${details.firstName || ''} ${details.lastName || ''}`.toLowerCase();
        const phone = details.phone || '';
        const orderId = order._id || '';
        const matchesSearch = fullName.includes(searchValue) || 
                              phone.includes(searchValue) || 
                              orderId.toLowerCase().includes(searchValue);
        const matchesStatus = statusValue === 'all' || order.statusOrder === statusValue;
        return matchesSearch && matchesStatus;
    });
    countBadge.textContent = `${filtered.length} הזמנות`;
    if (filtered.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }
    emptyState.classList.add('hidden');
    const fragment = document.createDocumentFragment();
    filtered.forEach(order => {
        fragment.appendChild(createOrderRowFromTemplate(order));
    });
    tbody.appendChild(fragment);
};
/**
 * Asynchronously updates an order's status via the API and updates local state and UI attributes.
 * 
 * @async
 * @function handleStatusChange
 * @param {HTMLSelectElement} selectElement - The status select dropdown element.
 * @param {string} orderId - The unique identifier of the order.
 * @returns {Promise<void>} Resolves when the order status is updated.
 */
// --- 4. עדכון סטטוס מהיר ---
const handleStatusChange = async (selectElement, orderId) => {
    const newStatus = selectElement.value;
    try {
        await updateOrderStatus(orderId, newStatus);
        const order = orders.find(o => o._id === orderId);
        if (order) order.statusOrder = newStatus;
        selectElement.dataset.status = newStatus;
    } catch (error) {
    }
};
/**
 * Handles table interaction events using event delegation (clicks and status changes).
 * 
 * @async
 * @function handleTableEvent
 * @param {Event} event - The DOM event object.
 * @returns {Promise<void>} Resolves when the table action has been handled.
 */
// --- 5. אירועים (Event Delegation) ---
const handleTableEvent = async (event) => {
    // נועד כדי לזהות את האלמנט המדויק שנלחץ
    const target = event.target;
    //בדיקה אם יש לו פעולה מוגדרת
    //אם המשתמש לחץ סתם על שטח ריק בטבלה - התעלם וצא
    const action = target.dataset.action;
    if (!action) return;
    //מחפש את שורת ההזמנה שעליה לחצו ואת ה ID של ההזמנה
    const tr = target.closest('tr');
    const id = tr?.dataset.id;
    const order = orders.find(o => o._id === id);
    if (!order) return;
    if (action === 'change-status' && event.type === 'change') {
        await handleStatusChange(target, id);
    } else if (action === 'view-details' && event.type === 'click') {
        openOrderModal(order);
    }
};
// --- 6. אתחול העמוד ---
if (initAdminPage()) {
    setupOrderModal();
    loadOrders();
    tbody.addEventListener('click', handleTableEvent);
    tbody.addEventListener('change', handleTableEvent);
    document.getElementById('search-input').addEventListener('input', renderOrders);
    document.getElementById('status-filter').addEventListener('change', renderOrders);
    document.getElementById('reset-filters-btn').addEventListener('click', () => {
        document.getElementById('search-input').value = '';
        document.getElementById('status-filter').value = 'all';
        renderOrders();
    });
}