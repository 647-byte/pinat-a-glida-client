/**
 * Creates an individual choice input row with a text field and a delete button.
 * 
 * @function createChoiceRow
 * @param {string} [value=''] - The initial value for the choice input field.
 * @returns {HTMLElement} The constructed `<div>` element representing the choice row.
 */
// פונקציה ליצירת שורת קלט בודדת לבחירה
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
    deleteBtn.addEventListener('click', () => {
        // לוודא שתמיד נשארת לפחות תיבת קלט אחת פעילה
        if (choicesListContainer.children.length > 1) {
            row.remove();
        } else {
            input.value = ''; // אם זו השורה היחחידה, רק ננקה אותה
        }
    });
    row.append(input, deleteBtn);
    return row;
};
let choicesListContainer;
/**
 * Sets up the option group modal, handling opening, closing, dynamic choice rows, and form submission.
 * 
 * @function setupOptionModal
 * @param {Function} [onGroupCreated] - Optional callback function triggered with the newly created group data upon successful submission.
 * @returns {void}
 */
export const setupOptionModal = (onGroupCreated) => {
    const modal = document.getElementById('option-group-modal');
    const openBtn = document.getElementById('open-option-modal-btn');
    const closeBtn = document.getElementById('close-option-modal-btn');
    const form = document.getElementById('option-group-form');
    const addChoiceBtn = document.getElementById('modal-add-choice-btn');
    choicesListContainer = document.getElementById('modal-choices-list');
    const toggleModal = (show) => {
        modal.classList.toggle('hidden', !show);
        if (show && choicesListContainer.children.length === 0) {
            // פתיחת המודאל מאכלסת שורה ראשונה ריקה כברירת מחדל
            choicesListContainer.appendChild(createChoiceRow());
        }
    };
    openBtn.addEventListener('click', () => toggleModal(true));
    closeBtn.addEventListener('click', () => {
        form.reset();
        choicesListContainer.textContent = '';
        toggleModal(false);
    });
    // הוספת שורת קלט חדשה בלחיצה על כפתור הוספת בחירה
    addChoiceBtn.addEventListener('click', () => {
        choicesListContainer.appendChild(createChoiceRow());
    });
    // שמירת הקבוצה מול השרת
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            // איסוף כל הערכים מתיבות הקלט הדינמיות
            const choiceInputs = choicesListContainer.querySelectorAll('.modal-choice-input');
            const choicesArray = [];
            choiceInputs.forEach(input => {
                const val = input.value.trim();
                if (val) choicesArray.push(val);
            });
            if (choicesArray.length === 0) {
                //---------
                return;
            }
            const newGroupData = {
                title: document.getElementById('modal-group-title').value.trim(),
                maxChoices: Number(document.getElementById('modal-group-max').value),
                isMust: document.getElementById('modal-group-must').checked,
                choices: choicesArray
            };
            const createdGroup = await addOptionGroup(newGroupData);
            // איפוס וסגירת המודאל
            form.reset();
            choicesListContainer.textContent = '';
            toggleModal(false);
            if (onGroupCreated) {
                onGroupCreated(createdGroup);
            }
        } catch (error) {
        }
    });
};