/**
 * @file Product page controller (HTML/product.html).
 * Loads a single product by the `id` query parameter, renders it with its
 * size and option choices, keeps the displayed price in sync with the
 * customer's selections, and adds the configured item to the cart.
 *
 * Server access goes through productService, cart storage through
 * cartService, and price rules live in utils/productPricing.
 */
import createHeader from './header.js';
import createFooter from './footer.js';
import { getProductById } from '../services/productService.js';
import { getFlavorLimit, calcUnitPrice } from './utils/productPricing.js';

createHeader();
createFooter();

/** Maximum quantity of one configured item per cart entry. */
const MAX_QUANTITY = 20;

/** Root element the whole page is rendered into. */
const container = document.getElementById('product-container');

// ---------------------------------------------------------------------------
// Page state
// ---------------------------------------------------------------------------

/** @type {Object} The product loaded from the server, with populated option groups. */
let product;
/** @type {Object|null} The selected size, or null when the product has no sizes. */
let selectedSize = null;
/** @type {number} The selected quantity. */
let quantity = 1;
/** @type {Map<string, Set<string>>} Option group id to the choices selected in it. */
const selections = new Map();
/** @type {Map<string, HTMLInputElement[]>} Option group id to its checkbox inputs. */
const groupInputs = new Map();
/** @type {Map<string, HTMLParagraphElement>} Option group id to its hint element. */
const hints = new Map();
/** @type {HTMLElement} Displays the total price. */
let totalElement;

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

/**
 * Replaces the whole page content with a single message.
 * Used when the product cannot be shown (missing id, not found, closed, error).
 * @param {string} text - The message to display.
 */
const showMessage = (text) => {
    const message = document.createElement('p');
    message.className = 'message';
    message.textContent = text;
    container.replaceChildren(message);
};

// ---------------------------------------------------------------------------
// Building the page
// ---------------------------------------------------------------------------

/**
 * Builds the product image block.
 * @returns {HTMLDivElement} A wrapper containing the product image.
 */
const createImage = () => {
    const wrap = document.createElement('div');
    wrap.className = 'product-image-wrap';
    const image = document.createElement('img');
    image.src = product.imageUrl;
    image.alt = product.name;
    wrap.append(image);
    return wrap;
};

/**
 * Builds the product title and, when present, its description.
 * @returns {HTMLElement[]} The heading elements in display order.
 */
const createHeading = () => {
    const title = document.createElement('h1');
    title.textContent = product.name;
    if (!product.description) return [title];
    const description = document.createElement('p');
    description.className = 'product-description';
    description.textContent = product.description;
    return [title, description];
};

/**
 * Builds the size picker: one radio card per size, showing its price and name.
 * The first size is selected by default.
 * @returns {HTMLFieldSetElement} The size fieldset.
 */
const createSizesFieldset = () => {
    const fieldset = document.createElement('fieldset');
    fieldset.className = 'option-group';
    const legend = document.createElement('legend');
    legend.textContent = 'בחירת גודל';
    const cards = document.createElement('div');
    cards.className = 'size-cards';
    product.size.forEach((size, index) => {
        const label = document.createElement('label');
        label.className = 'choice size-card';
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'size';
        input.value = size.name;
        input.checked = index === 0;
        input.addEventListener('change', () => {
            selectedSize = size;
            trimFlavors();
            refresh();
        });
        const price = document.createElement('span');
        price.className = 'size-price';
        price.textContent = `₪${size.price}`;
        const name = document.createElement('span');
        name.className = 'size-name';
        name.textContent = size.name;
        label.append(input, price, name);
        cards.append(label);
    });
    fieldset.append(legend, cards);
    selectedSize = product.size[0];
    return fieldset;
};

/**
 * Builds one option group: a checkbox per choice and a hint line.
 * Registers the group in `selections`, `groupInputs` and `hints`.
 * @param {Object} group - Option group from the server.
 * @returns {HTMLFieldSetElement} The group fieldset.
 */
const createGroupFieldset = (group) => {
    selections.set(group._id, new Set());
    const fieldset = document.createElement('fieldset');
    fieldset.className = 'option-group';
    const legend = document.createElement('legend');
    legend.textContent = group.isMust ? `${group.title} *` : group.title;
    const hint = document.createElement('p');
    hint.className = 'group-hint';
    hints.set(group._id, hint);
    fieldset.append(legend, hint);

    const inputs = group.choices.map(choice => {
        const label = document.createElement('label');
        label.className = 'choice';
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.value = choice;
        input.addEventListener('change', () => {
            const chosen = selections.get(group._id);
            if (input.checked) chosen.add(choice);
            else chosen.delete(choice);
            refresh();
        });
        const text = document.createElement('span');
        text.textContent = choice;
        label.append(input, text);
        fieldset.append(label);
        return input;
    });
    groupInputs.set(group._id, inputs);
    return fieldset;
};

/**
 * Builds the quantity input (1 to MAX_QUANTITY). Changes update `quantity`
 * and the displayed total.
 * @returns {HTMLLabelElement} The labelled quantity input.
 */
const createQuantityField = () => {
    const label = document.createElement('label');
    label.className = 'quantity-field';
    label.textContent = 'כמות: ';
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '1';
    input.max = String(MAX_QUANTITY);
    input.value = '1';
    input.addEventListener('input', () => {
        quantity = Math.min(MAX_QUANTITY, Math.max(1, parseInt(input.value) || 1));
        refresh();
    });
    label.append(input);
    return label;
};

/**
 * Builds the summary area: the total price.
 * @returns {HTMLDivElement} The summary area.
 */
const createSummary = () => {
    const summary = document.createElement('div');
    summary.className = 'product-summary';
    const totalLabel = document.createElement('span');
    totalLabel.textContent = 'סה"כ: ';
    totalElement = document.createElement('strong');
    totalElement.className = 'product-total';
    summary.append(totalLabel, totalElement);
    return summary;
};

// ---------------------------------------------------------------------------
// Keeping the screen in sync with the state
// ---------------------------------------------------------------------------

/**
 * Updates each option group's hint and disables flavor checkboxes
 * once the size limit is reached.
 */
const refreshOptions = () => {
    product.options.forEach(group => {
        const chosen = selections.get(group._id);
        const limit = getFlavorLimit(group, selectedSize);
        let hint = limit ? `ניתן לבחור עד ${limit}` : `${group.maxChoices} כלולים במחיר`;
        if (!limit && group.pricePer > 0) hint += `, כל בחירה נוספת ₪${group.pricePer}`;
        hint += ` (נבחרו ${chosen.size})`;
        hints.get(group._id).textContent = hint;
        groupInputs.get(group._id).forEach(input => {
            input.disabled = Boolean(limit) && !input.checked && chosen.size >= limit;
        });
    });
};

/**
 * Updates the displayed total (unit price times quantity).
 */
const refreshTotal = () => {
    totalElement.textContent = `₪${calcUnitPrice(product, selectedSize, selections) * quantity}`;
};

/**
 * Re-syncs the whole screen with the current state. Called after every change.
 */
const refresh = () => {
    refreshOptions();
    refreshTotal();
};

/**
 * Clears flavor selections that exceed the limit of a newly selected size,
 * both in the state and on screen.
 */
const trimFlavors = () => {
    product.options.forEach(group => {
        const limit = getFlavorLimit(group, selectedSize);
        const chosen = selections.get(group._id);
        if (limit && chosen.size > limit) {
            chosen.clear();
            groupInputs.get(group._id).forEach(input => { input.checked = false; });
        }
    });
};

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

/**
 * Builds the whole page for the loaded product and syncs it with the initial state.
 */
const renderProduct = () => {
    const form = document.createElement('form');
    form.className = 'product-form';
    form.noValidate = true;
    form.append(...createHeading());
    if (product.size.length > 0) form.append(createSizesFieldset());
    product.options.forEach(group => form.append(createGroupFieldset(group)));
    form.append(createQuantityField(), createSummary());
    container.replaceChildren(createImage(), form);
    refresh();
};

/**
 * Page entry point: reads the product id from the URL, loads the product
 * and renders it. Shows a suitable message when the id is missing, the
 * product is not found, the shop is closed, or the request fails.
 */
const loadProduct = async () => {
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) {
        showMessage('לא נבחר מוצר.');
        return;
    }
    try {
        product = await getProductById(id);
        product.size = product.size || [];
        product.options = (product.options || []).filter(group => group && group._id);
        document.title = `${product.name} - פינתה גלידה`;
        renderProduct();
    } catch (err) {
        if (err.status === 404 || err.status === 400) showMessage('המוצר לא נמצא.');
        else if (err.type === 'not_activity') showMessage(err.message);
        else showMessage('אירעה שגיאה בטעינת המוצר, אנא נסו שוב מאוחר יותר.');
    }
};

loadProduct();