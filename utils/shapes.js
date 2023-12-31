import { Triangle } from "../models/triangle.js";
import { Limb } from "../models/limb.js"
import { TexturePos } from "../models/texturepos.js";
import { TextureIndex } from "../models/textureindex.js";
import { Point } from "../models/point.js";
const pi = Math.PI;
let sin = (theta) => Math.sin(theta);
let cos = (theta) => Math.cos(theta);

/**
 * Creates a cylinder centered at origin.x, y, z,
 * with radial divisions and vertical divisions.
 * Dim affects the stretch of the object in the x, y, & z directions seperately
 * @param {Number} radialdivision Vertical divisions
 * @param {Number} heightdivision Horizontal divisions
 * @param {Point} origin Cylinder's origin
 * @param {Map<Symbol, Number>} dim Scalars for x, y, & z
 * @param {Array<Array<Point>|null>} branchOffsets Array of if a triangle should be added to the return array
 * @param {Number} cylinderStart First index where a branch can appear
 * @returns {Array<Limb>} Array of limb objects to draw as branches
 */
export function makeCylinder(radialdivision, heightdivision, origin, dim, branchOffsets, cylinderStart) {
    let triangleIndex = 0;
    let branches = [];
    
    heightdivision = heightdivision < 1 ? 1 : heightdivision;
    radialdivision = radialdivision < 3 ? 3 : radialdivision;
    const r = { x: dim.x / 2, y: dim.y / 2, z: dim.z / 2 };
    const t = dim.y / heightdivision;
    const beta = 2 * pi / radialdivision;
    let x0, x1, z0, z1;

    for (let u = -1; u <= heightdivision; u++) {
        let y0 = origin.y - (r.y) + u * t;
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
            
                triangleIndex = checkDraw(triangleIndex, branches, branchOffsets, tBottom, cylinderStart, TexturePos.BOTTOM, TextureIndex.Bark);
            } 
            else if (u == heightdivision)
            {
                // Draw Top Face
                let tTop = Triangle.create([
                    origin.x, origin.y + r.y, origin.z,
                    x1, origin.y + r.y, z1,
                    x0, origin.y + r.y, z0]);
                triangleIndex = checkDraw(triangleIndex, branches, branchOffsets, tTop, cylinderStart, TexturePos.TOP, TextureIndex.Bark);
            }
            else 
            {
                let triangle1 = Triangle.create([
                        x0, y0, z0,
                        x0, y1, z0,
                        x1, y0, z1]);
                
                triangleIndex = checkDraw(triangleIndex, branches, branchOffsets, triangle1, cylinderStart, TexturePos.TOP, TextureIndex.Bark);
    
                let triangle2 = Triangle.create([
                        x1, y1, z1,
                        x1, y0, z1,
                        x0, y1, z0]);
                
                triangleIndex = checkDraw(triangleIndex, branches, branchOffsets, triangle2, cylinderStart, TexturePos.BOTTOM, TextureIndex.Bark);
            }
        } 
    }
    
    Triangle.renderBuffer(TextureIndex.Bark);
    return branches;
}

/**
 * Creates a hemisphere centered at origin.x, y, z,
 * with slices vertical sub-divisions and stacks horizontal sub-divisions.
 * Dim affects the stretch of the object in the x, y, & z directions seperately
 * @param {Number} slices Vertical slices
 * @param {Number} stacks Horizontal slices
 * @param {Point} origin Hemisphere's origin
 * @param {Map<Symbol, Number>} dim Map of scalars for x, y, & z
 * @param {Array<Array<Point>|null>} rootOffsets Array of if a triangle should be added to the return array
 * @param {Number} hemisphereStart First index where a root can appear
 * @returns {Array<Limb>} Array of limb objects to draw as roots
 */
export function makeHemisphere(slices, stacks, origin, dim, rootOffsets, hemisphereStart) {
    let triangleIndex = 0;
    let roots = [];

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
                        origin.x, origin.y - r * dim.y, origin.z,
                    coords.x3, coords.y1, coords.z3]);
                triangleIndex = checkDraw(triangleIndex, roots, rootOffsets, t, hemisphereStart, TexturePos.BOTTOM, TextureIndex.Dirt);

            } else if (i == stacks) {
                // Draw Base (Top)
                Triangle.create([
                        coords.x1, coords.y0, coords.z1,
                        origin.x, origin.y, origin.z,
                    coords.x0, coords.y0, coords.z0,]).draw(TexturePos.TOP, TextureIndex.Grass);
                Triangle.pushToTopTexture();

            } else {
                // Draw Sides
                let triangle1 = Triangle.create([
                        coords.x1, coords.y0, coords.z1,
                        coords.x3, coords.y1, coords.z3,
                        coords.x0, coords.y0, coords.z0]);
                triangleIndex = checkDraw(triangleIndex, roots, rootOffsets, triangle1, hemisphereStart, TexturePos.TOP, TextureIndex.Dirt);

                let triangle2 = Triangle.create([
                        coords.x2, coords.y1, coords.z2,
                        coords.x0, coords.y0, coords.z0,
                        coords.x3, coords.y1, coords.z3]);
                triangleIndex = checkDraw(triangleIndex, roots, rootOffsets, triangle2, hemisphereStart, TexturePos.BOTTOM, TextureIndex.Dirt);
                if (i == stacks -1 && j == slices -1)
                {
                    Triangle.renderBuffer(TextureIndex.Dirt);
                }
            }
        }
    }
    
    Triangle.renderBuffer(TextureIndex.Grass);
    return roots;
}

/**
 * Calculates all current points for the hemisphere
 * @param {Number} lat0 Current lat
 * @param {Number} lat1 Next lat
 * @param {Number} lon0 Current lon
 * @param {Number} lon1 Next lon
 * @param {Number} r Object's radius
 * @param {Point} origin Hemisphere's origin
 * @returns {Map<Symbol, Number>} 10 coordinates
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
 * if it is a limb, add it to the limbs array
 * if it is not a limb, draw it
 * @param {Number} triangleIndex Index of the current triangle
 * @param {Array<Triangle>} limbs Triangles that are limbs
 * @param {Array<Array<Point>|null>} limbsDecide Array of if a triangle should be added to the limbs array
 * @param {Triangle} t Triangle to add/draw
 * @param {Number} startRange First index where a limb can appear
 * @param {Enumerator} texturePos Position of what points to push for the texture
 * @returns {Number} The updated index for the limbsDecide array
 */
function checkDraw(triangleIndex, limbs, limbsDecide, t, startRange, texturePos, textureIndex) {
    if (triangleIndex < startRange + limbsDecide.length && triangleIndex >= startRange) {
        if (limbsDecide[triangleIndex - startRange] !== null){
            let limb = new Limb(t, limbsDecide[triangleIndex - startRange]);
            limbs.push(limb);
        }
        else{
            t.draw(texturePos, textureIndex);
        }
        return triangleIndex + 1;
    }
    else{
        t.draw(texturePos, textureIndex);
    }
    return triangleIndex + 1;
}
