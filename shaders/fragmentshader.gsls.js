export const fragmentshader =
	`#version 300 es
				precision mediump float;
				
				in vec3 vbc;

				// Color that is the result of this shader
				out vec4 fragColor;

	void main(void) {
		fragColor = vec4(0.5, 0.5, 0.5, 1.0);
		// if on the edge, draw black, otherwsie, draw grey
		if (vbc.x < 0.01 || vbc.y < 0.01 || vbc.z < 0.01) {
			fragColor = vec4(1.0, 1.0, 1.0, 1.0);
		}
	}
`;