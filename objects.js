function setAttribPointers(obj) {
    gl.bindBuffer( gl.ARRAY_BUFFER, obj.nBuffer );
    gl.vertexAttribPointer( obj.vNormal, 3, gl.FLOAT, false, 0, 0 );
    
    gl.bindBuffer( gl.ARRAY_BUFFER, obj.pBuffer );
    gl.vertexAttribPointer(obj.vPosition, 4, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer( gl.ARRAY_BUFFER, obj.cBuffer );
    gl.vertexAttribPointer(obj.vColor, 4, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer( gl.ARRAY_BUFFER, obj.tBuffer );
    gl.vertexAttribPointer(obj.vTexCoord, 2, gl.FLOAT, false, 0, 0);
    
}


function setBuffers(obj, program)
{
    obj.nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, obj.nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(obj.normalsArray), gl.STATIC_DRAW );
    
    obj.vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( obj.vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( obj.vNormal);
    
    obj.pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(obj.pointsArray), gl.STATIC_DRAW);
    
    obj.vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(obj.vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(obj.vPosition);
    
    obj.cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(obj.colorsArray), gl.STATIC_DRAW);
	
    obj.vColor = gl.getAttribLocation( program, "vColor");
    gl.vertexAttribPointer(obj.vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(obj.vColor);
    
    obj.tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(obj.texCoordsArray), gl.STATIC_DRAW);
    
    obj.vTexCoord = gl.getAttribLocation( program, "vTexCoord");
    gl.vertexAttribPointer(obj.vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(obj.vTexCoord);
    
}

var SphereSub = {} ;
SphereSub.numTimesToSubdivide = 4;
 
SphereSub.index = 0;

SphereSub.pointsArray = [];
SphereSub.normalsArray = [];


    
SphereSub.triangle = function (a, b, c) {

    var na = vec3(a[0],a[1],a[2]) ;
    var nb = vec3(b[0],b[1],b[2]) ;
    var nc = vec3(c[0],c[1],c[2]) ;
    
     this.normalsArray.push(na);
     this.normalsArray.push(nb);
     this.normalsArray.push(nc);
     
     this.pointsArray.push(a);
     this.pointsArray.push(b);
     this.pointsArray.push(c);

     this.index += 3;
}


SphereSub.divideTriangle = function (a, b, c, count) {
    if ( count > 0 ) {
                
        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);
                
        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);
                                
        this.divideTriangle( a, ab, ac, count - 1 );
        this.divideTriangle( ab, b, bc, count - 1 );
        this.divideTriangle( bc, c, ac, count - 1 );
        this.divideTriangle( ab, bc, ac, count - 1 );
    }
    else { 
        this.triangle( a, b, c );
    }
}


SphereSub.tetrahedron = function (a, b, c, d, n) {
    this.divideTriangle(a, b, c, n);
    this.divideTriangle(d, c, b, n);
    this.divideTriangle(a, d, b, n);
    this.divideTriangle(a, c, d, n);
}

SphereSub.init = function (program) {
    var va = vec4(0.0, 0.0, -1.0,1);
    var vb = vec4(0.0, 0.942809, 0.333333, 1);
    var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
    var vd = vec4(0.816497, -0.471405, 0.333333,1);
    
    this.tetrahedron(va, vb, vc, vd, this.numTimesToSubdivide);
    setBuffers(this, program);
}


SphereSub.draw = function() {

    setAttribPointers(this) ;
    gl.drawArrays( gl.TRIANGLES, 0, this.index );

}

//--------------- CUBE --------------

Cube = {} ;
Cube.numVertices  = 36;

Cube.pointsArray = [];
Cube.normalsArray = [];
Cube.colorsArray = [] ;
Cube.texCoordsArray = [];

Cube.vertices = [
                vec4( -0.5, -0.5,  0.5, 1.0 ),
                vec4( -0.5,  0.5,  0.5, 1.0 ),
                vec4( 0.5,  0.5,  0.5, 1.0 ),
                vec4( 0.5, -0.5,  0.5, 1.0 ),
                vec4( -0.5, -0.5, -0.5, 1.0 ),
                vec4( -0.5,  0.5, -0.5, 1.0 ),
                vec4( 0.5,  0.5, -0.5, 1.0 ),
                vec4( 0.5, -0.5, -0.5, 1.0 )
                ];



// cube ///////////////////////////////////////////////////////////////////////
//    v6----- v5
//   /|      /|
//  v1------v0|
//  | |     | |
//  | |v7---|-|v4
//  |/      |/
//  v2------v3

// vertex coords array for glDrawArrays() =====================================
// A cube has 6 sides and each side has 2 triangles, therefore, a cube consists
// of 36 vertices (6 sides * 2 tris * 3 vertices = 36 vertices). And, each
// vertex is 3 components (x,y,z) of floats, therefore, the size of vertex
// array is 108 floats (36 * 3 = 108).
var vertices1 = [ 1, 1, 1,  -1, 1, 1,  -1,-1, 1,      // v0-v1-v2 (front)
    -1,-1, 1,   1,-1, 1,   1, 1, 1,      // v2-v3-v0
    
    1, 1, 1,   1,-1, 1,   1,-1,-1,      // v0-v3-v4 (right)
    1,-1,-1,   1, 1,-1,   1, 1, 1,      // v4-v5-v0
    
    1, 1, 1,   1, 1,-1,  -1, 1,-1,      // v0-v5-v6 (top)
    -1, 1,-1,  -1, 1, 1,   1, 1, 1,      // v6-v1-v0
    
    -1, 1, 1,  -1, 1,-1,  -1,-1,-1,      // v1-v6-v7 (left)
    -1,-1,-1,  -1,-1, 1,  -1, 1, 1,      // v7-v2-v1
    
    -1,-1,-1,   1,-1,-1,   1,-1, 1,      // v7-v4-v3 (bottom)
    1,-1, 1,  -1,-1, 1,  -1,-1,-1,      // v3-v2-v7
    
    1,-1,-1,  -1,-1,-1,  -1, 1,-1,      // v4-v7-v6 (back)
    -1, 1,-1,   1, 1,-1,   1,-1,-1 ];    // v6-v5-v4

// normal array
var normals1  = [ 0, 0, 1,   0, 0, 1,   0, 0, 1,      // v0-v1-v2 (front)
    0, 0, 1,   0, 0, 1,   0, 0, 1,      // v2-v3-v0
    
    1, 0, 0,   1, 0, 0,   1, 0, 0,      // v0-v3-v4 (right)
    1, 0, 0,   1, 0, 0,   1, 0, 0,      // v4-v5-v0
    
    0, 1, 0,   0, 1, 0,   0, 1, 0,      // v0-v5-v6 (top)
    0, 1, 0,   0, 1, 0,   0, 1, 0,      // v6-v1-v0
    
    -1, 0, 0,  -1, 0, 0,  -1, 0, 0,      // v1-v6-v7 (left)
    -1, 0, 0,  -1, 0, 0,  -1, 0, 0,      // v7-v2-v1
    
    0,-1, 0,   0,-1, 0,   0,-1, 0,      // v7-v4-v3 (bottom)
    0,-1, 0,   0,-1, 0,   0,-1, 0,      // v3-v2-v7
    
    0, 0,-1,   0, 0,-1,   0, 0,-1,      // v4-v7-v6 (back)
    0, 0,-1,   0, 0,-1,   0, 0,-1 ];    // v6-v5-v4

// color array
var colors1   = [ 1, 0, 0,   1, 0, 0,   1, 0, 0,      // v0-v1-v2 (front)
    1, 0, 0,   1, 0, 0,   1, 0, 0,      // v2-v3-v0
    
    0, 0, 0,   0, 0, 0,   0, 0, 0,      // v0-v3-v4 (right)
    0, 0, 0,   0, 0, 0,   0, 0, 0,      // v4-v5-v0
    
    0, 1, 0,   0, 1, 0,   0, 1, 0,      // v0-v5-v6 (top)
    0, 1, 0,   0, 1, 0,   0, 1, 0,      // v6-v1-v0
    
    1, 1, 0,   1, 1, 0,   1, 1, 0,      // v1-v6-v7 (left)
    1, 1, 0,   1, 1, 0,   1, 1, 0,      // v7-v2-v1
    
    0, 1, 1,   0, 1, 1,   0, 1, 1,      // v7-v4-v3 (bottom)
    0, 1, 1,   0, 1, 1,   0, 1, 1,      // v3-v2-v7
    
    0, 0, 1,   0, 0, 1,   0, 0, 1,      // v4-v7-v6 (back)
    0, 0, 1,   0, 0, 1,   0, 0, 1 ];    // v6-v5-v4

var cubeTexCoord = [ 1,1,  0,1, 0,0,      // v0-v1-v2 (front)
    0,0,   1,0,   1, 1,      // v2-v3-v0
    
    0, 1,   0,0,  1,0,      // v0-v3-v4 (right)
    1,0,   1, 1,   0,1,      // v4-v5-v0
    
    1, 0,   1, 1,  0, 1,      // v0-v5-v6 (top)
    0, 1,   0, 0,  1, 0,      // v6-v1-v0
    
    1, 1,   0, 1,  0,0,     // v1-v6-v7 (left)
    0,0,    1,0,   1, 1,      // v7-v2-v1
    
    0,1,   0,0,   1,0,      // v7-v4-v3 (bottom)
    1,0,   1,1,    0,1,  // v3-v2-v7
    
    0,0, 1,0, 1,1,     // v4-v7-v6 (back)
    1,1, 0,1, 0,0 ];    // v6-v5-v4



Cube.init = function(program)
{
    var count = 0 ;
    var texCount = 0 ;
    for( var i = 0 ; i < vertices1.length; i++)
    {
        this.pointsArray.push(vec4(vertices1[count], vertices1[count+1],vertices1[count+2],1.0)) ;
        this.normalsArray.push(vec3(normals1[count], normals1[count+1], normals1[count+2])) ;
        this.colorsArray.push(vec4(colors1[count], colors1[count+1], colors1[count+2],1.0)) ;
        
        this.texCoordsArray.push(cubeTexCoord[texCount], cubeTexCoord[texCount+1]) ;
        
        count = count + 3 ;
        texCount = texCount + 2 ;
    }
    setBuffers(this,program);
}


Cube.draw = function() {
    
    setAttribPointers(this) ;
    gl.frontFace(gl.CCW) ;
    gl.drawArrays( gl.TRIANGLES, 0, 36 );
}

//-------------- Cylinder --------------
Cylinder = {} ;


Cylinder.pointsArray = [];
Cylinder.normalsArray = [];
Cylinder.colorsArray = [] ;
Cylinder.texCoordsArray = [];

Cylinder.getVertex = function (u, v)
{
    var vd = {} ;
    vd.position = vec4(0.5*Math.cos(u*2*Math.PI), 0.5*Math.sin(u*2*Math.PI), v-0.5, 1.0) ;
    vd.normal = vec3(Math.cos(u*2*Math.PI), Math.sin(u*2*Math.PI), 0.0) ;
    vd.colour = vec4(u,v,0.0,1.0) ;
    vd.texCoord = vec2(u, v) ;
    
    return vd;
}


Cylinder.init = function(n, program)
{
    
    this.n = n ;
    if( this.n < 1) return;
    
    var du = 1.0 / this.n ;
    var dv = du ;
    // do it by quads made up of two triangles
    for( var u = 0 ; u < 1.0 ; u += du) {
        for( var v = 0 ; v < 1.0  ; v += dv) {
            //cerr << "----------------------------\n" ;
            //cerr << "(" << u << "," << v << ")" << endl ;
            //cerr << "(" << u+du << "," << v << ")" << endl ;
            //cerr << "(" << u+du << "," << v+dv << ")" << endl ;
            //cerr << "(" << u << "," << v+dv << ")" << endl ;
            
            // make them into triangles
            var vd1 = this.getVertex(u,v) ;
            var vd2 = this.getVertex(u+du,v) ;
            var vd3 = this.getVertex(u+du,v+dv) ;
            var vd4 = this.getVertex(u,v+dv) ;
            
            // Triangle one
            
            AddInAttribArrays(this,vd1) ;
            AddInAttribArrays(this,vd2) ;
            AddInAttribArrays(this,vd3) ;
            
            
            // Triangle two
            AddInAttribArrays(this,vd3) ;
            AddInAttribArrays(this,vd4) ;
            AddInAttribArrays(this,vd1) ;
        }
    }
    
    setBuffers(this, program);
}



Cylinder.draw = function() {
    
    gl.frontFace(gl.CCW) ;
    //gl.enable(gl.CULL_FACE) ;
    //gl.disable(gl.CULL_FACE) ;
    
    setAttribPointers(this) ;
    gl.drawArrays(gl.TRIANGLES, 0,this.n*this.n*6 );
    
}

//------------- CONE --------------------------------

Cone = {} ;


Cone.pointsArray = [];
Cone.normalsArray = [];
Cone.colorsArray = [] ;
Cone.texCoordsArray = [];

Cone.getVertex = function (u, v)
{
    var radius = 1.0 - v ;
    var vd = {} ;
    vd.position = vec4(radius*Math.cos(u*2*Math.PI), radius*Math.sin(u*2*Math.PI), v-0.5, 1.0) ;
    var ntemp = vec3(Math.cos(u*2*Math.PI), Math.sin(u*2*Math.PI), 1.0) ;
    vd.normal = normalize(ntemp) ;
    vd.colour = vec4(u,v,0.0,1.0) ;
    
    vd.texCoord = vec2(u, v) ;
    
    return vd;
}


Cone.init = function(n, program)
{
    
    this.n = n ;
    if( this.n < 1) return;
    
    var du = 1.0 / this.n ;
    var dv = du ;
    // do it by quads made up of two triangles
    for( var u = 0 ; u < 1.0 ; u += du) {
        for( var v = 0 ; v < 1.0  ; v += dv) {
            //cerr << "----------------------------\n" ;
            //cerr << "(" << u << "," << v << ")" << endl ;
            //cerr << "(" << u+du << "," << v << ")" << endl ;
            //cerr << "(" << u+du << "," << v+dv << ")" << endl ;
            //cerr << "(" << u << "," << v+dv << ")" << endl ;
            
            // make them into triangles
            var vd1 = this.getVertex(u,v) ;
            var vd2 = this.getVertex(u+du,v) ;
            var vd3 = this.getVertex(u+du,v+dv) ;
            var vd4 = this.getVertex(u,v+dv) ;
            
            // Triangle one
            
            AddInAttribArrays(this,vd1) ;
            AddInAttribArrays(this,vd2) ;
            AddInAttribArrays(this,vd3) ;
            
            
            // Triangle two
            AddInAttribArrays(this,vd3) ;
            AddInAttribArrays(this,vd4) ;
            AddInAttribArrays(this,vd1) ;
            
        }
    }
    
    setBuffers(this, program);
}



Cone.draw = function() {
    
    gl.frontFace(gl.CCW) ;
    //gl.enable(gl.CULL_FACE) ;
    //gl.disable(gl.CULL_FACE) ;
    
    setAttribPointers(this) ;
    gl.drawArrays(gl.TRIANGLES, 0,this.n*this.n*6 );
    
}



//------------ sphere ------------------------

Sphere = {} ;


Sphere.pointsArray = [];
Sphere.normalsArray = [];
Sphere.colorsArray = [] ;
Sphere.texCoordsArray = [];

Sphere.getVertex = function (uu, vv)
{
    var vd = {} ;
    var u = uu*Math.PI ;
    var v = vv*2*Math.PI ;
    
    vd.position = vec4(Math.cos(u)*Math.sin(v),
                       Math.sin(u)*Math.sin(v),
                       Math.cos(v),
                       1.0) ;
    vd.normal = vec3(vd.position[0], vd.position[1],vd.position[2])  ;
    
    vd.colour = vec4(uu,vv,0.0,1.0) ;
    
    vd.texCoord = vec2(uu, vv) ;
    
    return vd;
}


function AddInAttribArrays(obj, v)
{
    obj.pointsArray.push(v.position);
    obj.normalsArray.push(v.normal);
    obj.colorsArray.push(v.colour);
    obj.texCoordsArray.push(v.texCoord);
    
}



function flip(vd1, vd2, vd3) {
    // compute average normal
    
    var an = scalev(1.0/3.0, add(vd1.normal, add(vd2.normal,vd3.normal)));
                     
    // compute from triangle
    var va = subtract(vd2.normal, vd1.normal) ;
    var vb = subtract(vd3.normal, vd1.normal) ;
    var tn = cross(vb,va) ;
    if( dot(an,tn) < 0.0) return true ;
    
    return false ;
}

Sphere.init = function(n, program)
{
    
    this.n = n ;
    if( this.n < 1) return;
    
    var du = 1.0 / this.n ;
    var dv = du ;
    // do it by quads made up of two triangles
    for( var u = 0 ; u < 1.0 ; u += du) {
        for( var v = 0 ; v < 1.0  ; v += dv) {
            //cerr << "----------------------------\n" ;
            //cerr << "(" << u << "," << v << ")" << endl ;
            //cerr << "(" << u+du << "," << v << ")" << endl ;
            //cerr << "(" << u+du << "," << v+dv << ")" << endl ;
            //cerr << "(" << u << "," << v+dv << ")" << endl ;
            
            // make them into triangles
            var vd1 = this.getVertex(u,v) ;
            var vd2 = this.getVertex(u+du,v) ;
            var vd3 = this.getVertex(u+du,v+dv) ;
            var vd4 = this.getVertex(u,v+dv) ;
            
            // Triangle one
            if( !flip(vd1,vd2,vd3) ) {
                AddInAttribArrays(this,vd1)
                AddInAttribArrays(this,vd2);
                AddInAttribArrays(this,vd3) ;
                
            } else {
                AddInAttribArrays(this,vd1)
                AddInAttribArrays(this,vd3);
                AddInAttribArrays(this,vd2) ;
                
            }
            
            
            // Triangle two
            if( !flip(vd3,vd4,vd1) ) {
                AddInAttribArrays(this,vd3)
                AddInAttribArrays(this,vd4);
                AddInAttribArrays(this,vd1) ;
                
            } else {
                AddInAttribArrays(this,vd3)
                AddInAttribArrays(this,vd1);
                AddInAttribArrays(this,vd4) ;
            }
        }
    }
    
    setBuffers(this, program);
}



Sphere.draw = function() {
    
    gl.frontFace(gl.CW) ;
    //gl.enable(gl.CULL_FACE) ;
    //gl.disable(gl.CULL_FACE) ;
    
    setAttribPointers(this) ;
    gl.drawArrays(gl.TRIANGLES, 0,this.n*this.n*6 );
    
}


