import { genRandValue } from "../utils/utils.js"
import { Point } from "./point.js";
import { Triangle } from "./triangle.js";
import { TexturePos } from "./texturepos.js";
import { TextureIndex } from "./textureindex.js";
import { LimbType } from "./limbtype.js";
export class Limb {
    constructor(startTriangle, offsetArray) {
        this.startTriangle = startTriangle;
        this.offsetArray = offsetArray;
    }

    limbConstructTriangle() {
        let curTri = this.startTriangle;
        let tris = [curTri];
        let offset, curTriPoints;

        for (let i = 0; i < this.offsetArray.length - 1; i++) {
            offset = this.offsetArray[i];
            curTriPoints = [curTri.point0, curTri.point1, curTri.point2];
            let triPoints = [];

            curTriPoints.forEach(c => {
                triPoints.push(
                    Point.create(
                        c.x + offset.x,
                        c.y + offset.y,
                        c.z + offset.z)
                );
            });

            const tri = Triangle.create(triPoints[0], triPoints[1], triPoints[2]);
            tris.push(tri);
            curTri = tri;
        }

        return tris;
    }

    /**
     * Goes through all segments of the limb and draws segments and tips accordingly
     */
    draw() {
        let baseTriangles = this.limbConstructTriangle();
        for (let i = 0; i < baseTriangles.length; i++) {
            if (i != baseTriangles.length - 1) {
                this.drawSegment(baseTriangles[i], baseTriangles[i + 1]);
            }
            else {
                this.drawTip(baseTriangles[i], this.offsetArray[i]);
            }
        }
    }

    findMidpoint(p0, p1) {
    return Point.create(
        (p0.x + p1.x) / 2,
        (p0.y + p1.y) / 2,
        (p0.z + p1.z) / 2);
    }

    /**
     * Draw a cone without a base at the end of the root, aka a tip
     * @param {Triangle} baseTri Base of the cone
     * @param {Point} tipPoint Tip point of the cone
     */
    drawTip(baseTri, tipPoint) {
        const baseTriPoints = [baseTri.point0, baseTri.point1, baseTri.point2];
        
        let midpointOfSide = this.findMidpoint(baseTriPoints[0], baseTriPoints[1]);
        let midpointOfTri = this.findMidpoint(baseTriPoints[2], midpointOfSide);

        midpointOfTri.x += tipPoint.x;
        midpointOfTri.y += tipPoint.y;
        midpointOfTri.z += tipPoint.z;

        for (let i = 0; i < 3; i++) {
            Triangle.create(midpointOfTri, baseTriPoints[i], baseTriPoints[(i + 1) % 3]).draw(TexturePos.BOTTOM, TextureIndex.Bark);
        }
    }

    /**
     * Draw the walls of a cylinder with a triangle base, aka a segment
     * @param {Triangle} curBaseTri Bottom base of the cylinder
     * @param {Triangle} nxtBaseTri Top base of the cylinder
     */
    drawSegment(curBaseTri, nxtBaseTri) {
        const curBaseTriPoints = [curBaseTri.point0, curBaseTri.point1, curBaseTri.point2];
        const nxtBaseTriPoints = [nxtBaseTri.point0, nxtBaseTri.point1, nxtBaseTri.point2];

        for (let i = 0; i < 3; i++) {
            Triangle.create(
                curBaseTriPoints[(i + 1) % 3],
                nxtBaseTriPoints[(i + 1) % 3],
                curBaseTriPoints[i]
            ).draw(TexturePos.TOP, TextureIndex.Bark);

            Triangle.create(
                nxtBaseTriPoints[i],
                curBaseTriPoints[i],
                nxtBaseTriPoints[(i + 1) % 3]
            ).draw(TexturePos.TOP, TextureIndex.Bark);
        }
    }

    /**
     * Draws all limbs in the limbs array
     * @param {Limb[]} limbs Array of limbs to draw 
     */
    static drawLimbs(limbs){
        for (let i = 0; i < limbs.length; i++){
            limbs[i].draw();
        }
        
        Triangle.renderBuffer(TextureIndex.Bark);
    }

    static makeOffsets(limbType) {
        let offsetArray = [];

        let numSeg = Math.round(genRandValue(1, 5));
        let randX, randY, randZ;
        let minX = -0.2, maxX = 0.2, minZ = -0.2, maxZ = 0.2;

        if (limbType === LimbType.Branch) {
            minX -= 0.1;
            maxX += 0.1;
            minZ -= 0.1;
            maxZ += 0.1;
        }

        for (let i = 0; i <= numSeg; i++) {
            randX = genRandValue(minX, maxX);
            randY = genRandValue(0.1, 0.5) * limbType;
            randZ = genRandValue(minZ, maxZ);
            let offsetPoint = Point.create([randX, randY, randZ]);
            offsetArray.push(offsetPoint);
        }

        return offsetArray;
    }

    //todo each section always goes out in the same dir
    /**
     * Decide which triangles will become limbs
     * @param {*} limbType Enum of Root or Branch, determines if yShift is +/-
     * @param {*} limbs Array of t/f, true if the triangle at that index will be a limb
     * @param {*} percentChance Percent chance that a triangle becomes a limb
     * @param {*} numTriangles Number of triangles in the object (not including shape tops)
     * @param {*} percentTriangles Percent of triangles that can be limbs
     * @param {*} texture Texture to map to the triangles
     */
    static decideLimbs(limbType, limbs, percentChance, numTriangles, percentTriangles) {
        const p = Math.round(numTriangles * percentTriangles)

        for (let i = 0; i < p; i++) {
            if (Math.random() < percentChance) { //todo tweak percentChance for number of triangles
                limbs.push(this.makeOffsets(limbType));
            }
            else {
                limbs.push(null);
            }
        }
    }
}