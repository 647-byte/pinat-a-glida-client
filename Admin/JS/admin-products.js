import { getAllProducts, updateQuantity, deleteProduct } from '../../services/productService.js';
import initAdminPage from './adminPage.js';
import { getImageUrl } from './utils/formatters.js';
import { setStatus, showError } from './utils/statusMessage.js';
import initUrlFilters from './utils/urlFilters.js';
let products = [];
let productIdToDelete = null;
/**
 * Asynchronously loads all products from the server and triggers the rendering process.
 * 
 * @async
 * @function loadProducts
 * @returns {Promise<void>} Resolves when products are fetched and rendered.
 */
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
/**
 * Creates a table row element (`<tr>`) representing a product in the admin products table.
 * 
 * @function createProductRow
 * @param {Object} product - The product object.
 * @param {string} product._id - The unique identifier of the product.
 * @param {string} [product.name] - The name of the product.
 * @param {number} [product.price] - The price of the product.
 * @param {string} [product.imageUrl] - The image URL of the product.
 * @param {number} [product.quantity] - Managed stock quantity, if applicable.
 * @param {boolean} [product.isAvailable] - Availability flag.
 * @param {boolean} [product.inStock] - Fallback stock flag.
 * @returns {HTMLElement} The constructed `<tr>` element representing the product row.
 */
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
/**
 * Filters the product list based on search input and stock filter criteria, then renders the table rows.
 * 
 * @function renderProducts
 * @returns {void}
 */
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
/**
 * Toggles a product's availability. Used only for products without a
 * managed quantity: their availability is set by hand. Products with a
 * managed quantity get a disabled button, since the server sets their
 * availability from the stock. Only isAvailable is sent, because the
 * server ADDS any quantity it receives to the current stock.
 * The button is disabled while saving and changes only after the server
 * confirms; on failure, the server's message is shown.
 * @param {Object} product - The product in this row.
 * @param {HTMLButtonElement} stockBtn - The row's stock button.
 */
const handleToggleStock = async (product, stockBtn) => {
    const currentStatus = product.isAvailable !== undefined ? product.isAvailable : product.inStock;
    const newStatus = !currentStatus;
    stockBtn.disabled = true;
    try {
        await updateQuantity(product._id, { isAvailable: newStatus });
        // Keep the local copy in sync, so filtering shows the new status
        if (product.isAvailable !== undefined) product.isAvailable = newStatus;
        if (product.inStock !== undefined) product.inStock = newStatus;
        // Update only this row's button, without re-rendering the whole table
        stockBtn.className = `btn-stock-toggle ${newStatus ? 'in-stock' : 'out-of-stock'}`;
        stockBtn.textContent = newStatus ? '🟢 במלאי' : '🟠 אזל המלאי';
        setStatus(statusElement, `המוצר '${product.name}' סומן כ${newStatus ? 'זמין במלאי' : 'אזל מהמלאי'}`);
    } catch (error) {
        showError(statusElement, error);
    } finally {
        stockBtn.disabled = false;
    }
};
/**
 * Opens the delete confirmation modal for a specific product.
 * 
 * @function openDeleteModal
 * @param {Object} product - The product object to be deleted.
 * @returns {void}
 */
// 5. ניהול ומחיקת מוצר דרך שירות ה-API
const openDeleteModal = (product) => {
    productIdToDelete = product._id || product.id;
    const modalText = document.getElementById('delete-modal-text');
    modalText.textContent = `האם למחוק את המוצר '${product.name}'? פעולה זו אינה ניתנת לביטול.`;
    document.getElementById('delete-modal').classList.remove('hidden');
};
/**
 * Closes the delete confirmation modal and resets the stored product ID.
 * 
 * @function closeDeleteModal
 * @returns {void}
 */
const closeDeleteModal = () => {
    productIdToDelete = null;
    document.getElementById('delete-modal').classList.add('hidden');
};
/**
 * Asynchronously confirms and executes the deletion of the selected product via the API, then updates the UI.
 * 
 * @async
 * @function handleConfirmDelete
 * @returns {Promise<void>} Resolves when the product is deleted and the view is updated.
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
// 6. Page setup
if (initAdminPage()) {
    initUrlFilters({
        filters: [
            { element: document.getElementById('search-input'), param: 'q', defaultValue: '' },
            { element: document.getElementById('stock-filter'), param: 'stock', defaultValue: 'all' }
        ],
        onChange: renderProducts,
        resetButton: document.getElementById('reset-filters-btn')
    });
    loadProducts();
    // Delete confirmation modal
    document.getElementById('cancel-delete-btn').addEventListener('click', closeDeleteModal);
    document.getElementById('confirm-delete-btn').addEventListener('click', handleConfirmDelete);
}