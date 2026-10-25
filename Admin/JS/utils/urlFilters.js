/**
 * @file Keeps the filters of an admin page (a search box and selects) in the
 * page URL, e.g. admin-orders.html?q=cohen&status=pending. Refreshing the
 * page, going back to it or sharing its link shows the same filtered list.
 */

/**
 * A filter control and the URL parameter that stores its value.
 * @typedef {Object} UrlFilter
 * @property {HTMLInputElement|HTMLSelectElement} element - The search box or select.
 * @property {string} param - The URL parameter, e.g. 'q'.
 * @property {string} defaultValue - The value that means "no filter"; it is not written to the URL.
 */

/**
 * Fills each filter from the URL. A value the control cannot hold (for
 * example an unknown option in a select) falls back to the default.
 * @param {Array<UrlFilter>} filters - The page's filters.
 */
const readFiltersFromUrl = (filters) => {
    const params = new URLSearchParams(window.location.search);
    filters.forEach(({ element, param, defaultValue }) => {
        const value = params.get(param) ?? defaultValue;
        element.value = value;
        if (element.value !== value) element.value = defaultValue;
    });
};

/**
 * Writes the filters' current values to the URL without reloading the page
 * or adding a history entry. Empty and default values are removed.
 * @param {Array<UrlFilter>} filters - The page's filters.
 */
const writeFiltersToUrl = (filters) => {
    const url = new URL(window.location.href);
    filters.forEach(({ element, param, defaultValue }) => {
        const value = element.value.trim();
        if (value && value !== defaultValue) url.searchParams.set(param, value);
        else url.searchParams.delete(param);
    });
    window.history.replaceState(null, '', url);
};

/**
 * Connects a page's filters to the URL: fills them from the URL, and on
 * every change (or reset) updates the URL and calls onChange to re-render.
 * Search boxes update on every keystroke; selects update on change.
 * @param {Object} config - The filters' configuration.
 * @param {Array<UrlFilter>} config.filters - The page's filters.
 * @param {function(): void} config.onChange - Re-renders the list with the current filters.
 * @param {HTMLButtonElement} [config.resetButton] - Clears all filters when clicked.
 */
const initUrlFilters = ({ filters, onChange, resetButton }) => {
    readFiltersFromUrl(filters);
    const applyChange = () => {
        writeFiltersToUrl(filters);
        onChange();
    };
    filters.forEach(({ element }) => {
        element.addEventListener(element.tagName === 'SELECT' ? 'change' : 'input', applyChange);
    });
    resetButton?.addEventListener('click', () => {
        filters.forEach(({ element, defaultValue }) => { element.value = defaultValue; });
        applyChange();
    });
};

export default initUrlFilters;