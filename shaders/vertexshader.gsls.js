export const vertexshader =
  `#version 300 es
      in vec4 aVertexPosition;
      in vec3 bary;
      uniform vec3 theta;
      uniform vec3 translation;

      out vec3 vbc;

      void main()
      {
        // Compute the sines and cosines of each rotation
        // about each axis
        vec3 angles = theta * (3.14/180.0);
        vec3 c = cos(angles);
        vec3 s = sin(angles);
        vec3 tsc = translation;

        // rotation matrices
        mat4 rx = mat4 (1.0,  0.0,  0.0,  0.0,
                        0.0,  c.x,  s.x,  0.0,
                        0.0, -s.x,  c.x,  0.0,
                        0.0,  0.0,  0.0,  1.0);

        mat4 ry = mat4 (c.y,  0.0, -s.y,  0.0,
                        0.0,  1.0,  0.0,  0.0,
                        s.y,  0.0,  c.y,  0.0,
                        0.0,  0.0,  0.0,  1.0);

        mat4 rz = mat4 (c.z,  s.z,  0.0,  0.0,
                        -s.z,  c.z,  0.0,  0.0,
                        0.0,  0.0,  1.0,  0.0,
                        0.0,  0.0,  0.0,  1.0);

        mat4 tscxyz = mat4 (tsc[2], 0.0, 0.0, tsc[0],
                          0.0, tsc[2], 0.0, tsc[1],
                          0.0, 0.0, tsc[2], 0.0/*tsc[2]*/,//TODO tsc[2]
                          0.0, 0.0, 0.0, 1.0);
        gl_Position = rz * ry * rx * aVertexPosition * tscxyz;
        vbc = bary;
      }
`;