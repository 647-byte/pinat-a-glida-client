import { getOptionGroups } from '../../services/optionGroupService.js';
import { createSizeRow, createOptionGroupCheckbox, createEmptyMessage } from './add-product-components.js';

export const initProductOptionsManager = () => {
    const hasSizesCheckbox = document.getElementById('hasSizes');
    const sizesSectionWrapper = document.getElementById('sizes-section-wrapper');
    const sizesListContainer = document.getElementById('sizes-list');
    const addSizeBtn = document.getElementById('add-size-btn');
    const optionGroupsContainer = document.getElementById('option-groups-container');

    const toggleSizesSection = () => {
        const hasSizes = hasSizesCheckbox.checked;
        sizesSectionWrapper.classList.toggle('hidden', !hasSizes);
        if (hasSizes && sizesListContainer.children.length === 0) {
            sizesListContainer.appendChild(createSizeRow());
        }
    };

    hasSizesCheckbox.addEventListener('change', toggleSizesSection);
    addSizeBtn.addEventListener('click', () => sizesListContainer.appendChild(createSizeRow()));

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