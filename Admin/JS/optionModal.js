/**
 * @file "New option group" modal on the add/edit product page. Manages the
 * dynamic list of choice inputs, sends the new group to the server and
 * passes the created group back to the page.
 */
import { addOptionGroup } from '../../services/optionGroupService.js';
import { ApiError } from '../../services/apiClient.js';

/** Container of the choice input rows; set by setupOptionModal. */
let choicesListContainer;

/**
 * Creates one choice input row with a remove button (no innerHTML).
 * The last remaining row is cleared instead of removed.
 * @param {string} [value=''] - Initial value.
 * @returns {HTMLDivElement} The row.
 */
const createChoiceRow = (value = '') => {
    const row = document.createElement('div');
    row.className = 'choice-row form-inline-group';
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'שם הבחירה (למשל: אוראו)';
    input.value = value;
    input.className = 'modal-choice-input';
    input.required = true;
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn-danger remove-choice-btn';
    deleteBtn.textContent = '🗑️';
    deleteBtn.setAttribute('aria-label', 'הסרת בחירה');
    deleteBtn.addEventListener('click', () => {
        // לוודא שתמיד נשארת לפחות תיבת קלט אחת פעילה
        if (choicesListContainer.children.length > 1) {
            row.remove();
        } else {
            input.value = ''; // אם זו השורה היחידה, רק ננקה אותה
        }
    });
    row.append(input, deleteBtn);
    return row;
};

/**
 * Returns the trimmed, non-empty choice names from the input rows.
 * @returns {Array<string>} The choices.
 */
const collectChoices = () =>
    [...choicesListContainer.querySelectorAll('.modal-choice-input')]
        .map(input => input.value.trim())
        .filter(Boolean);

/**
 * Connects the modal: open and close buttons, adding choice rows and saving
 * the new group. Shows the server's message if saving fails.
 * @param {(group: Object) => void} [onGroupCreated] - Called with the created group.
 */
export const setupOptionModal = (onGroupCreated) => {
    const modal = document.getElementById('option-group-modal');
    const openBtn = document.getElementById('open-option-modal-btn');
    const closeBtn = document.getElementById('close-option-modal-btn');
    const form = document.getElementById('option-group-form');
    const addChoiceBtn = document.getElementById('modal-add-choice-btn');
    const errorElement = document.getElementById('modal-group-error');
    choicesListContainer = document.getElementById('modal-choices-list');

    /**
     * Clears the form, the choice rows and the error message.
     */
    const resetModal = () => {
        form.reset();
        choicesListContainer.textContent = '';
        errorElement.textContent = '';
    };

    /**
     * Shows or hides the modal. When it opens empty, adds a first choice row.
     * @param {boolean} show - True to show the modal, false to hide it.
     */
    const toggleModal = (show) => {
        modal.classList.toggle('hidden', !show);
        if (show && choicesListContainer.children.length === 0) {
            // פתיחת המודאל מאכלסת שורה ראשונה ריקה כברירת מחדל
            choicesListContainer.appendChild(createChoiceRow());
        }
    };

    openBtn.addEventListener('click', () => toggleModal(true));
    closeBtn.addEventListener('click', () => {
        resetModal();
        toggleModal(false);
    });
    // הוספת שורת קלט חדשה בלחיצה על כפתור הוספת בחירה
    addChoiceBtn.addEventListener('click', () => {
        choicesListContainer.appendChild(createChoiceRow());
    });

    // שמירת הקבוצה מול השרת
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        errorElement.textContent = '';
        const choices = collectChoices();
        if (choices.length === 0) {
            errorElement.textContent = 'יש להוסיף לפחות בחירה אחת';
            return;
        }
        const newGroupData = {
            title: document.getElementById('modal-group-title').value.trim(),
            maxChoices: Number(document.getElementById('modal-group-max').value),
            isMust: document.getElementById('modal-group-must').checked,
            limitedBySize: document.getElementById('modal-group-limited').checked,
            choices
        };
        try {
            const createdGroup = await addOptionGroup(newGroupData);
            resetModal();
            toggleModal(false);
            onGroupCreated?.(createdGroup);
        } catch (err) {
            errorElement.textContent = err instanceof ApiError
                ? err.message
                : 'לא ניתן להתחבר לשרת. נסו שוב מאוחר יותר.';
        }
    });
};