/**
 * Creates an inline input row for a product size, including inputs for name, price, maximum free choices, and a delete button.
 * 
 * @function createSizeRow
 * @param {string} [name=''] - The initial name of the size.
 * @param {string|number} [price=''] - The initial price of the size.
 * @param {string|number} [maxChoices=''] - The initial maximum number of free choices for this size.
 * @param {Function} [onRemove] - Optional callback function triggered when the size row is deleted.
 * @returns {HTMLElement} The constructed `<div>` element representing the size row.
 */
export const createSizeRow = (name = '', price = '', maxChoices = '', onRemove) => {
    const row = document.createElement('div');
    row.className = 'size-row form-inline-group';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'שם הגודל (למשל: בינוני)';
    nameInput.value = name;
    nameInput.className = 'size-name';
    nameInput.required = true;
    const priceInput = document.createElement('input');
    priceInput.type = 'number';
    priceInput.placeholder = 'מחיר (₪)';
    priceInput.value = price;
    priceInput.step = '0.5';
    priceInput.min = '0';
    priceInput.className = 'size-price';
    priceInput.required = true;
    const maxChoicesInput = document.createElement('input');
    maxChoicesInput.type = 'number';
    maxChoicesInput.placeholder = ' מקסימום בחירות ללא תוספת תשלום';
    maxChoicesInput.value = maxChoices;
    maxChoicesInput.min = '1';
    maxChoicesInput.className = 'size-max-choices';
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn-danger remove-size-btn';
    deleteBtn.textContent = '🗑️';
    deleteBtn.addEventListener('click', () => {
        row.remove();
        if (onRemove) onRemove();
    });
    row.append(nameInput, priceInput, maxChoicesInput, deleteBtn);
    return row;
};
/**
 * Creates a checkbox wrapper element for a product option group, including a styled label with group details.
 * 
 * @function createOptionGroupCheckbox
 * @param {Object} group - The option group object.
 * @param {string} group._id - The unique identifier of the option group.
 * @param {string} group.title - The title of the option group.
 * @param {number} group.maxChoices - The maximum number of choices allowed for the group.
 * @param {boolean} group.isMust - Flag indicating whether choosing from this group is mandatory.
 * @param {boolean} [isChecked=false] - Flag indicating whether the checkbox should be pre-checked.
 * @returns {HTMLElement} The constructed `<div>` element representing the option group checkbox wrapper.
 */
export const createOptionGroupCheckbox = (group, isChecked = false) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'checkbox-group';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `opt-group-${group._id}`;
    checkbox.value = group._id;
    checkbox.className = 'option-group-checkbox';
    checkbox.checked = isChecked;
    const label = document.createElement('label');
    label.htmlFor = `opt-group-${group._id}`;
    const strong = document.createElement('strong');
    strong.textContent = group.title;
    const span = document.createElement('span');
    span.className = 'text-muted';
    span.textContent = ` (עד ${group.maxChoices} בחירות: ${group.isMust ? 'כן' : 'לא'})`;
    label.append(strong, span);
    wrapper.append(checkbox, label);
    return wrapper;
};
/**
 * Creates a muted paragraph element to display an empty-state or informational message.
 * 
 * @function createEmptyMessage
 * @param {string} messageText - The text content of the message.
 * @returns {HTMLElement} The constructed `<p>` element representing the empty message.
 */
export const createEmptyMessage = (messageText) => {
    const p = document.createElement('p');
    p.className = 'text-muted';
    p.textContent = messageText;
    return p;
};