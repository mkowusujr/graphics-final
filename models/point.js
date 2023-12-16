export class Point {
	/**
	 * Creates a Point, only called from Point.create()
	 * @param {Number} x X-coordinate
	 * @param {Number} y Y-coordinate
	 * @param {Number} z Z-coordinate
	 */
	constructor(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	/**
	 * Creates a Point given an x,y,z
	 * @param {Number} x X-coordinate
	 * @param {Number} y Y-coordinate
	 * @param {Number} z Z-coordinate
	 * @returns {Point} The new Point
	 */
	static create(x, y, z) {
		return new Point(x, y, z)();
	}

	/**
	 * Creates a Point given an array of x,y,z
	 * @param {Array<Number>} coords Array containing x,y,z
	 * @returns {Point} The new Point
	 */
	static create(coords) {
		return new Point(coords[0], coords[1], coords[2]);
	}

	/**
	 * Convert the Point to an array
	 * @returns {Array<Number>} The array
	 */
	toArr() {
		return [this.x, this.y, this.z];
	}
}
