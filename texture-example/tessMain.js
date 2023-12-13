  'use strict';

  // Global variables that are set and used
  // across the application
  let gl,
    program,
    points,
    texture,
    indices,
    uvs;
  
  // VAO stuff
  var myVAO = null;
  var myVertexBuffer = null;
  var myUVBuffer = null;
  var myIndexBuffer = null;
    
  // Other globals with default values;
  var division1 = 3;
  var division2 = 1;
  var updateDisplay = true;
  var anglesReset = [30.0, 30.0, 0.0];
  var angles = [30.0, 30.0, 0.0];
  var angleInc = 5.0;
  
  // Shapes we can draw
  var SQUARE = 1;
  var curShape = SQUARE;

  // Given an id, extract the content's of a shader script
  // from the DOM and return the compiled shader
  function getShader(id) {
    const script = document.getElementById(id);
    const shaderString = script.text.trim();

    // Assign shader depending on the type of shader
    let shader;
    if (script.type === 'x-shader/x-vertex') {
      shader = gl.createShader(gl.VERTEX_SHADER);
    }
    else if (script.type === 'x-shader/x-fragment') {
      shader = gl.createShader(gl.FRAGMENT_SHADER);
    }
    else {
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
    const vertexShader = getShader('vertex-shader');
    const fragmentShader = getShader('fragment-shader');

    // Create a program
    program = gl.createProgram();
    // Attach the shaders to this program
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
      
      // link program
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Could not initialize shaders');
    }

    // Use this program instance
    gl.useProgram(program);
    // We attach the location of these shader values to the program instance
    // for easy access later in the code
    program.aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
    // set up texture location info
    program.aVertexTextureCoords = gl.getAttribLocation(program, 'aVertexTextureCoords');
    program.uSampler = gl.getUniformLocation(program, 'uSampler');
    // set up angle uniform
    program.uTheta = gl.getUniformLocation(program, 'theta');
    
    // set up texture and image load and value
    texture = gl.createTexture();
      const image = new Image();

    // this approach can be used to load multiple files - just note it's async and needs
    // to call whatever happens after the files get loaded
    // you can load them into an array and use promises if you want as well
    // just look up using promises
   (async () => { 
       image.src = 'webgl.png'; // note: file in same dir as other files for program
       await image.decode();
       // img is ready to use: this console write is left here to help
       // others with potential debugging when changing this function
       console.log(`width: ${image.width}, height: ${image.height}`);
       gl.bindTexture(gl.TEXTURE_2D, texture);
       gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
       gl.bindTexture(gl.TEXTURE_2D, null);
       // create and bind your current object
       createNewShape();
       // do a draw
       draw();
      })();

     
  }

  // general call to make and bind a new object based on current
  // settings..Basically a call to shape specfic calls in cgIshape.js
  function createNewShape() {
      
      // clear your points and elements
      points = [];
      indices = [];
      uvs = [];

      // make your shape based on type
      if (curShape == SQUARE) makeSquare ();
      else
          console.error(`Bad object type`);
          
      //create and bind VAO
      if (myVAO == null) myVAO = gl.createVertexArray();
      gl.bindVertexArray(myVAO);
      
      // create and bind vertex buffer
      if (myVertexBuffer == null) myVertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, myVertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(program.aVertexPosition);
      gl.vertexAttribPointer(program.aVertexPosition, 4, gl.FLOAT, false, 0, 0);
      
      // create and bind uv buffer
      if (myUVBuffer == null) myUVBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, myUVBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(program.aVertexTextureCoords);
      // note that texture uv's are 2d, which is why there's a 2 below
      gl.vertexAttribPointer(program.aVertexTextureCoords, 2, gl.FLOAT, false, 0, 0);

      // uniform values
      gl.uniform3fv (program.uTheta, new Float32Array(angles));
     
      // Setting up the IBO
      if (myIndexBuffer == null) myIndexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, myIndexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

      // Clean
      gl.bindVertexArray(null);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
          
      // indicate a redraw is required.
      updateDisplay = true;
  }

  // We call draw to render to our canvas
  function draw() {
    // Clear the scene
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Bind the VAO
    gl.bindVertexArray(myVAO);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, myIndexBuffer);

    // bind the texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(program.uSampler, 0);

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
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas) {
      console.error(`There is no canvas with id ${'webgl-canvas'} on this page.`);
      return null;
    }

    // deal with keypress
    window.addEventListener('keydown', gotKey ,false);

    // Retrieve a WebGL context
    gl = canvas.getContext('webgl2');
    // Set the clear color to be black
    gl.clearColor(0, 0, 0, 1);
      
    // some GL initialization
    // these var's are necessary for texturing:
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    //
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CCW);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);

    // Read, compile, and link your shaders
    initProgram();
    // note: initProgram has an async file read that will finish last 
    // and it will need to call the rest of the functions for showing the texture without an
    // extra load/draw after it loads.
    
  }
