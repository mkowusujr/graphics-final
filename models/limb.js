import { genRandValue } from "../utils/utils.js"
import { Point } from "./point.js";
import { Triangle } from "./triangle.js";
import { TexturePos } from "./texturepos.js";
import { TextureIndex } from "./textureindex.js";
import { LimbType } from "./limbtype.js";
export class Limb {
    static RootMinX = -0.2;
    static RootMaxX = 0.2;
    static RootMinZ = -0.2;
    static RootMaxZ = 0.2;
    static RootMaxY = 0.3;

    static BranchMinX = -0.3;
    static BranchMaxX = 0.3;
    static BranchMinZ = 0.3;
    static BranchMaxZ = 0.3;
    static BranchMaxY = 0.5;

    static minY = 0.1;

    constructor(startTriangle, offsetArray) {
        this.startTriangle = startTriangle;
        this.offsetArray = offsetArray;
    }

    constructTriangles() {
        let curTri = this.startTriangle;
        let tris = [curTri];
        let offset, curTriPoints;

        for (let i = 0; i < this.offsetArray.length - 1; i++) {
            offset = this.offsetArray[i];
            curTriPoints = [
                curTri.point0,
                curTri.point1,
                curTri.point2
            ];

            let triPoints = [];

            curTriPoints.forEach(c => {
                triPoints.push(
                    Point.create(
                        c.x + offset.x,
                        c.y + offset.y,
                        c.z + offset.z)
                );
            });

            const tri = Triangle.create(
                triPoints[0],
                triPoints[1],
                triPoints[2]
            );

            tris.push(tri);
            curTri = tri;
        }

        return tris;
    }

    /**
     * Goes through all segments of the limb and draws segments and tips accordingly
     */
    draw() {
        let baseTriangles = this.constructTriangles();
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
            Triangle.create(
                midpointOfTri,
                baseTriPoints[i],
                baseTriPoints[(i + 1) % 3]
            ).draw(TexturePos.BOTTOM, TextureIndex.Bark);
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

    /**
     * Calculates the xyz offsets for the limbs 1 point per segment + 1.
     * Each segment will be a triangular prism,
     * after the last segment will be a triangular pyramid.
     * Also determines how many segments
     * @param {LimbType} limbType Enum of Root or Branch
     * @returns Array of limb offsets
     */
    static makeOffsets(limbType) {
        let offsetArray = [];

        let numSeg = Math.round(genRandValue(1, 5));
        let randX, randY, randZ, minX, maxX, maxY, minZ, maxZ;

        if (limbType === LimbType.Root) {
            minX = Limb.RootMinX;
            maxX = Limb.RootMaxX;
            maxY = Limb.RootMaxY;
            minZ = Limb.RootMinZ;
            maxZ = Limb.RootMaxZ;
        }
        else {
            minX = Limb.BranchMinX;
            maxX = Limb.BranchMaxX;
            maxY = Limb.BranchMaxY;
            minZ = Limb.BranchMinZ;
            maxZ = Limb.BranchMaxZ;
        }

        for (let i = 0; i <= numSeg; i++) {
            randX = genRandValue(minX, maxX);
            randY = genRandValue(Limb.minY, maxY) * limbType;
            randZ = genRandValue(minZ, maxZ);
            let offsetPoint = Point.create([randX, randY, randZ]);
            offsetArray.push(offsetPoint);
        }

        return offsetArray;
    }

    /**
     * Decide which triangles will become limbs
     * @param {LimbType} limbType Enum of Root or Branch
     * @param {Array<Array<Point>|null>} limbs Array of if a triangle should be added to the return array
     *                                         if null, do not add, if array add it
     * @param {number} percentChance Percent chance that a triangle becomes a limb
     * @param {number} numTriangles Number of triangles in the object
     * @param {number} percentTriangles Percent of triangles that can be limbs
     */
    static decideLimbs(limbType, limbs, percentChance, numTriangles, percentTriangles) {
        const p = Math.round(numTriangles * percentTriangles)

        for (let i = 0; i < p; i++) {
            if (Math.random() < percentChance) {
                limbs.push(this.makeOffsets(limbType));
            }
            else {
                limbs.push(null);
            }
        }
    }
}