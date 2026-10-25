import { getAllOrders, updateOrderStatus } from '../../services/orderService.js';
import initAdminPage from './adminPage.js';
import { openOrderModal, setupOrderModal } from './orderModal.js';
import { formatDate } from './utils/formatters.js';
import { setStatus, showError } from './utils/statusMessage.js';
let orders = [];
const tbody = document.getElementById('orders-tbody');
/** Line above the table for loading, success and error messages. */
const statusElement = document.getElementById('page-status');
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
// --- 3. טעינה ורינדור ---
/**
 * Loads all orders and renders the table. Shows a loading message while
 * waiting, and the server's message if loading fails.
 */
const loadOrders = async () => {
    setStatus(statusElement, 'טוען הזמנות...');
    try {
        orders = await getAllOrders();
        setStatus(statusElement, '');
        renderOrders();
    } catch (error) {
        showError(statusElement, error);
    }
};
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
// --- 4. עדכון סטטוס מהיר ---
/**
 * Saves the status chosen in a row's select. While saving, the select is
 * disabled. On failure, the select returns to the previous status, so the
 * table always shows what is saved on the server.
 * @param {HTMLSelectElement} selectElement - The row's status select.
 * @param {string} orderId - The order's id.
 */
const handleStatusChange = async (selectElement, orderId) => {
    const order = orders.find(o => o._id === orderId);
    const previousStatus = order?.statusOrder;
    const newStatus = selectElement.value;
    selectElement.disabled = true;
    try {
        await updateOrderStatus(orderId, newStatus);
        if (order) order.statusOrder = newStatus;
        selectElement.dataset.status = newStatus;
        setStatus(statusElement, `הסטטוס של הזמנה #${orderId.slice(-6)} עודכן ל${selectElement.selectedOptions[0].textContent}`);
    } catch (error) {
        selectElement.value = previousStatus;
        showError(statusElement, error);
    } finally {
        selectElement.disabled = false;
    }
};
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