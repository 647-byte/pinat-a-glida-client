import { getAllProducts, updateQuantity, deleteProduct } from '../../services/productService.js';
import initAdminPage from './adminPage.js';
import { getImageUrl } from './utils/formatters.js';
import { setStatus, showError } from './utils/statusMessage.js';
let products = [];
let productIdToDelete = null;
/** Line above the table for loading, success and error messages. */
const statusElement = document.getElementById('page-status');
// 1. טעינת מוצרים מהשרת
/**
 * Loads all products and renders the table. Shows a loading message while
 * waiting, and the server's message if loading fails.
 */
const loadProducts = async () => {
    setStatus(statusElement, 'טוען מוצרים...');
    try {
        products = await getAllProducts();
        setStatus(statusElement, '');
        renderProducts();
    } catch (error) {
        showError(statusElement, error);
    }
};
// 2. יצירת שורת מוצר בטבלה
const createProductRow = (product) => {
    const id = product._id;
    const hasManagedQuantity = product.quantity !== undefined && product.quantity !== null;
    const isAvailable = hasManagedQuantity
        ? product.quantity > 0
        : (product.isAvailable !== undefined ? product.isAvailable : product.inStock);
    const tr = document.createElement('tr');
    // תמונה
    const tdImg = document.createElement('td');
    const img = document.createElement('img');
    img.src = getImageUrl(product.imageUrl);
    img.alt = product.name || 'מוצר';
    img.className = 'product-thumb';
    tdImg.appendChild(img);
    // שם המוצר
    const tdName = document.createElement('td');
    const strongName = document.createElement('strong');
    strongName.textContent = product.name;
    tdName.appendChild(strongName);
    // מחיר
    const tdPrice = document.createElement('td');
    tdPrice.textContent = `₪${product.price}`;
    // מלאי
    const tdStock = document.createElement('td');
    const stockBtn = document.createElement('button');
    if (hasManagedQuantity) {
        // מוצר מנוהל כמות: כפתור תצוגה בלבד (Disabled / Readonly)
        stockBtn.className = `btn-stock-toggle readonly ${isAvailable ? 'in-stock' : 'out-of-stock'}`;
        stockBtn.textContent = isAvailable ? `🟢 במלאי (${product.quantity})` : '🟠 אזל המלאי (0)';
        stockBtn.disabled = true; // מונע אפשרות לחיצה
        stockBtn.title = 'זמינות מוצר זה מנוהלת אוטומטית לפי הכמות במלאי (ניתן לערוך בעמוד העריכה)';
    }
    else {
        // מוצר ללא כמות מדודה (כמו גלידה): כפתור לחיץ לשינוי זמינות מהיר
        stockBtn.className = `btn-stock-toggle ${isAvailable ? 'in-stock' : 'out-of-stock'}`;
        stockBtn.textContent = isAvailable ? '🟢 במלאי' : '🟠 אזל המלאי';
        stockBtn.addEventListener('click', () => handleToggleStock(product, stockBtn));
    }
    tdStock.appendChild(stockBtn);
    // פעולות (עריכה / מחיקה)
    const tdActions = document.createElement('td');
    tdActions.className = 'actions-cell';
    const editLink = document.createElement('a');
    editLink.href = `admin-add-product.html?id=${id}`;
    editLink.className = 'btn-action btn-edit';
    editLink.textContent = '✏️ עריכה';
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-action btn-delete';
    deleteBtn.textContent = '🗑️ מחיקה';
    deleteBtn.addEventListener('click', () => openDeleteModal(product));
    tdActions.append(editLink, deleteBtn);
    tr.append(tdImg, tdName, tdPrice, tdStock, tdActions);
    return tr;
};
// 3. רינדור הטבלה והחלת המסננים
const renderProducts = () => {
    const tbody = document.getElementById('products-tbody');
    const emptyState = document.getElementById('empty-state');
    const countBadge = document.getElementById('products-count');
    tbody.replaceChildren();
    const searchValue = document.getElementById('search-input').value.trim().toLowerCase();
    const stockValue = document.getElementById('stock-filter').value;
    const filtered = products.filter(item => {
        const matchesSearch = item.name ? item.name.toLowerCase().includes(searchValue) : true;
        const itemAvailable = item.isAvailable !== undefined ? item.isAvailable : item.inStock;
        const matchesStock = stockValue === 'all' ||
            (stockValue === 'inStock' && itemAvailable) ||
            (stockValue === 'outOfStock' && !itemAvailable);
        return matchesSearch && matchesStock;
    });
    countBadge.textContent = `${filtered.length} מוצרים`;
    if (filtered.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        const fragment = document.createDocumentFragment();
        filtered.forEach(product => {
            fragment.appendChild(createProductRow(product));
        });
        tbody.appendChild(fragment);
    }
};
// 4. עדכון זמינות מלאי דרך שירות ה-API
/**
 * Toggles a product's availability (products without a managed quantity).
 * The button is disabled while saving and changes only after the server
 * confirms; on failure, the server's message is shown.
 * @param {Object} product - The product in this row.
 * @param {HTMLButtonElement} stockBtn - The row's stock button.
 */
const handleToggleStock = async (product, stockBtn) => {
    const id = product._id;
    const currentStatus = product.isAvailable !== undefined ? product.isAvailable : product.inStock;
    const newStatus = !currentStatus;
    stockBtn.disabled = true;
    try {
        const updateData = { isAvailable: newStatus };
        if (product.quantity !== undefined && product.quantity !== null) {
            updateData.quantity = product.quantity;
        }
        // 1. קריאת API לשרת
        await updateQuantity(id, updateData);
        // 2. עדכון האובייקט המקומי בזיכרון
        if (product.isAvailable !== undefined) product.isAvailable = newStatus;
        if (product.inStock !== undefined) product.inStock = newStatus;
        // 3. עדכון נקודתי של הכפתור בלבד – ללא רענון של כל הטבלה!
        stockBtn.className = `btn-stock-toggle ${newStatus ? 'in-stock' : 'out-of-stock'}`;
        stockBtn.textContent = newStatus ? '🟢 במלאי' : '🟠 אזל המלאי';
        setStatus(statusElement, `המוצר '${product.name}' סומן כ${newStatus ? 'זמין במלאי' : 'אזל מהמלאי'}`);
    } catch (error) {
        showError(statusElement, error);
    } finally {
        stockBtn.disabled = false;
    }
};
// 5. ניהול ומחיקת מוצר דרך שירות ה-API
const openDeleteModal = (product) => {
    productIdToDelete = product._id || product.id;
    const modalText = document.getElementById('delete-modal-text');
    modalText.textContent = `האם למחוק את המוצר '${product.name}'? פעולה זו אינה ניתנת לביטול.`;
    document.getElementById('delete-modal').classList.remove('hidden');
};
const closeDeleteModal = () => {
    productIdToDelete = null;
    document.getElementById('delete-modal').classList.add('hidden');
};
/**
 * Deletes the product waiting for confirmation and removes it from the
 * table. The confirmation closes either way; on failure, the server's
 * message is shown.
 */
const handleConfirmDelete = async () => {
    if (!productIdToDelete) return;
    const deletedId = productIdToDelete;
    const deletedName = products.find(p => (p._id || p.id) === deletedId)?.name || '';
    try {
        await deleteProduct(deletedId);
        products = products.filter(p => (p._id || p.id) !== deletedId);
        renderProducts();
        setStatus(statusElement, `המוצר '${deletedName}' נמחק`);
    } catch (error) {
        showError(statusElement, error);
    } finally {
        closeDeleteModal();
    }
};
// 6. אתחול העמוד
if (initAdminPage()) {
    loadProducts();
    // אירועי סינון וחיפוש
    document.getElementById('search-input').addEventListener('input', renderProducts);
    document.getElementById('stock-filter').addEventListener('change', renderProducts);
    // ניקוי מסננים
    document.getElementById('reset-filters-btn').addEventListener('click', () => {
        document.getElementById('search-input').value = '';
        document.getElementById('stock-filter').value = 'all';
        renderProducts();
    });
    // אירועי מודאל מחיקה
    document.getElementById('cancel-delete-btn').addEventListener('click', closeDeleteModal);
    document.getElementById('confirm-delete-btn').addEventListener('click', handleConfirmDelete);
}