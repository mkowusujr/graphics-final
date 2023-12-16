/**
 * Generates a number between min and max
 * @param {Number} min Minimum number
 * @param {Number} max Maximum number
 * @returns {Number} Random number between min and max
 */
export const genRandValue = (min, max) => Math.random() * (max - min) + min;