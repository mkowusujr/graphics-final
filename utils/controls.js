import { createScene } from "../tessMain.js";

const anglesReset = [0.0, 0.0, 0.0];
let angles = [...anglesReset];
let angleInc = 5.0;

const translationsReset = [0.0, 0.0, 0.25];
let translations = [...translationsReset];
let translationInc = 0.05;

export const getAngles = () => angles;
export const getTranslations = () => translations;

export function gotKey(event) {
	let key = event.key;
	let angleIndex = 0;
	let angleIncVal = 0;
	let translationIndex = 0;
	let translationIncVal = 0;
	switch (key) {
		// Increment rotation
		case 'i':
			angleIndex = 0;
			angleIncVal = angleInc;
			break;
		case 'k':
			angleIndex = 0;
			angleIncVal = -angleInc;
			break;
		case 'j':
			angleIndex = 1;
			angleIncVal = angleInc;
			break;
		case 'l':
			angleIndex = 1;
			angleIncVal = -angleInc;
			break;
		case 'u':
			angleIndex = 2;
			angleIncVal = angleInc;
			break;
		case 'o':
			angleIndex = 2;
			angleIncVal = -angleInc;
			break;
		// Increment position
		case 'a':
			translationIndex = 0;
			translationIncVal = -translationInc;
			break;
		case 'd':
			translationIndex = 0;
			translationIncVal = translationInc;
			break;
		case 'w':
			translationIndex = 1;
			translationIncVal = translationInc;
			break;
		case 's':
			translationIndex = 1;
			translationIncVal = -translationInc;
			break;
		case 'q':
			translationIndex = 2;
			translationIncVal = translationInc;
			break;
		case 'e':
			translationIndex = 2;
			translationIncVal = -translationInc;
			break;
		// Reset position and angle
		case 'r':
		case 'R':
			angles = [...anglesReset];
			translations = [...translationsReset];
			break;
	}
	angles[angleIndex] += angleIncVal;
	translations[translationIndex] += translationIncVal;
	if (translations[2] < translationInc) {
		translations[2] = translationInc;
	}

	// Draw the updated scene
	createScene();
}
