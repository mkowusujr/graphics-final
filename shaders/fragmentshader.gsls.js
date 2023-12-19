export const fragmentshader =
    `#version 300 es
        precision mediump float;
        uniform sampler2D uSampler;
        in vec3 vbc;
        in vec2 vTextureCoords;
        out vec4 fragColor;

    void main(void) {
        fragColor = texture(uSampler, vTextureCoords);
    }
`;
