import createAdminHeader from './admin-header.js';
import { getAllProducts } from '../../services/productService.js';
//import { getAllOrders } from '../../services/orderService.js';
createAdminHeader();
const initDashboard = async () => {
    // 2. תפיסת אלמנטים מה-DOM
    const outOfStockEl = document.getElementById('out-of-stock-count');
    const activeProductsEl = document.getElementById('active-products-count');
    const openOrdersEl = document.getElementById('open-orders-count');
    // הצגת מצב טעינה ראשוני
    if (outOfStockEl) outOfStockEl.textContent = '...';
    if (activeProductsEl) activeProductsEl.textContent = '...';
    if (openOrdersEl) openOrdersEl.textContent = '...';
    try {
        // 3. שליפת נתוני מוצרים והזמנות במקביל
        const products = await getAllProducts();
        // const orders = await getAllOrders();
        // --- א. עיבוד נתוני מוצרים ---
        if (Array.isArray(products)) {
            // מוצרים שאזלו מהמלאי (לפי כמות או לפי סטטוס זמינות)
            const outOfStockCount = products.filter(p => (p.isAvailable === false || p.inStock === false)).length;
            if (outOfStockEl) outOfStockEl.textContent = outOfStockCount;
            if (activeProductsEl) activeProductsEl.textContent = products.length;
        } else {
            if (outOfStockEl) outOfStockEl.textContent = '0';
            if (activeProductsEl) activeProductsEl.textContent = '0';
        }
        // --- ב. עיבוד נתוני הזמנות ---
        // if (Array.isArray(orders)) {
        //     // סינון הזמנות שעדיין פתוחות / ממתינות לטיפול
        //     const openOrdersCount = orders.filter(order => 
        //         order.status === 'pending' || 
        //         order.status === 'preparing' || 
        //         order.status === 'on_the_way'
        //     ).length;
        //     if (openOrdersEl) openOrdersEl.textContent = openOrdersCount;
        // } else {
        //     if (openOrdersEl) openOrdersEl.textContent = '0';
        // }
    } catch (error) {
    }
};
initDashboard();