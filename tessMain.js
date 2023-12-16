"use strict";
import { makeCylinder, makeHemisphere } from "./utils/shapes.js";
import { Point } from "./models/point.js";
import { Triangle } from "./models/triangle.js";
import { fragmentshader } from "./shaders/fragmentshader.gsls.js";
import { vertexshader } from "./shaders/vertexshader.gsls.js";
import { gotKey } from "./utils/controls.js";
import { LimbType } from "./models/limbtype.js";
import { genRandValue } from "./utils/utils.js";
import { Limb } from "./models/limb.js";
import { TextureIndex } from "./models/textureindex.js";

// Global variables that are set and used across the application
let canvas;
export let gl, program;

let uvs = [], indices = [], points = [];

export const getUVS = () => uvs;
export const getIndices = () => indices;
export const getPoints = () => points;
export function clearDataArrs(){
    uvs = [];
    indices = [];
    points = [];
}

// Other globals with default values;
var division1 = 10;
var division2 = 10;

// Setting up where the objects are displayed
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

const hemisphereNumTriangles = (division2 - 1) * division1 * 2 + division1;

const cylinderNumTriangles = division2 * division1 * 2;

let rootOffsets = []
let branchOffsets = []

Limb.decideLimbs(LimbType.Root, rootOffsets, .1, hemisphereNumTriangles, .30)
Limb.decideLimbs(LimbType.Branch, branchOffsets, .1, cylinderNumTriangles, .30)
const hemisphereStart = Math.round(hemisphereNumTriangles * .10);
const cylinderStart = Math.round(cylinderNumTriangles * .70) + division1;



export function createScene() {
    // Clear the scene
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    
    
    
    const branches = makeCylinder(division1, division2, originForTrunk, dimForTrunk, branchOffsets, cylinderStart);
    const roots = makeHemisphere(division1, division2, originForGround, dimForGround, rootOffsets, hemisphereStart);

    // Limb.drawLimbs(roots, );
    // Limb.drawLimbs(branches, ); //todo remember to set texture at beginning, draw at end and remove texture at end
}

// Given an id, extract the content's of a shader script
// from the DOM and return the compiled shader
function getShader(shadertype, shaderString) {
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
    program.aVertexTextureCoords = gl.getAttribLocation(program, 'aVertexTextureCoords');
    program.uSampler = gl.getUniformLocation(program, 'uSampler');
    program.aBary = gl.getAttribLocation(program, "bary");
    program.uTheta = gl.getUniformLocation(program, "theta");
    program.uTranslation = gl.getUniformLocation(program, "translation");

    createScene();
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
    // Set the clear color
    gl.clearColor(50/255, 151/255, 168/255, 1);

    // some GL initialization
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CCW);
    // gl.clearColor(0.0, 0.0, 0.0, 1.0); todo
    gl.depthFunc(gl.LEQUAL);
    gl.clearDepth(1.0);

    // init textures
    TextureIndex.setupTextures();

    // Read, compile, and link your shaders
    initProgram();
}

init();
