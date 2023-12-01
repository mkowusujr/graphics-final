//todo remove once all shape code is updated to use a given origin
const pi = Math.PI;
let sin = (theta) => Math.sin(theta);
let cos = (theta) => Math.cos(theta);
let normalizeX = (x) => x//(x / canvas.width) * 2 - 1,
normalizeY = (y) => y//1 - (y / canvas.height) * 2, // Invert y to match the canvas coordinate system
normalizeZ = (z) => z//(z / canvas.height) * 2 - 1;



class Triangle {
    constructor(point0, point1, point2) {
        this.point0 = point0;
        this.point1 = point1;
        this.point2 = point2;
    }

    static create(p0, p1, p2) {
        return new Triangle(p0, p1, p2);
    }

    // takes in a list of nine values
    static create(points) {
        let p0 = Point.create(points.slice(0, 3));
        let p1 = Point.create(points.slice(3, 6));
        let p2 = Point.create(points.slice(6, 9));
        return new Triangle(p0, p1, p2);
    }

    draw() {
        let nverts = points.length / 4;
        const coords = [
            this.point0.toList(), //[x0, y0, z0],
            this.point1.toList(), //[x1, y1, z1],
            this.point2.toList(), //[x2, y2, z2],
        ];
        const dim = [
            [1.0, 0.0, 0.0],
            [0.0, 1.0, 0.0],
            [0.0, 0.0, 1.0],
        ];

        // Push all vertices
        for (let i = 0; i < dim.length; i++) {
            for (let j = 0; j < dim[i].length; j++) {
                points.push(coords[i][j]);
                bary.push(dim[i][j]);
            }
            points.push(1);
            indices.push(nverts);
            nverts++;
        }
    }
}

class Point {
    constructor(x, y, z) {
        this.x = normalizeX(x);
        this.y = normalizeY(y);
        this.z = normalizeZ(z);
    }
    static create(x, y, z) {
        return new new Point(x, y, z)();
    }
    static create(coords) {
        return new Point(coords[0], coords[1], coords[2]);
    }
    toList() {
        return [this.x, this.y, this.z];
    }
}


//
// fill in code that creates the triangles for a cube with dimensions 1x1x1
// on each side (and the origin in the center of the cube). with an equal
// number of subdivisions along each cube face as given by the parameter
//subdivisions
//
function makeCube(subdivisions, origin, dim) {
    const depth = 0.5 + origin.x;
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
            Triangle.create([u0, v0, depth, u1, v0, depth, u0, v1, depth]).draw()
            Triangle.create([u0, v1, depth, u1, v0, depth, u1, v1, depth]).draw()

            // Draw Left Face Counterclockwise
            Triangle.create([-depth, u0, v1, -depth, u1, v0, -depth, u0, v0]).draw()
            Triangle.create([-depth, u1, v1, -depth, u1, v0, -depth, u0, v1]).draw()

            // Draw Top Face Counterclockwise
            Triangle.create([u0, depth, v1, u1, depth, v0, u0, depth, v0]).draw()
            Triangle.create([u1, depth, v1, u1, depth, v0, u0, depth, v1]).draw()

            // Draw Rear Face Clockwise
            Triangle.create([u1, v0, -depth, u0, v0, -depth, u0, v1, -depth]).draw()
            Triangle.create([u1, v0, -depth, u0, v1, -depth, u1, v1, -depth]).draw()

            // Draw Right Face Clockwise
            Triangle.create([depth, u1, v0, depth, u0, v1, depth, u0, v0]).draw()
            Triangle.create([depth, u1, v0, depth, u1, v1, depth, u0, v1]).draw()

            // Draw Bottom Face Clockwise
            Triangle.create([u1, -depth, v0, u0, -depth, v1, u0, -depth, v0]).draw()
            Triangle.create([u1, -depth, v0, u1, -depth, v1, u0, -depth, v1]).draw()
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
function makeCylinder(radialdivision, heightdivision, origin, dim) {
    heightdivision = heightdivision < 1 ? 1 : heightdivision;
    radialdivision = radialdivision < 3 ? 3 : radialdivision;
    const r = 0.5;
    const t = 1 / heightdivision;
    const beta = 2 * pi / radialdivision;
    for(let i = 0; i < radialdivision; i++){
        const theta0 = i * beta;
        const theta1 = theta0 + beta;
        const x0 = r * Math.cos(theta0);
        const y0 = r * Math.sin(theta0);
        const x1 = r * Math.cos(theta1);
        const y1 = r * Math.sin(theta1);

        for (let u = 0; u < heightdivision; u++){
            let z0 = -r + u * t;
            let z1 = z0 + t;

            let triange1 = Triangle.create([origin.x + x0, origin.y + y0, origin.z + z0, origin.x + x0, origin.y + y0, origin.z + z1, origin.x + x1, origin.y + y1, origin.z + z0])
            let triange2 = Triangle.create([origin.x + x1, origin.y + y1, origin.z + z1, origin.x + x1, origin.y + y1, origin.z + z0, origin.x + x0, origin.y + y0, origin.z + z1])

            triange1.draw()
            triange2.draw()
        }

        // Draw Top Face
        Triangle.create([origin.x + x1, origin.y + y1, origin.z -r, origin.x, origin.y, origin.z -r, origin.x + x0, origin.y + y0, origin.z -r]).draw()

        // Draw Bottom Face
        Triangle.create([origin.x + x1, origin.y + y1, origin.z + r, origin.x + x0, origin.y + y0, origin.z + r, origin.x, origin.y, origin.z + r]).draw()
    }
}

//
// fill in code that creates the triangles for a cone with diameter 1
// and height of 1 (centered at the origin) with the number of
// subdivisions around the base of the cone (given by radialdivision)
// and the number of subdivisions along the surface of the cone
//given by heightdivision.
//
function makeCone(radialdivision, heightdivision, origin) {
    const pi = 3.14;
    const radius = 0.5;
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
        let bottomTriangle = Triangle.create([origin.x, -radius, origin.z, x1, -radius, z1, x0, -radius, z0])
        bottomTriangle.draw()

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

                let sideTriangle0 = Triangle.create([x1, y0, z1, x3, y1, z3, x0, y0, z0]);

                let sideTriangle1 = Triangle.create([x2, y1, z2, x0, y0, z0, x3, y1, z3])

                sideTriangle0.draw()
                sideTriangle1.draw()

                // Remember Previous points to start from
                x0 = x2;
                z0 = z2;
                x1 = x3;
                z1 = z3;
            } else {
                // Draw Top Cone
                let topTriangle = Triangle.create([x1, y0, z1, origin.x, y1, origin.z, x0, y0, z0])
                topTriangle.draw()
            }
        }
    }
}

/**
 * Creates a hemisphere centered at origin.x, origin.y, origin.z,
 * with slices vertical sub-divisions and stacks horizontal sub-divisions
 * @param {*} slices Vertical slices
 * @param {*} stacks Horizontal slices
 * @param {*} origin Point object of the hemisphere's origin point
 */
function makeHemisphere(slices, stacks, origin, dim) { //TODO look deeper at how origin point is affecting moving the object
    slices = slices < 3 ? 3 : slices;
    stacks = stacks < 4 ? 4 : stacks % 2 == 1 ? stacks++ : stacks;
    // const dim = 1;
    const r =  0.5; // TODO remove
    const latStep = pi / (stacks * 2);
    const lonStep = (2 * pi) / slices;

    for (let i = 0; i <= stacks; i++) {
        var lat0 = i * latStep;
        var lat1 = lat0 + latStep;

        for (let j = 0; j < slices; j++) {
            var lon0 = j * lonStep;
            var lon1 = lon0 + lonStep;

            let coords = HemisphereCalculator(lat0, lat1, lon0, lon1, r, origin, dim);

            if (i == 0) {
                // Draw Top
                let triangle = Triangle.create([coords.x3, coords.y3, coords.z1, coords.x2, coords.y2, coords.z1, origin.x, origin.y, origin.z + r* dim.z]);

                triangle.draw();
            } else if (i == stacks) {
                // Draw Base
                let triangle = Triangle.create([coords.x0, coords.y0, coords.z0, coords.x1, coords.y1, coords.z0, origin.x, origin.y, origin.z
                ]);

                triangle.draw();
            } else {
                // Draw Sides
                let triangle0 = Triangle.create([coords.x1, coords.y1, coords.z0, coords.x3, coords.y3, coords.z1, coords.x0, coords.y0, coords.z0
                ]);

                let triangle1 = Triangle.create([coords.x2, coords.y2, coords.z1, coords.x0, coords.y0, coords.z0, coords.x3, coords.y3, coords.z1
                ]);

                triangle0.draw();
                triangle1.draw();
            }
        }
    }
}

/**
 * Calculates all current points for the hemisphere
 * @param {*} lat0 Current lat
 * @param {*} lat1 Next lat
 * @param {*} lon0 Current lon
 * @param {*} lon1 Next lon
 * @param {*} r Objects radius
 * @param {*} origin Point object of the hemisphere's origin point
 * @returns All 10 coordinates
 */
function HemisphereCalculator(lat0, lat1, lon0, lon1, r, origin, dim) {
    const rsinlat0 = r * sin(lat0)
    const rsinlat1 = r * sin(lat1) 

    const sinlon0 = sin(lon0) * dim.y
    const sinlon1 = sin(lon1) * dim.y

    const coslon0 = cos(lon0) * dim.x
    const coslon1 = cos(lon1) * dim.x
    return {
        x0: origin.x + rsinlat0 * coslon0,
        y0: origin.y + rsinlat0 * sinlon0,
        z0: origin.z + r * cos(lat0) * dim.z,
        x1: origin.x + rsinlat0 * coslon1,
        y1: origin.y + rsinlat0 * sinlon1,
        z1: origin.z + r * cos(lat1) * dim.z,
        x2: origin.x + rsinlat1 * coslon0,
        y2: origin.y + rsinlat1 * sinlon0,
        x3: origin.x + rsinlat1 * coslon1,
        y3: origin.y + rsinlat1 * sinlon1,
    };
}

function radians(degrees) {
    var pi = Math.PI;
    return degrees * (pi / 180);
}
