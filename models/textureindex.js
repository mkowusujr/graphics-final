import { Triangle } from "./triangle.js";
export class TextureIndex {
	static Bark = -1;
	static Dirt = -1;


	static async setupTexture0() {
		await Triangle.setupTexture("./shaders/bark.jpg");

		TextureIndex.Bark = TextureIndex.Dirt == -1 ?
			0
			:
			TextureIndex.Dirt + 1;
	}

	static async setupTexture1() {
		await Triangle.setupTexture("./shaders/dirt.jpg");

		TextureIndex.Dirt = TextureIndex.Bark == -1 ?
			0
			:
			TextureIndex.Bark + 1;
	}

	static async setupTextures() {
		await TextureIndex.setupTexture0();
		await TextureIndex.setupTexture1();
	}
}