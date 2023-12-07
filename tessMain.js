"use strict";
import { makeCylinder, makeHemisphere, makeLimbs, trianglesForBranches, trianglesForRoots } from "./utils/shapes.js";
import { Point } from "./models/point.js";
import { fragmentshader } from "./shaders/fragmentshader.gsls.js";
import { vertexshader } from "./shaders/vertexshader.gsls.js";
import { getAngles, getTranslations, gotKey } from "./utils/controls.js";
import { LimbTypes } from "./models/limbtypes.js";
import { Triangle } from "./models/triangle.js"; //todo remove

// Global variables that are set and used
// across the application
let gl, program, points, bary, indices, canvas;
export const getPointsArr = () => points;
export const getBaryArr = () => bary;
export const getIndices = () => indices;

// VAO stuff
var myVAO = null;
var myVertexBuffer = null;
var myBaryBuffer = null;
var myIndexBuffer = null;

// Other globals with default values;
var division1 = 25;
var division2 = 10;
var updateDisplay = true;

// Setting up where the objects are displayed
export const genRandValue = (min, max) => Math.random() * (max - min) + min;

let dimForGround = { x: 1,y: 1, z: 1 };
let originForGround = Point.create([0, 0, 0]);
let dimForTrunk = { x: 1, y: 1, z: 1};

let minX = -(originForGround.x + dimForGround.x - dimForTrunk.x / 1.5),
    maxX = originForGround.x + dimForGround.x - dimForTrunk.x / 1.5;
let randX = genRandValue(minX, maxX);

let minZ = -(originForGround.z + dimForGround.z - dimForTrunk.z / 1.5),
    maxZ = originForGround.z + dimForGround.z - dimForTrunk.z / 1.5;
let randZ = genRandValue(minZ, maxZ);

let originForTrunk = Point.create([
    originForGround.x + randX,
    originForGround.y + dimForTrunk.y / 2,
    originForGround.z + randZ,
]);

const cylinderNumTriangles = 0; //todo
const hemisphereNumTriangles = (division2 - 1) * division1 * 2 + division1
const bottomThird = Math.round(hemisphereNumTriangles * 0.3)
let roots = [];
let rootShifts = [];
for(let i = 0; i < bottomThird; i++){ //todo make this a function
    if (Math.random() < 0.1){ //todo tweak this num for numer of triangles
        roots.push(true);
        rootShifts.push(genRandValue(-0.3, 0.3)); //TODO tweak all of these to give good results
        rootShifts.push(LimbTypes.Root * Math.random()); //TODO Make it tend downwards if root, up if branch (I think I did this)
        rootShifts.push(genRandValue(-0.3, 0.3));
    }
    else{
        roots.push(false);
    }
}

// Given an id, extract the content's of a shader script
// from the DOM and return the compiled shader
function getShader(shadertype, shaderString) {
    // const script = document.getElementById(id);
    // const shaderString = script.text.trim();

    // Assign shader depending on the type of shader
    let shader;
    if (shadertype === "vertex-shader") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else if (shadertype === "fragment-shader") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else {
        return null;
    }

    // Compile the shader using the supplied shader code
    gl.shaderSource(shader, shaderString);
    gl.compileShader(shader);

    // Ensure the shader is valid
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

// Create a program with the appropriate vertex and fragment shaders
function initProgram() {
    const vertexShader = getShader("vertex-shader", vertexshader);
    const fragmentShader = getShader("fragment-shader", fragmentshader);

    // Create a program
    program = gl.createProgram();
    // Attach the shaders to this program
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Could not initialize shaders");
    }

    // Use this program instance
    gl.useProgram(program);
    // We attach the location of these shader values to the program instance
    // for easy access later in the code
    program.aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
    program.aBary = gl.getAttribLocation(program, "bary");
    program.uTheta = gl.getUniformLocation(program, "theta");
    program.uTranslation = gl.getUniformLocation(program, "translation");
}

function createScene() {
    // bool flag to determine when to draw branches/roots
    const rootTriangles = makeHemisphere(division1, division2, originForGround, dimForGround, roots);
    makeCylinder(division1, division2, originForTrunk, dimForTrunk);

    // makeLimbs(trianglesForBranches, LimbTypes.Branch);
    // console.log(rootTriangles) //todo delete
    // console.log(rootShifts) //todo delete
    makeLimbs(rootTriangles, LimbTypes.Root, rootShifts);

    // Test triangle
    // var test = Triangle.create(
    //     [
    //         0.0, 0.0, 0.0, // y
    //         1.0, 0.0, 0.0,
    //         0.0, 0.0, 1.0 // towards us
    //     ])
    // test.draw()
    // makeLimbs([test], LimbTypes.Root, rootShifts);
}

// general call to make and bind a new object based on current
// settings..Basically a call to shape specfic calls in cgIshape.js
export function createNewShape() {
    // clear your points and elements
    points = [];
    indices = [];
    bary = [];

    createScene();

    //create and bind VAO
    if (myVAO == null) myVAO = gl.createVertexArray();
    gl.bindVertexArray(myVAO);

    // create and bind vertex buffer
    if (myVertexBuffer == null) myVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, myVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(program.aVertexPosition);
    gl.vertexAttribPointer(program.aVertexPosition, 4, gl.FLOAT, false, 0, 0);

    // create and bind bary buffer
    if (myBaryBuffer == null) myBaryBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, myBaryBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bary), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(program.aBary);
    gl.vertexAttribPointer(program.aBary, 3, gl.FLOAT, false, 0, 0);

    // uniform values
    gl.uniform3fv(program.uTheta, new Float32Array(getAngles()));
    gl.uniform3fv(program.uTranslation, new Float32Array(getTranslations()));

    // Setting up the IBO
    if (myIndexBuffer == null) myIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, myIndexBuffer);
    gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices),
        gl.STATIC_DRAW
    );

    // Clean
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    // indicate a redraw is required.
    updateDisplay = true;
}

// We call draw to render to our canvas
export function draw() {
    // Clear the scene
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Bind the VAO
    gl.bindVertexArray(myVAO);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, myIndexBuffer);

    // Draw to the scene using triangle primitives
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    // Clean
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}

// Entry point to our application
function init() {
    // Retrieve the canvas
    canvas = document.getElementById("webgl-canvas");
    if (!canvas) {
        console.error(`There is no canvas with id ${"webgl-canvas"} on this page.`);
        return null;
    }

    // Set the canvas to the size of the screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // deal with keypress
    window.addEventListener("keydown", gotKey, false);

    // Retrieve a WebGL context
    gl = canvas.getContext("webgl2");
    // Set the clear color to be black
    gl.clearColor(0, 0, 0, 1);

    // some GL initialization
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CCW);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.depthFunc(gl.LEQUAL);
    gl.clearDepth(1.0);

    // Read, compile, and link your shaders
    initProgram();

    // create and bind your current object
    createNewShape();

    // do a draw
    draw();
}

init();
