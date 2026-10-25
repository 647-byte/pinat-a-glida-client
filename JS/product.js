/**
 * @file Product page controller (HTML/product.html).
 * Loads a single product by the `id` query parameter, renders it with its
 * size and option choices, keeps the displayed price in sync with the
 * customer's selections, and adds the configured item to the cart.
 *
 * Server access goes through productService, cart storage through
 * utils/cartStorage, and price rules live in utils/productPricing.
 */
import createHeader from './header.js';
import createFooter from './footer.js';
import { getProductById } from '../services/productService.js';
import { addToCart } from './utils/cartStorage.js';
import { getSizeLimit, calcUnitPrice } from './utils/productPricing.js';
import createCartButton from './components/cartButton.js';  

createHeader();
createFooter();
createCartButton();                                        

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
/** @type {HTMLElement} Displays success or error feedback under the button. */
let statusElement;

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

/**
 * Shows feedback under the add-to-cart button.
 * @param {string} text - The message to display.
 * @param {boolean} isError - True for an error (red), false for success (green).
 */
const showStatus = (text, isError) => {
    statusElement.textContent = text;
    statusElement.classList.toggle('error', isError);
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
            trimToSizeLimits();
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
 * Builds the summary area: total price, add-to-cart button and status line.
 * The button is disabled when the product is unavailable.
 * @returns {HTMLDivElement} The summary area.
 */
const createSummary = () => {
    const summary = document.createElement('div');
    summary.className = 'product-summary';
    const totalLabel = document.createElement('span');
    totalLabel.textContent = 'סה"כ: ';
    totalElement = document.createElement('strong');
    totalElement.className = 'product-total';
    const button = document.createElement('button');
    button.type = 'submit';
    button.className = 'btn-add-cart';
    button.textContent = product.isAvailable ? 'הוספה לעגלה' : 'המוצר אזל';
    button.disabled = !product.isAvailable;
    statusElement = document.createElement('p');
    statusElement.className = 'form-status';
    summary.append(totalLabel, totalElement, button, statusElement);
    return summary;
};

// ---------------------------------------------------------------------------
// Keeping the screen in sync with the state
// ---------------------------------------------------------------------------

/**
 * Updates each option group's hint, and disables the remaining checkboxes
 * of a size-limited group once the size's limit is reached.
 */
const refreshOptions = () => {
    product.options.forEach(group => {
        const chosen = selections.get(group._id);
        const limit = getSizeLimit(group, selectedSize);
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
 * Clears the selections of size-limited groups that exceed the limit of a
 * newly selected size, both in the state and on screen.
 */
const trimToSizeLimits = () => {
    product.options.forEach(group => {
        const limit = getSizeLimit(group, selectedSize);
        const chosen = selections.get(group._id);
        if (limit && chosen.size > limit) {
            chosen.clear();
            groupInputs.get(group._id).forEach(input => { input.checked = false; });
        }
    });
};

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

/**
 * Handles the form submit: checks that every required group has a selection,
 * builds the cart item and stores it. Besides the selections sent to the
 * server, the item keeps display-only data (name, image, unit price and
 * human-readable selection lines) for the cart page.
 * @param {SubmitEvent} event - The submit event.
 */
const handleSubmit = (event) => {
    event.preventDefault();
    const missing = product.options.find(group => group.isMust && selections.get(group._id).size === 0);
    if (missing) {
        showStatus(`יש לבחור ${missing.title}`, true);
        return;
    }
    const chosenGroups = product.options.filter(group => selections.get(group._id).size > 0);
    addToCart({
        productId: product._id,
        quantity,
        size: selectedSize ? { name: selectedSize.name } : undefined,
        options: chosenGroups.map(group => ({
            optionId: group._id,
            selectedChoices: [...selections.get(group._id)]
        })),
        display: {
            name: product.name,
            imageUrl: product.imageUrl,
            unitPrice: calcUnitPrice(product, selectedSize, selections),
            details: chosenGroups.map(group => `${group.title}: ${[...selections.get(group._id)].join(', ')}`)
        }
    });
    showStatus('המוצר נוסף לעגלה 🎉', false);
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
    form.addEventListener('submit', handleSubmit);
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