/**
 * @file Pricing rules for configurable products.
 * Pure functions with no DOM access. They mirror the server's calculation
 * (services/order.service.js) so the page can show a live price; the
 * server recalculates on checkout.
 */

/**
 * Returns the number of choices the selected size allows in an option group.
 * Applies only to groups marked limitedBySize (e.g. flavors), and only when
 * the size defines maxChoices. Mirrors getSizeLimit on the server.
 * @param {Object} group - Option group ({ limitedBySize, maxChoices, pricePer, ... }).
 * @param {Object|null} size - The selected size, or null.
 * @returns {number|null} The limit, or null when the size does not limit the group.
 */
export const getSizeLimit = (group, size) =>
    group.limitedBySize && size?.maxChoices ? size.maxChoices : null;

/**
 * Returns how many choices in a group are included in the base price.
 * @param {Object} group - Option group.
 * @param {Object|null} size - The selected size, or null.
 * @returns {number} Number of free choices.
 */
export const getIncluded = (group, size) => getSizeLimit(group, size) ?? group.maxChoices;

/**
 * Calculates the price of a single unit for the given selections:
 * the size price (or the product price when there is no size), plus
 * `pricePer` for every choice beyond the included amount in each group.
 * @param {Object} product - Product with populated `options`.
 * @param {Object|null} size - The selected size, or null.
 * @param {Map<string, Set<string>>} selections - Option group id to selected choices.
 * @returns {number} Unit price.
 */
export const calcUnitPrice = (product, size, selections) => {
    let price = size ? size.price : product.price;
    product.options.forEach(group => {
        const chosenCount = selections.get(group._id)?.size ?? 0;
        const extra = Math.max(0, chosenCount - getIncluded(group, size));
        price += group.pricePer * extra;
    });
    return price;
};