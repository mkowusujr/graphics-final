import {genRandValue} from "../utils/utils.js"
import { Point } from "./point.js";
export class Limb {
    constructor(startTriangle, offsetArray) {
        this.startTriangle = startTriangle;
        this.offsetArray = offsetArray;
    }

    limbConstructTriangle() {
        let curTri = this.startTriangle;
        let tris = [curTri];
        let offset, curTriPoints;

        for (i = 0; i < this.offsetArray.length - 1; i++) {
            offset = this.offsetArray[i];
            curTriPoints = [curTri.point0, curTri.point1, curTri.point2];
            let triPoints = [];

            curTriPoints.forEach(c => {
                triPoints.push([
                    Point.create(
                        c.x + offset.x,
                        c.y + offset.y,
                        c.z + offset.z)
                ]);
            });

            const tri = Triangle.create(triPoints);
            tris.push(tri);
            curTri = tri;
        }

        return tris;
    }

    draw() {
        let baseTriangles = limbConstructTriangle();
        for (let i = 0; i < baseTriangles.length; i++) {
            if (i != baseTriangles.length - 1) {
                drawSegment(baseTriangles[i], baseTriangles[i + 1]);
            }
            else {
                drawTip(baseTriangles[i], this.offsetArray[i]);
            }
        }
    }

    drawTip(baseTri, tipPoint) {
        const baseTriPoints = [baseTri.point0, baseTri.point1, baseTri.point2];
        for (let i = 0; i < 3; i++) {
            Triangle.create(tipPoint, baseTriPoints[i], baseTriPoints[(i + 1) % 3]).draw();
        }
    }

    drawSegment(curBaseTri, nxtBaseTri) {
        const curBaseTriPoints = [curBaseTri.point0, curBaseTri.point1, curBaseTri.point2];
        const nxtBaseTriPoints = [nxtBaseTri.point0, nxtBaseTri.point1, nxtBaseTri.point2];

        for (let i = 0; i < 3; i++) {
            Triangle.create(
                curBaseTriPoints[(i + 1) % 3],
                nxtBaseTriPoints[(i + 1) % 3],
                curBaseTriPoints[i]
            ).draw();

            Triangle.create(
                nxtBaseTriPoints[i],
                curBaseTriPoints[i],
                nxtBaseTriPoints[(i + 1) % 3]
            ).draw();
        }
    }

    static makeOffsets(limbType) {
        let offsetArray = [];

        let randX = genRandValue(-0.3, 0.3);
        let randY = genRandValue(0.1, 0.3) * limbType;
        let randZ = genRandValue(-0.3, 0.3);
        let numSeg = Math.round(genRandValue(1, 2));

        for (let i = 0; i <= numSeg; i++) {
            let offsetPoint = Point.create([randX, randY, randZ]);
            offsetArray.push(offsetPoint);
        }

        return offsetArray;
    }

    //todo probably decide num segments here too, each section always goes out in the same dir
    //todo clean up like everything :(
    /**
     * Decide which triangles will become limbs
     * @param {*} limbType Enum of Root or Branch, determines if yShift is +/-
     * @param {*} limbs Array of t/f, true if the triangle at that index will be a limb
     * @param {*} percentChance Percent chance that a triangle becomes a limb
     * @param {*} numTriangles Number of triangles in the object (not including shape tops)
     * @param {*} percentTriangles Percent of triangles that can be limbs
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