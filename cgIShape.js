let sin = (theta) => Math.sin(theta);
let cos = (theta) => Math.cos(theta);

//
// fill in code that creates the triangles for a cube with dimensions 1x1x1
// on each side (and t'he origin in the center of the cube). with an equal
// number of subdivisions along each cube face as given by the parameter
//subdivisions
//
function makeCube(subdivisions) {
    const depth = 0.5;
    const t = 1 / subdivisions;
    let u0, v0, u1, v1;

    for (let v = 0; v < subdivisions; v++) {
        v0 = v * t - depth;
        v1 = v0 + t; //(v + 1) * t - depth;

        for (let u = 0; u < subdivisions; u++) {
            u0 = u * t - depth;
            u1 = u0 + t; //(u + 1) * t - depth;

            // Draw Front Face Counterclockwise
            // first triangle points on quad in terms of u
            // (u0, v0), (u1, v1), (u0, v1)
            addTriangle(u0, v0, depth, u1, v0, depth, u0, v1, depth);
            addTriangle(u0, v1, depth, u1, v0, depth, u1, v1, depth);

            // Draw Left Face Counterclockwise
            addTriangle(-depth, u0, v1, -depth, u1, v0, -depth, u0, v0);
            addTriangle(-depth, u1, v1, -depth, u1, v0, -depth, u0, v1);

            // Draw Top Face Counterclockwise
            addTriangle(u0, depth, v1, u1, depth, v0, u0, depth, v0);
            addTriangle(u1, depth, v1, u1, depth, v0, u0, depth, v1);

            // Draw Rear Face Clockwise
            addTriangle(u1, v0, -depth, u0, v0, -depth, u0, v1, -depth);
            addTriangle(u1, v0, -depth, u0, v1, -depth, u1, v1, -depth);

            // Draw Right Face Clockwise
            addTriangle(depth, u1, v0, depth, u0, v1, depth, u0, v0);
            addTriangle(depth, u1, v0, depth, u1, v1, depth, u0, v1);

            // Draw Bottom Face Clockwise
            addTriangle(u1, -depth, v0, u0, -depth, v1, u0, -depth, v0);
            addTriangle(u1, -depth, v0, u1, -depth, v1, u0, -depth, v1);
        }
    }
}

//
// fill in code that creates the triangles for a cylinder with diameter 1
// and height of 1 (centered at the origin) with the number of subdivisions
// around the base and top of the cylinder (given by radialdivision) and
// the number of subdivisions along the surface of the cylinder given by
//heightdivision.
//
function makeCylinder(radialdivision, heightdivision) {
    const pi = 3.14;
    const radius = 0.5;
    const origin = 0;
    heightdivision = heightdivision < 1 ? 1 : heightdivision;
    radialdivision = radialdivision < 3 ? 3 : radialdivision;
    const t = 1 / heightdivision;
    let x0, x1, z0, z1, a0, a1, y0, y1;

    for (let r = 0; r < radialdivision; r++) {
        a0 = (r * 2 * pi) / radialdivision;
        a1 = ((r + 1) * 2 * pi) / radialdivision;
        x0 = radius * cos(a0);
        z0 = radius * sin(a0);
        x1 = radius * cos(a1);
        z1 = radius * sin(a1);

        // Draw Top Face
        addTriangle(x0, radius, z0, x1, radius, z1, origin, radius, origin);

        // Draw Bottom Face
        addTriangle(origin, -radius, origin, x1, -radius, z1, x0, -radius, z0);

        for (let y = 0; y < heightdivision; y++) {
            y0 = y * t - radius; //  height change
            y1 = y0 + t; //(y + 1) * t - depth; // half way

            addTriangle(x0, y0, z0, x1, y0, z1, x1, y1, z1);
            addTriangle(x0, y0, z0, x1, y1, z1, x0, y1, z0);
        }
    }
}

//
// fill in code that creates the triangles for a cone with diameter 1
// and height of 1 (centered at the origin) with the number of
// subdivisions around the base of the cone (given by radialdivision)
// and the number of subdivisions along the surface of the cone
//given by heightdivision.
//
function makeCone(radialdivision, heightdivision) {
    const pi = 3.14;
    const radius = 0.5;
    const origin = 0;
    heightdivision = heightdivision < 1 ? 1 : heightdivision;
    radialdivision = radialdivision < 3 ? 3 : radialdivision;
    const t = 1 / heightdivision;
    let x0, x1, z0, z1, x2, z2, x3, z3, a0, a1, radius2, y0, y1;

    for (let r = 0; r < radialdivision; r++) {
        a0 = (r * 2 * pi) / radialdivision;
        a1 = ((r + 1) * 2 * pi) / radialdivision;
        x0 = radius * cos(a0);
        z0 = radius * sin(a0);
        x1 = radius * cos(a1);
        z1 = radius * sin(a1);

        // Draw Bottom Face
        addTriangle(origin, -radius, origin, x1, -radius, z1, x0, -radius, z0);

        // Draw Side Face
        for (let y = 0; y < heightdivision; y++) {
            y0 = y * t - radius;
            y1 = y0 + t;

            if (y != heightdivision - 1) {
                radius2 = (radius - y1) / 2;
                x2 = radius2 * cos(a0);
                z2 = radius2 * sin(a0);
                x3 = radius2 * cos(a1);
                z3 = radius2 * sin(a1);

                addTriangle(x1, y0, z1, x3, y1, z3, x0, y0, z0);
                addTriangle(x2, y1, z2, x0, y0, z0, x3, y1, z3);

                // Remember Previous points to start from
                x0 = x2;
                z0 = z2;
                x1 = x3;
                z1 = z3;
            } else {
                // Draw Top Cone
                addTriangle(x1, y0, z1, origin, y1, origin, x0, y0, z0);
            }
        }
    }
}

//
// fill in code that creates the triangles for a sphere with diameter 1
// (centered at the origin) with number of slides (longitude) given by
// slices and the number of stacks (lattitude) given by stacks.
// For this function, you will implement the tessellation method based
// on spherical coordinates as described in the video (as opposed to the
//recursive subdivision method).
function makeSphere(slices, stacks) {
    slices = slices < 3 ? 3 : slices; // xs
    stacks = stacks < 3 ? 3 : stacks; // ys
    const pi = 3.14;
    const radius = 0.5;

    let latStep = pi / stacks;
    let lonStep = (2 * pi) / slices;

    let x0, y0, z0, x1, y1, z1, x2, y2, z2, x3, y3, z3, lon0, lat0, lon1, lat1;

    for (let y = 0; y < stacks; y++) {
        lat0 = y * latStep;
        lat1 = (y + 1) * latStep;
        for (let x = 0; x < slices; x++) {
            lon0 = x * lonStep;
            lon1 = (x + 1) * lonStep;

            x0 = radius * sin(lat0) * cos(lon0);
            y0 = radius * sin(lat0) * sin(lon0);
            z0 = radius * cos(lat0);

            x1 = radius * sin(lat0) * cos(lon1);
            y1 = radius * sin(lat0) * sin(lon1);
            z1 = radius * cos(lat0);

            x2 = radius * sin(lat1) * cos(lon0);
            y2 = radius * sin(lat1) * sin(lon0);
            z2 = radius * cos(lat1);

            x3 = radius * sin(lat1) * cos(lon1);
            y3 = radius * sin(lat1) * sin(lon1);
            z3 = radius * cos(lat1);

            addTriangle(x2, y2, z2, x0, y0, z0, x3, y3, z3);
            addTriangle(x0, y0, z0, x1, y1, z1, x3, y3, z3);
        }
    }
}

function radians(degrees)
{
  var pi = Math.PI;
  return degrees * (pi/180);
}

/**
 * Adds a triangle to the points array
 */
function addTriangle (x0,y0,z0,x1,y1,z1,x2,y2,z2) {
    const nverts = points.length / 4;
    const coords = [[x0, y0, z0], [x1, y1, z1], [x2, y2, z2]]
    const dim = [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]]

    // Push all vertices
    for (let i = 0; i < dim.length; i++){
        for (let j = 0; j < dim[i].length; j++){
            points.push(coords[i][j]);
            bary.push(dim[i][j]);
        }
        points.push(1.0);
        indices.push(nverts);
        nverts++;
    }
}
