export class Point {
	constructor(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}
	static create(x, y, z) {
		return new Point(x, y, z)();
	}
	static create(coords) {
		return new Point(coords[0], coords[1], coords[2]);
	}
	toList() {
		return [this.x, this.y, this.z];
	}
}