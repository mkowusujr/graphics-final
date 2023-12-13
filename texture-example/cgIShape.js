//
// fill in code that creates the triangles for a square with dimensions 1x1x1
// on each side (and the origin in the center of the square). 
//
function makeSquare ()  {
    // note: subdivisions is never less than 1 from program call
    let i = 0;
    let j = 0;
    let offset = 1;
    let startPosition = -0.5;
    let minPos1 = startPosition;
    let maxPos1 = startPosition + offset;
    let minPos2 = startPosition;
    let maxPos2 = startPosition + offset;

    // add front
    addTriangle(minPos1, maxPos2, 0.5, maxPos1, minPos2, 0.5, maxPos1, maxPos2, 0.5);
    // note that the uv's define the vertex point extents for the texturing
    // so min is 0.0 and the max extent is 1.0
    uvs.push(0.0);
    uvs.push(1.0);
    uvs.push(1.0);
    uvs.push(0.0);
    uvs.push(1.0);
    uvs.push(1.0);

    addTriangle(minPos1, maxPos2, 0.5, minPos1, minPos2, 0.5, maxPos1, minPos2, 0.5);
    uvs.push(0.0);
    uvs.push(1.0);
    uvs.push(0.0);
    uvs.push(0.0);
    uvs.push(1.0);
    uvs.push(0.0);
}


function addTriangle(x0, y0, z0, x1, y1, z1, x2, y2, z2) {
    var nverts = points.length / 4;

    // push first vertex
    points.push(x0); 
    points.push(y0); 
    points.push(z0); 
    points.push(1.0);
    indices.push(nverts);
    nverts++;

    // push second vertex
    points.push(x1); 
    points.push(y1); 
    points.push(z1); 
    points.push(1.0);
    indices.push(nverts);
    nverts++

    // push third vertex
    points.push(x2); 
    points.push(y2); 
    points.push(z2); 
    points.push(1.0);
    indices.push(nverts);
    nverts++;
}


