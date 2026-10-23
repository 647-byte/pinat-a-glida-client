/**
 * @file Admin dashboard controller (Admin/HTML/index.html).
 * Shows quick store metrics: out-of-stock products, products on the menu
 * and open orders (orders that were not delivered yet).
 */
import initAdminPage from './adminPage.js';
import { getAllProducts } from '../../services/productService.js';
import { getAllOrders } from '../../services/orderService.js';

/** Order statuses that still need handling. */
const OPEN_STATUSES = ['pending', 'preparing', 'on_the_way'];

/** The metric value elements, by metric. */
const metrics = {
    outOfStock: document.getElementById('out-of-stock-count'),
    products: document.getElementById('active-products-count'),
    openOrders: document.getElementById('open-orders-count')
};

/**
 * Writes the same text to every metric, e.g. while loading or after an error.
 * @param {string} text - Text to show.
 */
const setAllMetrics = (text) => {
    Object.values(metrics).forEach(element => {
        element.textContent = text;
    });
};

/**
 * Loads products and orders in parallel and fills in the metrics.
 */
const initDashboard = async () => {
    setAllMetrics('...');
    try {
        const [products, orders] = await Promise.all([getAllProducts(), getAllOrders()]);
        metrics.outOfStock.textContent = products.filter(product => product.isAvailable === false).length;
        metrics.products.textContent = products.length;
        metrics.openOrders.textContent = orders.filter(order => OPEN_STATUSES.includes(order.statusOrder)).length;
    } catch {
        setAllMetrics('—');
    }
};

if (initAdminPage()) initDashboard();