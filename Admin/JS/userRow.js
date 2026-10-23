/**
 * @file Table row component for the admin users page.
 */
import { formatDate } from './utils/formatters.js';

/** Hebrew labels of the user roles, in the order shown in the role select. */
const ROLE_LABELS = {
    customer: 'לקוח',
    admin: 'מנהל'
};

/**
 * Creates a table cell with text.
 * @param {string} text - Cell text.
 * @param {string} [className] - Optional class name.
 * @returns {HTMLTableCellElement} The cell.
 */
const createCell = (text, className) => {
    const cell = document.createElement('td');
    cell.textContent = text;
    if (className) cell.className = className;
    return cell;
};

/**
 * Creates the user's name cell, marking the signed-in admin's own row.
 * @param {Object} user - The user.
 * @param {boolean} isSelf - Whether this is the signed-in admin.
 * @returns {HTMLTableCellElement} The cell.
 */
const createNameCell = (user, isSelf) => {
    const cell = document.createElement('td');
    const name = document.createElement('strong');
    name.textContent = user.name;
    cell.append(name);
    if (isSelf) {
        const tag = document.createElement('span');
        tag.className = 'self-tag';
        tag.textContent = 'את/ה';
        cell.append(tag);
    }
    return cell;
};

/**
 * Creates the role select. Disabled on the signed-in admin's own row.
 * @param {Object} user - The user.
 * @param {boolean} isSelf - Whether this is the signed-in admin.
 * @returns {HTMLSelectElement} The select.
 */
const createRoleSelect = (user, isSelf) => {
    const select = document.createElement('select');
    select.className = 'role-select';
    select.dataset.action = 'change-role';
    select.dataset.role = user.role;
    select.setAttribute('aria-label', `תפקיד של ${user.name}`);
    Object.entries(ROLE_LABELS).forEach(([value, label]) => {
        select.append(new Option(label, value));
    });
    select.value = user.role;
    select.disabled = isSelf;
    return select;
};

/**
 * Creates the delete button. Disabled on the signed-in admin's own row.
 * @param {Object} user - The user.
 * @param {boolean} isSelf - Whether this is the signed-in admin.
 * @returns {HTMLButtonElement} The button.
 */
const createDeleteButton = (user, isSelf) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn-action btn-delete';
    button.dataset.action = 'delete';
    button.textContent = '🗑️ מחיקה';
    button.setAttribute('aria-label', `מחיקת ${user.name}`);
    button.disabled = isSelf;
    return button;
};

/**
 * Creates a table row for one user: name, email, phone, join date, role
 * select and delete button. The row's data-id holds the user id, which the
 * page uses for event delegation.
 * @param {Object} user - User from the server.
 * @param {Object} [options] - Row options.
 * @param {boolean} [options.isSelf=false] - Whether this is the signed-in admin.
 * @returns {HTMLTableRowElement} The row.
 */
const createUserRow = (user, { isSelf = false } = {}) => {
    const row = document.createElement('tr');
    row.dataset.id = user._id;

    const roleCell = document.createElement('td');
    roleCell.append(createRoleSelect(user, isSelf));

    const actionsCell = document.createElement('td');
    actionsCell.className = 'actions-cell';
    actionsCell.append(createDeleteButton(user, isSelf));

    row.append(
        createNameCell(user, isSelf),
        createCell(user.email, 'ltr-cell'),
        createCell(user.phone || '—', 'ltr-cell'),
        createCell(formatDate(user.createdAt)),
        roleCell,
        actionsCell
    );
    return row;
};

export { createUserRow, ROLE_LABELS };