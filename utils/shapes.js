import { Triangle } from "../models/triangle.js";
import { Point } from "../models/point.js";
import { LimbTypes } from "../models/limbtypes.js";

const pi = Math.PI;
let sin = (theta) => Math.sin(theta);
let cos = (theta) => Math.cos(theta);

export let trianglesForBranches = []
export let trianglesForRoots = []
//
// fill in code that creates the triangles for a cylinder with diameter 1
// and height of 1 (centered at the origin) with the number of subdivisions
// around the base and top of the cylinder (given by radialdivision) and
// the number of subdivisions along the surface of the cylinder given by
//heightdivision.
//
export function makeCylinder(radialdivision, heightdivision, origin, dim) {
    heightdivision = heightdivision < 1 ? 1 : heightdivision;
    radialdivision = radialdivision < 3 ? 3 : radialdivision;
    const r = { x: dim.x / 2, y: dim.y / 2, z: dim.z / 2 };
    const t = 1 / heightdivision;
    const beta = 2 * pi / radialdivision;

    for (let i = 0; i < radialdivision; i++) {
        const theta0 = i * beta;
        const theta1 = theta0 + beta;
        const x0 = origin.x + r.x * sin(theta0);
        const z0 = origin.z + r.z * cos(theta0);
        const x1 = origin.x + r.x * sin(theta1);
        const z1 = origin.z + r.z * cos(theta1);

        for (let u = 0; u < heightdivision; u++) {
            let y0 = origin.y + - r.y + u * t;
            let y1 = y0 + t;

            let triangle1 = Triangle.create(
                [
                    x0, y0, z0,
                    x0, y1, z0,
                    x1, y0, z1
                ]);
            let triangle2 = Triangle.create(
                [
                    x1, y1, z1,
                    x1, y0, z1,
                    x0, y1, z0]);

            let decisionFactor = 0.15
            let triangles = { t1: triangle1, t2: triangle2 }
            decideLimb(
                u,
                heightdivision,
                decisionFactor,
                triangles,
                LimbTypes.Branch
            );
        }

        // // Draw Top Face
        Triangle.create(
            [
                x1, origin.y - r.y, z1,
                origin.x, origin.y - r.y, origin.z,
                x0, origin.y - r.y, z0
            ]
        ).draw();

        // // Draw Bottom Face
        Triangle.create(
            [
                x1, origin.y + r.y, z1,
                x0, origin.y + r.y, z0,
                origin.x, origin.y + r.y, origin.z
            ]
        ).draw();
    }
}


/**
 * Creates a hemisphere centered at origin.x, origin.y, origin.z,
 * with slices vertical sub-divisions and stacks horizontal sub-divisions
 * @param {*} slices Vertical slices
 * @param {*} stacks Horizontal slices
 * @param {*} origin Point object of the hemisphere's origin point
 */
export function makeHemisphere(slices, stacks, origin, dim) {
    slices = slices < 3 ? 3 : slices;
    stacks = stacks < 4 ? 4 : stacks % 2 == 1 ? stacks++ : stacks;
    const r = 1;
    const latStep = pi / (stacks * 2);
    const lonStep = (2 * pi) / slices;

    for (let i = 0; i <= stacks; i++) { // up and down
        var lat0 = i * latStep;
        var lat1 = lat0 + latStep;

        for (let j = 0; j < slices; j++) { // left and right
            var lon0 = j * lonStep;
            var lon1 = lon0 + lonStep;

            let coords = HemisphereCalculator(lat0, lat1, lon0, lon1, r, origin, dim);

            if (i == 0) {
                // // Draw Bottom
                Triangle.create(
                    [
                        coords.x2, coords.y1, coords.z2,
                        origin.x, origin.y - r, origin.z,
                        coords.x3, coords.y1, coords.z3
                    ]
                ).draw();
            } else if (i == stacks) {
                // Draw Base (Top)
                Triangle.create(
                    [
                        coords.x1, coords.y0, coords.z1,
                        origin.x, origin.y, origin.z,
                        coords.x0, coords.y0, coords.z0,
                    ]
                ).draw();
            } else {
                // Draw Sides
                let triangle1 = Triangle.create(
                    [
                        coords.x1, coords.y0, coords.z1,
                        coords.x3, coords.y1, coords.z3,
                        coords.x0, coords.y0, coords.z0
                    ]);

                let triangle2 = Triangle.create(
                    [
                        coords.x2, coords.y1, coords.z2,
                        coords.x0, coords.y0, coords.z0,
                        coords.x3, coords.y1, coords.z3
                    ]);

                let decisionFactor = 0.15
                let triangles = { t1: triangle1, t2: triangle2 }
                decideLimb(
                    i,
                    stacks,
                    decisionFactor,
                    triangles,
                    LimbTypes.Root
                );
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
 * @param {*} r Object's radius
 * @param {*} origin Point object of the hemisphere's origin point
 * @returns Map of 10 coordinates
 */
function HemisphereCalculator(lat0, lat1, lon0, lon1, r, origin, dim) {
    const rsinlat0 = r * sin(lat0);
    const rsinlat1 = r * sin(lat1);

    const sinlon0 = sin(lon0) * dim.z;
    const sinlon1 = sin(lon1) * dim.z;

    const coslon0 = cos(lon0) * dim.x;
    const coslon1 = cos(lon1) * dim.x;

    return {
        x0: origin.x + rsinlat0 * coslon0,
        z0: origin.z + rsinlat0 * sinlon0,
        y0: origin.y - r * cos(lat0) * dim.y,
        x1: origin.x + rsinlat0 * coslon1,
        z1: origin.z + rsinlat0 * sinlon1,
        y1: origin.y - r * cos(lat1) * dim.y,
        x2: origin.x + rsinlat1 * coslon0,
        z2: origin.z + rsinlat1 * sinlon0,
        x3: origin.x + rsinlat1 * coslon1,
        z3: origin.z + rsinlat1 * sinlon1,
    };
}

function decideLimb(index, heightdivision, decisionFactor, triangles, limbType) {
    decisionFactor *= 100;
    let decision = Math.floor(Math.random() * 100);
    let shouldSelectTopTriange = decision % 2 == 0
    
    let start = Math.floor((heightdivision / 1.5));
    
    if (limbType == LimbTypes.Branch) {
        if (start <= index && decision < decisionFactor)
        {
            if (shouldSelectTopTriange) {
                trianglesForBranches.push(triangles.t2);
            } else {
                trianglesForBranches.push(triangles.t1);
            }
        } else {
            triangles.t1.draw();
            triangles.t2.draw();
        }
    } else {
        if (index <= start && decision < decisionFactor) {
            if (shouldSelectTopTriange) {
                trianglesForRoots.push(triangles.t2);
            } else {
                trianglesForRoots.push(triangles.t1);
            }
        } else {
            triangles.t1.draw();
            triangles.t2.draw();
        }
    }
}

/**
 * Create the branches/roots
 * @param {*} triangles Array of triangles to make branches from
 * @param {*} limbType Enum of branch or root
 */
export function makeLimbs(triangles, limbType) {
    for (var i = 0; i < triangles.length; i++) {
        makeLimb(triangles[i], limbType);
    }
}

function makeLimb(triangle, limbType) {
    const sides = 3;
    // 1 or 2
    const numSegments = Math.round(Math.random() + 1);
    // Draw segments
    for (let i = 0; i <= numSegments; i++) {
        const xShift = Math.random(); //TODO tweak all of these to give good results
        const yShift = limbType * Math.random(); //TODO Make it tend downwards if root, up if branch (I think I did this)
        const zShift = Math.random();

        const points = [];
        const tpoints = [triangle.point0, triangle.point1, triangle.point1];
        for (let j = 0; j < sides; j++) {
            const pointCoords = [tpoints[j].x + xShift, tpoints[j].y + yShift, tpoints[j].z + zShift];
            points[j] = Point.create(pointCoords);
        }

        for (let j = 0; j < sides; j++) {
            let k = tpoints.length - 1;
            if (i != numSegments) {
                // Draw sides
                Triangle.create(tpoints[j], points[j], tpoints[k]).draw();
                Triangle.create(points[k], tpoints[k], points[i]).draw();
                k = j - 1;
            }
            else {
                // Draw tip
                //TODO find the mid point of the triangle, then shift that point
                // Triangle.create().draw();
            }
        }
        if (i != numSegments) {
            triangle = Point.create(points); //TODO remember to not draw this triangle
        }
    }
}