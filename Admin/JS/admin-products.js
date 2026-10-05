import { getAllProducts } from '../../services/productService.js';
import createAdminHeader from './admin-header.js';
let products = [];
let productIdToDelete = null;
// 1. טעינת מוצרים מהשרת
const loadProducts = async () => {
    try {
        products = await getAllProducts();
        renderProducts();
    } catch (error) {
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
    img.src = product.image || '/assets/images/pinta-logo3.png';
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
        stockBtn.addEventListener('click', () => handleToggleStock(product));
    }
    tdStock.appendChild(stockBtn);
    // פעולות (עריכה / מחיקה)
    const tdActions = document.createElement('td');
    tdActions.className = 'actions-cell';
    const editLink = document.createElement('a');
    editLink.href = ``;
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
        filtered.forEach(product => {
            tbody.appendChild(createProductRow(product));
        });
    }
};
// 4. עדכון זמינות מלאי דרך שירות ה-API
const handleToggleStock = async (product) => {
    const id = product._id || product.id;
    const currentStatus = product.isAvailable !== undefined ? product.isAvailable : product.inStock;
    const newStatus = !currentStatus;
    try {
        // בניות האובייקט לעדכון: נשלח quantity רק אם הוא קיים מלכתחילה במוצר
        const updateData = { isAvailable: newStatus };
        if (product.quantity !== undefined && product.quantity !== null) {
            updateData.quantity = product.quantity;
        }
        await updateQuantity(id, updateData);
        // עדכון המערך המקומי
        products = products.map(p => {
            if (p._id === id) {
                return {
                    ...p,
                    isAvailable: newStatus,
                    inStock: newStatus
                };
            }
            return p;
        });
        renderProducts();
    } catch (error) {
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
const handleConfirmDelete = async () => {
    if (!productIdToDelete) return;
    try {
        await deleteProduct(productIdToDelete);
        products = products.filter(p => (p._id || p.id) !== productIdToDelete);
        renderProducts();
        closeDeleteModal();
    } catch (error) {
    }
};
// 6. אתחול העמוד
createAdminHeader();
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