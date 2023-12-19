import { Triangle } from "./triangle.js";
export class TextureIndex {
	static Bark = -1;
	static Dirt = -1;
	static Grass = -1;
	static textureIndices = [
		TextureIndex.Bark,
		TextureIndex.Dirt,
		TextureIndex.Grass];
	static texturePaths = [
		"./shaders/bark.jpg",
		"./shaders/dirt.jpg",
		"./shaders/grass.jpg"];


	static async setupTexture0() {
		await Triangle.setupTexture("./shaders/bark.jpg");
		TextureIndex.Grass = Math.max([TextureIndex.Bark, TextureIndex.Dirt]) + 1;

	}

	static async setupTexture1() {
		await Triangle.setupTexture("./shaders/dirt.jpg");

		TextureIndex.Dirt = TextureIndex.Bark == -1 ?
			0
			:
			TextureIndex.Bark + 1;
	}

	static async setupTexture2() {
		await Triangle.setupTexture("./shaders/grass.jpg");

		TextureIndex.Dirt = TextureIndex.Bark == -1 ?
			0
			:
			TextureIndex.Bark + 1;
	}


	static async setupTextures() {
		for (let i = 0; i < TextureIndex.textureIndices.length; i++){
			await Triangle.setupTexture(TextureIndex.texturePaths[i]);
			let ts = [...TextureIndex.textureIndices]
			delete ts[i]
			ts = ts.filter(t => t.length !== 0);
			TextureIndex.textureIndices[i] =
				Math.max(...ts) + 1;
		}

		TextureIndex.Bark = TextureIndex.textureIndices[0];
		TextureIndex.Dirt = TextureIndex.textureIndices[1];
		TextureIndex.Grass = TextureIndex.textureIndices[2];
	}
}