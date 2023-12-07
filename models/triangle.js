import { Point } from "./point.js";
import { getBaryArr, getIndices, getPointsArr } from "../tessMain.js";
export class Triangle {
	constructor(point0, point1, point2) {
		this.point0 = point0;
		this.point1 = point1;
		this.point2 = point2;
	}

	static create(p0, p1, p2)
	{
		if (p1 == null && p2 == null)
		{
			return this.createWithArray(p0)
		} else {
			return this.createWithPoints(p0, p1, p2);
			}
	}

	static createWithPoints(p0, p1, p2) {
		return new Triangle(p0, p1, p2);
	}

	// takes in a list of nine values
	static createWithArray(ps) {
		let p0 = Point.create(ps.slice(0, 3));
		let p1 = Point.create(ps.slice(3, 6));
		let p2 = Point.create(ps.slice(6, 9));
		return new Triangle(p0, p1, p2);
	}

	draw() {
		let points = getPointsArr()
		let bary = getBaryArr()
		let indices = getIndices();
//
		let nverts = points.length / 4;
		const coords = [
			this.point0.toList(), //[x0, y0, z0],
			this.point1.toList(), //[x1, y1, z1],
			this.point2.toList(), //[x2, y2, z2],
		];
		const dim = [
			[1.0, 0.0, 0.0],
			[0.0, 1.0, 0.0],
			[0.0, 0.0, 1.0],
		];

		// Push all vertices
		for (let i = 0; i < dim.length; i++) {
			for (let j = 0; j < dim[i].length; j++) {
				points.push(coords[i][j]);
				bary.push(dim[i][j]);
			}
			points.push(1);
			indices.push(nverts);
			nverts++;
		}
	}
}