import { Point } from "./point.js";
import { gl, program } from "../tessMain.js";
import { getAngles, getTranslations } from "../utils/controls.js";
import { getIndices, getPoints, getUVS, clearDataArrs } from "../tessMain.js";
// VAO stuff
var myVAO = null;
var myVertexBuffer = null;
var myUVBuffer = null;
var myIndexBuffer = null;


export class Triangle {
	static texture;
	static textures = [];

	constructor(point0, point1, point2) {
		this.point0 = point0;
		this.point1 = point1;
		this.point2 = point2;
	}

	static create(p0, p1, p2) {
		if (p1 == null && p2 == null) {
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

	draw(texturePos, textureIndex) {
		let points = getPoints();
		switch (texturePos) {
			case "TOP":
				Triangle.pushToTopTexture();
				break;
			case "BOTTOM":
				Triangle.pushToBottomTexture();
				break;
			case "BOTH":
				Triangle.pushToBothTexture();
				break;
		}
		this.setupDataBuffers();
		if (points.length >= 1000 * 3) {
			Triangle.renderBuffer(textureIndex);
		}
	}

	static renderBuffer(textureIndex) {
		Triangle.setupDrawingBuffers();
		Triangle.renderTriangle(textureIndex);

		clearDataArrs();
	}

	setupDataBuffers() {
		let points = getPoints();
		let indices = getIndices();
		let nverts = points.length / 4;
		const coords = [
			this.point0.toArr(), //[x0, y0, z0],
			this.point1.toArr(), //[x1, y1, z1],
			this.point2.toArr() //[x2, y2, z2],
		];

		// Push all vertices
		for (let i = 0; i < coords.length; i++) {
			for (let j = 0; j < coords[i].length; j++) {
				points.push(coords[i][j]);
			}
			points.push(1);
			indices.push(nverts);
			nverts++;
		}
	}

	static  async setupTexture(textureFile) {
			let texture = gl.createTexture();
			const textureImg = new Image();

			textureImg.src = textureFile;
			await textureImg.decode();

			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImg);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

			Triangle.textures.push(texture);
	}

	static setupDrawingBuffers() {
		let points = getPoints();
		let indices = getIndices();
		let uvs = getUVS();
		//create and bind VAO
		if (myVAO == null) myVAO = gl.createVertexArray();
		gl.bindVertexArray(myVAO);

		// create and bind vertex buffer
		if (myVertexBuffer == null) myVertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, myVertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
		gl.enableVertexAttribArray(program.aVertexPosition);
		gl.vertexAttribPointer(program.aVertexPosition, 4, gl.FLOAT, false, 0, 0);

		if (myUVBuffer == null) myUVBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, myUVBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);
		gl.enableVertexAttribArray(program.aVertexTextureCoords);
		// note that texture uv's are 2d, which is why there's a 2 below
		gl.vertexAttribPointer(program.aVertexTextureCoords, 2, gl.FLOAT, false, 0, 0);

		// uniform values
		gl.uniform3fv(program.uTheta, new Float32Array(getAngles()));
		gl.uniform3fv(program.uTranslation, new Float32Array(getTranslations()));

		// Setting up the IBO
		if (myIndexBuffer == null) myIndexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, myIndexBuffer);
		gl.bufferData(
			gl.ELEMENT_ARRAY_BUFFER,
			new Uint16Array(indices),
			gl.STATIC_DRAW
		);

		// Clean
		gl.bindVertexArray(null);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	}

	static renderTriangle(textureIndex) {
		let indices = getIndices();
		

		// Bind the VAO
		gl.bindVertexArray(myVAO);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, myIndexBuffer);

		// bind the texture
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, Triangle.textures[textureIndex]);
		gl.uniform1i(program.uSampler, 0);

		// Draw to the scene using triangle primitives
		gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

		// Clean
		gl.bindVertexArray(null);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	}

	static pushToTopTexture() {
		let uvs = getUVS();
		uvs.push(0.0);
		uvs.push(1.0);
		uvs.push(1.0);
		uvs.push(.0);
		uvs.push(1.0);
		uvs.push(1.0);
	}

	static pushToBottomTexture() {
		let uvs = getUVS();
		uvs.push(0.0);
		uvs.push(1.0);
		uvs.push(0.0);
		uvs.push(0.0);
		uvs.push(1.0);
		uvs.push(0.0);
	}

	static pushToBothTexture() {
		this.pushToTopTexture();
		this.pushToBottomTexture();
	}
}