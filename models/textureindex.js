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