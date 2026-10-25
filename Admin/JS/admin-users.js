/**
 * @file Admin users page controller (Admin/HTML/admin-users.html).
 * Lists all users with a search and a role filter that are kept in the
 * URL (see utils/urlFilters.js), so refreshing the page keeps them. Lets
 * the admin change a user's role and delete users. The admin's own row is
 * read-only; the server enforces the same rule.
 */
import initAdminPage from './adminPage.js';
import { createUserRow, ROLE_LABELS } from './userRow.js';
import { getAllUsers, changeRole, deleteUser } from '../../services/userService.js';
import { getUser } from '../../services/authService.js';
import { setStatus, getErrorMessage } from './utils/statusMessage.js';
import initUrlFilters from './utils/urlFilters.js';

/** All users loaded from the server. */
let users = [];
/** The user waiting for delete confirmation, or null. */
let userToDelete = null;

const tbody = document.getElementById('users-tbody');
const searchInput = document.getElementById('search-input');
const roleFilter = document.getElementById('role-filter');
const statusElement = document.getElementById('page-status');
const emptyState = document.getElementById('empty-state');
const countBadge = document.getElementById('users-count');
const deleteModal = document.getElementById('delete-modal');

/** Id of the signed-in admin, whose row cannot be changed or deleted. */
const currentUserId = getUser()?._id;

/* ---------- Messages ---------- */

/**
 * Shows a message above the table.
 * @param {string} text - The message; an empty string clears it.
 * @param {boolean} [isError=false] - Whether to show it as an error.
 */
const showStatus = (text, isError = false) => setStatus(statusElement, text, isError);
/* ---------- Filters ---------- */

/**
 * Tells whether a user matches the current search and role filter.
 * @param {Object} user - The user.
 * @returns {boolean} True when the user should be listed.
 */
const matchesFilters = (user) => {
    const search = searchInput.value.trim().toLowerCase();
    const text = `${user.name} ${user.email} ${user.phone || ''}`.toLowerCase();
    const matchesRole = roleFilter.value === 'all' || user.role === roleFilter.value;
    return text.includes(search) && matchesRole;
};

/* ---------- Rendering ---------- */

/**
 * Renders the users that match the filters, the count badge and the empty state.
 */
const renderUsers = () => {
    const filtered = users.filter(matchesFilters);
    countBadge.textContent = `${filtered.length} משתמשים`;
    emptyState.classList.toggle('hidden', filtered.length > 0);
    tbody.replaceChildren(
        ...filtered.map(user => createUserRow(user, { isSelf: user._id === currentUserId }))
    );
};

/**
 * Loads all users from the server and renders them.
 */
const loadUsers = async () => {
    showStatus('טוען משתמשים...');
    try {
        users = await getAllUsers();
        showStatus('');
        renderUsers();
    } catch (err) {
        showStatus(getErrorMessage(err), true);
    }
};

/* ---------- Role change ---------- */

/**
 * Saves the role chosen in a row's select. On failure, the select returns
 * to the previous role and the server's message is shown.
 * @param {HTMLSelectElement} select - The row's role select.
 * @param {Object} user - The user in that row.
 */
const handleRoleChange = async (select, user) => {
    const previousRole = user.role;
    select.disabled = true;
    try {
        const updated = await changeRole(user._id, select.value);
        user.role = updated.role;
        showStatus(`התפקיד של ${user.name} עודכן ל${ROLE_LABELS[updated.role]}`);
        renderUsers();
    } catch (err) {
        select.value = previousRole;
        select.disabled = false;
        showStatus(getErrorMessage(err), true);
    }
};

/* ---------- Delete ---------- */

/**
 * Opens the delete confirmation for a user.
 * @param {Object} user - The user to delete.
 */
const openDeleteModal = (user) => {
    userToDelete = user;
    document.getElementById('delete-modal-text').textContent =
        `האם למחוק את המשתמש '${user.name}' (${user.email})? פעולה זו אינה ניתנת לביטול.`;
    deleteModal.classList.remove('hidden');
    document.getElementById('cancel-delete-btn').focus();
};

/**
 * Closes the delete confirmation without deleting.
 */
const closeDeleteModal = () => {
    userToDelete = null;
    deleteModal.classList.add('hidden');
};


/**
 * Closes the delete confirmation when Escape is pressed while it is open.
 * @param {KeyboardEvent} event - A keydown event from the document.
 */
const handleModalKeydown = (event) => {
    if (event.key === 'Escape' && !deleteModal.classList.contains('hidden')) closeDeleteModal();
};

/**
 * Deletes the user waiting for confirmation and removes them from the table.
 */
const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    const { _id, name } = userToDelete;
    try {
        await deleteUser(_id);
        users = users.filter(user => user._id !== _id);
        renderUsers();
        showStatus(`המשתמש ${name} נמחק`);
    } catch (err) {
        showStatus(getErrorMessage(err), true);
    } finally {
        closeDeleteModal();
    }
};

/* ---------- Table events (event delegation) ---------- */

/**
 * Handles clicks and changes inside the table, by the element's data-action.
 * @param {Event} event - A click or change event from the table body.
 */
const handleTableEvent = (event) => {
    const { action } = event.target.dataset;
    if (!action) return;
    const user = users.find(item => item._id === event.target.closest('tr')?.dataset.id);
    if (!user) return;
    if (action === 'change-role' && event.type === 'change') handleRoleChange(event.target, user);
    if (action === 'delete' && event.type === 'click') openDeleteModal(user);
};

/* ---------- Page setup ---------- */

if (initAdminPage()) {
    initUrlFilters({
        filters: [
            { element: searchInput, param: 'q', defaultValue: '' },
            { element: roleFilter, param: 'role', defaultValue: 'all' }
        ],
        onChange: renderUsers,
        resetButton: document.getElementById('reset-filters-btn')
    });
    loadUsers();
    tbody.addEventListener('change', handleTableEvent);
    tbody.addEventListener('click', handleTableEvent);
    document.getElementById('cancel-delete-btn').addEventListener('click', closeDeleteModal);
    document.getElementById('confirm-delete-btn').addEventListener('click', handleConfirmDelete);
    document.addEventListener('keydown', handleModalKeydown);
}