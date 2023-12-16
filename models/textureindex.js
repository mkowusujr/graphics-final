import { Triangle } from "./triangle.js";
export class TextureIndex {
	static Bark = -1;
	static Dirt = -1;


	static setupTexture0() {
		Triangle.setupTexture("./shaders/bark.jpg");

		TextureIndex.Bark = TextureIndex.Dirt == -1 ?
			0
			:
			TextureIndex.Dirt + 1;
	}

	static setupTexture1() {
		Triangle.setupTexture("./shaders/dirt.jpg");

		TextureIndex.Dirt = TextureIndex.Bark == -1 ?
			0
			:
			TextureIndex.Bark + 1;
	}

	static setupTextures() {
		TextureIndex.setupTexture0();
		TextureIndex.setupTexture1();
	}
}