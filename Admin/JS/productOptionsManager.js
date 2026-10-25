import { getOptionGroups } from '../../services/optionGroupService.js';
import { createSizeRow, createOptionGroupCheckbox, createEmptyMessage } from './add-product-components.js';
/**
 * Initializes the product options manager, handling dynamic size inputs and option group checkboxes.
 * 
 * @function initProductOptionsManager
 * @returns {Object} An object containing utility functions and DOM elements for managing product options and sizes.
 */
export const initProductOptionsManager = () => {
    const hasSizesCheckbox = document.getElementById('hasSizes');
    const sizesSectionWrapper = document.getElementById('sizes-section-wrapper');
    const sizesListContainer = document.getElementById('sizes-list');
    const addSizeBtn = document.getElementById('add-size-btn');
    const optionGroupsContainer = document.getElementById('option-groups-container');
    /**
     * Toggles the visibility of the sizes section based on the checkbox state,
     * and ensures at least one size row exists if sizes are enabled.
     * 
     * @function toggleSizesSection
     * @returns {void}
     */
    const toggleSizesSection = () => {
        const hasSizes = hasSizesCheckbox.checked;
        sizesSectionWrapper.classList.toggle('hidden', !hasSizes);
        if (hasSizes && sizesListContainer.children.length === 0) {
            sizesListContainer.appendChild(createSizeRow());
        }
    };

    hasSizesCheckbox.addEventListener('change', toggleSizesSection);
    addSizeBtn.addEventListener('click', () => sizesListContainer.appendChild(createSizeRow()));
/**
     * Asynchronously fetches and renders option groups into the container.
     * 
     * @async
     * @function loadOptionGroups
     * @param {Array<string>} [selectedOptionIds=[]] - An array of pre-selected option group IDs.
     * @returns {Promise<void>} Resolves when the option groups are successfully loaded and rendered.
     */
    const loadOptionGroups = async (selectedOptionIds = []) => {
        try {
            const optionGroups = await getOptionGroups();
            optionGroupsContainer.textContent = '';

            if (!optionGroups || optionGroups.length === 0) {
                optionGroupsContainer.appendChild(createEmptyMessage('אין קבוצות אפשרויות במערכת. צור חדשה למעלה.'));
                return;
            }

            optionGroups.forEach(group => {
                const isChecked = selectedOptionIds.includes(group._id);
                optionGroupsContainer.appendChild(createOptionGroupCheckbox(group, isChecked));
            });
        } catch (error) {
            console.error("שגיאה בטעינת קבוצות אפשרויות:", error);
        }
    };
/**
     * Collects and validates size data from the DOM input rows if sizes are enabled.
     * 
     * @function collectSizesData
     * @returns {Array<Object>} An array of size objects containing name, price, and optional maxChoices.
     */
    const collectSizesData = () => {
        let sizesData = [];
        if (hasSizesCheckbox.checked) {
            sizesListContainer.querySelectorAll('.size-row').forEach(row => {
                const name = row.querySelector('.size-name').value.trim();
                const price = parseFloat(row.querySelector('.size-price').value);
                const maxChoices = row.querySelector('.size-max-choices').value;
                if (name && !isNaN(price)) {
                    sizesData.push({ name, price, maxChoices: maxChoices ? Number(maxChoices) : undefined });
                }
            });
        }
        return sizesData;
    };
/**
     * Collects the IDs of all currently selected option groups.
     * 
     * @function collectSelectedOptions
     * @returns {Array<string>} An array of selected option group IDs.
     */
    const collectSelectedOptions = () => {
        const selectedOptions = [];
        optionGroupsContainer.querySelectorAll('.option-group-checkbox:checked').forEach(cb => {
            selectedOptions.push(cb.value);
        });
        return selectedOptions;
    };
    return {
        toggleSizesSection,
        loadOptionGroups,
        collectSizesData,
        collectSelectedOptions,
        hasSizesCheckbox,
        sizesListContainer
    };
};