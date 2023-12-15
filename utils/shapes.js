import { Triangle } from "../models/triangle.js";
import { Point } from "../models/point.js";
import { LimbType } from "../models/limbtype.js";
import { Limb } from "../models/limb.js"
import { TexturePos } from "../models/texturepos.js";
const pi = Math.PI;
let sin = (theta) => Math.sin(theta);
let cos = (theta) => Math.cos(theta);

export let trianglesForBranches = []
export let trianglesForRoots = []

/**
 * Creates a cylinder centered at origin.x, y, z,
 * with radial divisions and vertical divisions.
 * Dim affects the stretch of the object in the x, y, & z directions seperately
 * @param {*} radialdivision Vertical divisions
 * @param {*} heightdivision Horizontal divisions
 * @param {*} origin Point object of the hemisphere's origin point
 * @param {*} dim Map of scalars for x, y, & z
 */ //todo add the branches input array and return the branch triangle array
export function makeCylinder(radialdivision, heightdivision, origin, dim, branchOffset, cylinderStart) {
    let counter = 0; //todo rename?
    let branches = []; //todo rename?
    
    heightdivision = heightdivision < 1 ? 1 : heightdivision;
    radialdivision = radialdivision < 3 ? 3 : radialdivision;
    const r = { x: dim.x / 2, y: dim.y / 2, z: dim.z / 2 };
    const t = 1 / heightdivision;
    const beta = 2 * pi / radialdivision;
    let x0, x1, z0, z1;

    for (let u = -1; u <= heightdivision; u++) {
        let y0 = origin.y - r.y + u * t;
        let y1 = y0 + t;

        for (let i = 0; i < radialdivision; i++) {
            const theta0 = i * beta;
            const theta1 = theta0 + beta;
            x0 = origin.x + r.x * sin(theta0);
            z0 = origin.z + r.z * cos(theta0);
            x1 = origin.x + r.x * sin(theta1);
            z1 = origin.z + r.z * cos(theta1);

            if (u == -1)
            {
                // Draw Bottom Face
                let tBottom = Triangle.create([
                    x0, origin.y - r.y, z0,
                    x1, origin.y - r.y, z1,
                origin.x, origin.y - r.y, origin.z]);
            
                counter = checkDraw(counter, branches, branchOffset, tBottom, cylinderStart, TexturePos.BOTTOM);
            } 
            else if (u == heightdivision)
            {
                // Draw Top Face
                let tTop = Triangle.create([
                    origin.x, origin.y + r.y, origin.z,
                x1, origin.y + r.y, z1,
                x0, origin.y + r.y, z0]);
                counter = checkDraw(counter, branches, branchOffset, tTop, cylinderStart, TexturePos.TOP);
            }
            else 
            {
                let triangle1 = Triangle.create([
                        x0, y0, z0,
                        x0, y1, z0,
                        x1, y0, z1]);
                
                counter = checkDraw(counter, branches, branchOffset, triangle1, cylinderStart, TexturePos.TOP);
    
                let triangle2 = Triangle.create([
                        x1, y1, z1,
                        x1, y0, z1,
                        x0, y1, z0]);
                
                counter = checkDraw(counter, branches, branchOffset, triangle2, cylinderStart, TexturePos.BOTTOM);
            }
        }
    }
}

/**
 * Creates a hemisphere centered at origin.x, y, z,
 * with slices vertical sub-divisions and stacks horizontal sub-divisions.
 * Dim affects the stretch of the object in the x, y, & z directions seperately
 * @param {*} slices Vertical slices
 * @param {*} stacks Horizontal slices
 * @param {*} origin Point object of the hemisphere's origin point
 * @param {*} dim Map of scalars for x, y, & z
 * @param {*} rootOffsets Array of if a triangle should be added to the return array
 * @returns Array of limbs to draw as roots
 */ //todo update doc comment
export function makeHemisphere(slices, stacks, origin, dim, rootOffsets, hemisphereStart) {
    let counter = 0; //todo rename?
    let roots = []; //todo rename?

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
                // Draw Bottom
                let t = Triangle.create([
                        coords.x2, coords.y1, coords.z2,
                        origin.x, origin.y - r, origin.z,
                    coords.x3, coords.y1, coords.z3]);
                counter = checkDraw(counter, roots, rootOffsets, t, hemisphereStart, TexturePos.BOTTOM);

            } else if (i == stacks) {
                // Draw Base (Top)
                Triangle.create([
                        coords.x1, coords.y0, coords.z1,
                        origin.x, origin.y, origin.z,
                    coords.x0, coords.y0, coords.z0,]).draw();
                Triangle.pushToTopTexture();
            } else {
                // Draw Sides
                let triangle1 = Triangle.create([
                        coords.x1, coords.y0, coords.z1,
                        coords.x3, coords.y1, coords.z3,
                        coords.x0, coords.y0, coords.z0]);
                counter = checkDraw(counter, roots, rootOffsets, triangle1, hemisphereStart, TexturePos.TOP);

                let triangle2 = Triangle.create([
                        coords.x2, coords.y1, coords.z2,
                        coords.x0, coords.y0, coords.z0,
                        coords.x3, coords.y1, coords.z3]);
                counter = checkDraw(counter, roots, rootOffsets, triangle2, hemisphereStart, TexturePos.BOTTOM);
            }
        }
    }
    return roots;
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

/**
 * Check if a triangle is supposed to be a limb or not,
 * if it is a limb, add it to the limbTirangles array
 * if it is not a limb, draw it
 * @param {*} counter Current index in limbs
 * @param {*} limbs Array of triangles that are limbs
 * @param {*} limbsDecide Array of if a triangle should be added to the limbTriangles array
 * @param {*} t Triangle to add/draw
 * @param {*} texturePos Enum position of what points to push for the texture
 * @returns The updated index for the roots array
 */ //todo update the doc comment
function checkDraw(counter, limbs, limbsDecide, t, startRange, texturePos) {
    let isTexturePushed = true;
    if (counter < startRange + limbsDecide.length && counter >= startRange) {
        if (limbsDecide[counter - startRange] !== null){
            let limb = new Limb(t, limbsDecide[counter - startRange]);
            limbs.push(limb);
            isTexturePushed = false;
        }
        else{
            t.draw();
        }
        return counter + 1;
    }
    else{
        t.draw();
    }
    if (isTexturePushed)
    {
        switch (texturePos)
        {
            case "TOP":
                Triangle.pushToTopTexture();
                break;
            case "BOTTOM":
                Triangle.pushToBottomTexture();
                break;
            case "BOTH":
                Triangle.pushToBothTexture();
                break;
        }
    }
    
    return counter + 1;
}

/**
//  * Makes a single limb (root/branch)
//  * @param {*} triangle Base triangle to start from
//  * @param {*} rootShifts Array of x, y, & z amounts to shift the base triangle by
//  */
// function makeLimb(triangle, rootShifts) {
//     const sides = 3;
//     const numSegments = Math.round(Math.random() + 1); // 1 or 2 //todo probably change to mat's func
//     // Draw segments
//     for (let i = 0; i <= numSegments; i++) {
//         const points = [];
//         const tpoints = [triangle.point0, triangle.point1, triangle.point1];
        
//         for (let j = 0; j < sides; j++) {
//             const pointCoords = [tpoints[j].x + rootShifts[i * sides], tpoints[j].y + rootShifts[i * sides + 1], tpoints[j].z + rootShifts[i * sides + 2]];
//             points[j] = Point.create(pointCoords);
//         }

//         for (let j = 0; j < sides; j++) {
//             let k = tpoints.length - 1;
//             if (i != numSegments) {
//                 // Draw sides
//                 Triangle.create(tpoints[j], tpoints[k], points[j]).draw();
//                 Triangle.create(points[k], points[i], tpoints[k]).draw();
//                 k = j - 1;
//             }
//             else {
//                 // Draw tip
//                 //TODO find the mid point of the triangle, then shift that point
//                 // Triangle.create().draw();
//             }
//         }
//         if (i != numSegments) {
//             triangle = Triangle.create(points); //TODO remember to not draw this triangle
//         }
//     }
// }