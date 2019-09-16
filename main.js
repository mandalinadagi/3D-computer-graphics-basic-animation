

var canvas;
var gl;

var program ;

var near = -100;
var far = 100;


var left = -6.0;
var right = 6.0;
var ytop =6.0;
var bottom = -6.0;


var lightPosition2 = vec4(100.0, 100.0, 100.0, 1.0 );
var lightPosition = vec4(0.0, 0.0, 100.0, 1.0 );

var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 0.4, 0.4, 0.4, 1.0 );
var materialShininess = 30.0;


var ambientColor, diffuseColor, specularColor;

var modelMatrix, viewMatrix ;
var modelViewMatrix, projectionMatrix, normalMatrix;
var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc;
var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var RX = 0 ;
var RY = 0 ;
var RZ = 0 ;

var MS = [] ; // The modeling matrix stack
var TIME = 0.0 ; // Realtime
var TIME = 0.0 ; // Realtime
var resetTimerFlag = true ;
var animFlag = false ;
var prevTime = 0.0 ;
var useTextures = 1 ;
var t1 =1;
var t2 =1;

// ------------ Images for textures stuff --------------
var texSize = 64;

var image1 = new Array()
for (var i =0; i<texSize; i++)  image1[i] = new Array();
for (var i =0; i<texSize; i++)
for ( var j = 0; j < texSize; j++)
image1[i][j] = new Float32Array(4);
for (var i =0; i<texSize; i++) for (var j=0; j<texSize; j++) {
    var c = (((i & 0x8) == 0) ^ ((j & 0x8)  == 0));
    image1[i][j] = [c, c, c, 1];
}

// Convert floats to ubytes for texture

var image2 = new Uint8Array(4*texSize*texSize);

for ( var i = 0; i < texSize; i++ )
for ( var j = 0; j < texSize; j++ )
for(var k =0; k<4; k++)
image2[4*texSize*i+4*j+k] = 255*image1[i][j][k];


var textureArray = [] ;



function isLoaded(im) {
    if (im.complete) {
        console.log("loaded") ;
        return true ;
    }
    else {
        console.log("still not loaded!!!!") ;
        return false ;
    }
}

function loadFileTexture(tex, filename)
{
    tex.textureWebGL  = gl.createTexture();
    tex.image = new Image();
    tex.image.src = filename ;
    tex.isTextureReady = false ;
    tex.image.onload = function() { handleTextureLoaded(tex); }
    // The image is going to be loaded asyncronously (lazy) which could be
    // after the program continues to the next functions. OUCH!
}

function loadImageTexture(tex, image) {
    tex.textureWebGL  = gl.createTexture();
    tex.image = new Image();
    //tex.image.src = "CheckerBoard-from-Memory" ;
    
    gl.bindTexture( gl.TEXTURE_2D, tex.textureWebGL );
    //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0,
                  gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                     gl.LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating)
    gl.bindTexture(gl.TEXTURE_2D, null);

    tex.isTextureReady = true ;

}

function initTextures() {
    
    textureArray.push({}) ;
    loadFileTexture(textureArray[textureArray.length-1],"green.jpg") ;
    
    textureArray.push({}) ;
    loadFileTexture(textureArray[textureArray.length-1],"ice.jpg") ;
    
    textureArray.push({}) ;
    loadImageTexture(textureArray[textureArray.length-1],image2) ;
    
}


function handleTextureLoaded(textureObj) {
    gl.bindTexture(gl.TEXTURE_2D, textureObj.textureWebGL);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // otherwise the image would be flipped upsdide down
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureObj.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating)
    gl.bindTexture(gl.TEXTURE_2D, null);
    console.log(textureObj.image.src) ;
    
    textureObj.isTextureReady = true ;
}

//----------------------------------------------------------------

function setColor(c)
{
    ambientProduct = mult(lightAmbient, c);
    diffuseProduct = mult(lightDiffuse, c);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "specularProduct"),flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, 
                                        "shininess"),materialShininess );
}

function toggleTextures() {
    useTextures = 1 - useTextures ;
    gl.uniform1i( gl.getUniformLocation(program,
                                         "useTextures"), useTextures );
}

function waitForTextures1(tex) {
    setTimeout( function() {
    console.log("Waiting for: "+ tex.image.src) ;
    wtime = (new Date()).getTime() ;
    if( !tex.isTextureReady )
    {
        console.log(wtime + " not ready yet") ;
        waitForTextures1(tex) ;
    }
    else
    {
        console.log("ready to render") ;
        window.requestAnimFrame(render);
    }
               },5) ;
    
}

// Takes an array of textures and calls render if the textures are created
function waitForTextures(texs) {
    setTimeout( function() {
               var n = 0 ;
               for ( var i = 0 ; i < texs.length ; i++ )
               {
                    console.log("boo"+texs[i].image.src) ;
                    n = n+texs[i].isTextureReady ;
               }
               wtime = (new Date()).getTime() ;
               if( n != texs.length )
               {
               console.log(wtime + " not ready yet") ;
               waitForTextures(texs) ;
               }
               else
               {
               console.log("ready to render") ;
               window.requestAnimFrame(render);
               }
               },5) ;
    
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor(0.678, 0.827, 0.941, 1.0 );
    
	gl.enable(gl.BLEND);

	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
 
    // Load canonical objects and their attributes
    Cube.init(program);
    Cylinder.init(9,program);
    Cone.init(9,program) ;
    Sphere.init(36,program) ;

    gl.uniform1i( gl.getUniformLocation(program, "useTextures"), useTextures );

    // record the locations of the matrices that are used in the shaders
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    
    // set a default material
    setColor(materialDiffuse) ;
    
  
    
    // set the callbacks for the UI elements
    document.getElementById("sliderXi").onchange = function() {
        RX = this.value ;
        window.requestAnimFrame(render);
    };
    document.getElementById("sliderYi").onchange = function() {
        RY = this.value;
        window.requestAnimFrame(render);
    };
    document.getElementById("sliderZi").onchange = function() {
        RZ =  this.value;
        window.requestAnimFrame(render);
    };
    
    document.getElementById("animToggleButton").onclick = function() {
        if( animFlag ) {
            animFlag = false;
        }
        else {
            animFlag = true  ;
            resetTimerFlag = true ;
            window.requestAnimFrame(render);
        }
    };
    
    document.getElementById("textureToggleButton").onclick = function() {
        toggleTextures() ;
        window.requestAnimFrame(render);
    };

    var controller = new CameraController(canvas);
    controller.onchange = function(xRot,yRot) {
        RX = xRot ;
        RY = yRot ;
        window.requestAnimFrame(render); };
    
    // load and initialize the textures
    initTextures() ;
    
    // Recursive wait for the textures to load
    waitForTextures(textureArray) ;
    //setTimeout (render, 100) ;
    
}

// Sets the modelview and normal matrix in the shaders
function setMV() {
    modelViewMatrix = mult(viewMatrix,modelMatrix) ;
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    normalMatrix = inverseTranspose(modelViewMatrix) ;
    gl.uniformMatrix4fv(normalMatrixLoc, false, flatten(normalMatrix) );
}

// Sets the projection, modelview and normal matrix in the shaders
function setAllMatrices() {
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    setMV() ;
    
}

// Draws a 2x2x2 cube center at the origin
// Sets the modelview matrix and the normal matrix of the global program
function drawCube() {
    setMV() ;
    Cube.draw() ;
}

// Draws a sphere centered at the origin of radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
function drawSphere() {
    setMV() ;
    Sphere.draw() ;
}
// Draws a cylinder along z of height 1 centered at the origin
// and radius 0.5.
// Sets the modelview matrix and the normal matrix of the global program
function drawCylinder() {
    setMV() ;
    Cylinder.draw() ;
}

// Draws a cone along z of height 1 centered at the origin
// and base radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
function drawCone() {
    setMV() ;
    Cone.draw() ;
}

// Post multiples the modelview matrix with a translation matrix
// and replaces the modelview matrix with the result
function gTranslate(x,y,z) {
    modelMatrix = mult(modelMatrix,translate([x,y,z])) ;
}

// Post multiples the modelview matrix with a rotation matrix
// and replaces the modelview matrix with the result
function gRotate(theta,x,y,z) {
    modelMatrix = mult(modelMatrix,rotate(theta,[x,y,z])) ;
}

// Post multiples the modelview matrix with a scaling matrix
// and replaces the modelview matrix with the result
function gScale(sx,sy,sz) {
    modelMatrix = mult(modelMatrix,scale(sx,sy,sz)) ;
}

// Pops MS and stores the result as the current modelMatrix
function gPop() {
    modelMatrix = MS.pop() ;
}

// pushes the current modelMatrix in the stack MS
function gPush() {
    MS.push(modelMatrix) ;
}

	var fps= 16;

function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    eye = vec3(0,0,10);
    eye[1] = eye[1] + 0 ;
   
	gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureArray[0].textureWebGL);
    gl.uniform1i(gl.getUniformLocation(program, "texture1"), 0);
    
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, textureArray[1].textureWebGL);
    gl.uniform1i(gl.getUniformLocation(program, "texture2"), 1);
	
    // set the projection matrix
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
    
    // set the camera matrix
    viewMatrix = lookAt(eye, at , up);
    
    // initialize the modeling matrix stack
    MS= [] ;
    modelMatrix = mat4() ;
    
    // apply the slider rotations
    gRotate(RZ,0,0,1) ;
    gRotate(RY,0,1,0) ;
    gRotate(RX,1,0,0) ;
    
    // send all the matrices to the shaders
    setAllMatrices() ;
    
    // get real time
    var curTime ;
    if( animFlag )
    {
        curTime = (new Date()).getTime() /1000 ;
        if( resetTimerFlag ) {
            prevTime = curTime ;
            resetTimerFlag = false ;
        }
        TIME = TIME + curTime - prevTime ;
        prevTime = curTime ;
    }
var t1 = 1;
	
	gl.uniform1i(gl.getUniformLocation(program, "useTextures"), useTextures);

	
	if (TIME <fps){
	sky();
	gTranslate(-7, 2, 0);
	x = 0;
	for(i=0; i<13; i++){
		 x = x +i;
	}
	gTranslate(x*TIME*0.02, 0 ,0);
	gPush();
	gTranslate(0, -3.5, 0);
	snowlady();
	gPop();
	baloon();
		x = 2* Math.cos(TIME*0.3);
		y = 2* Math.sin(TIME*0.3);
		at = vec3(x, y, 0);
	viewMatrix = lookAt(eye, at , up);
	}	
	
	if (TIME >fps-1){
	gl.clearColor(0.066, 0.411, 0.654,1.0 );
	sky();
	gTranslate(-6.5, 2, 0);
	x = 0;
	for(i=0; i<13; i++){
		 x = x +i;
	}
	gTranslate(x*(TIME-fps)*0.02, 0 ,0);
	gPush();
	gTranslate(0, -3.5, 0);
	snowlady();
	gPop();
	baloon();
		x = 2* Math.cos(TIME*0.2);
		y = 2* Math.sin(TIME*0.2);
		at = vec3(x, y, 0);
	viewMatrix = lookAt(eye, at , up);
	}

	if (TIME >fps*1.5+1){
	gl.clearColor(0.011, 0.168, 0.290, 1.0 );
	gTranslate(-7, 2, 0);
	x = 0;
	for(i=0; i<10; i++){
		 x = x +i;
	}
	gTranslate(x*(TIME-60)*0.01, 0 ,0);
	gPush();
	gTranslate(0, -3.5, 0);
	snowlady();
	gPop();
	baloon();
	eye = vec3(0,0,10);
	at = vec3(0, -(TIME-2)*0.1, 0);
	viewMatrix = lookAt(eye, at , up);
	}

	console.log(TIME);
	
	if(TIME > fps*2.2){
	gl.clearColor(0.027, 0.137, 0.211, 1.0 );
		x = 2* Math.cos(TIME*0.3);
		z = 2* Math.sin(TIME*0.3);
		at = vec3(x, 0, z);
	viewMatrix = lookAt(eye, at , up);
	gl.uniform1i(gl.getUniformLocation(program, "t1"), 1);
	}
    if( animFlag )
        window.requestAnimFrame(render);
}

	
function baloon(){
	gScale(0.7, 0.7, 0.7);
	gRotate(4*Math.sin(TIME*2), 1, 0 ,0);
   //baloon
	gPush();
	{
		gScale(3.5, 2.5, 2.5);
		setColor(vec4(0.709, 0.070, 0.145, 1));
		drawSphere();
	}
	gPop();
	gTranslate(-1.5, -2.5, 0);
	gPush();{
		gScale(0.1, 2.5, 0.1);
		setColor(vec4(0.937, 0.8, 0.780, 1));
		drawCube();
	}
	gPop();
	gTranslate(3, 0, 0);
	gPush();{
		gScale(0.1, 2.5, 0.1);
		setColor(vec4(0.937, 0.8, 0.780, 1));
		drawCube();
	}
	gPop();
	gTranslate(-1.5, -3, 0);
	gPush();{
		gScale(2, 0.5, 1);
		setColor(vec4(0.078, 0.098, 0.121, 1));
		drawCube();
	}
	gPop();
}

function snowlady(){ // snow lady
	gScale(0.3, 0.3, 0.3);
	gPush();  //lower body
	{
		gScale(1.5, 1.5, 1.5);
		setColor(vec4(1, 1, 1, 1));
		drawSphere();
	}
	gPop();
	gPush(); //buttoms
	{
		gTranslate(0, 1.5, 1.5);
		for (i=1; i<5; i++){
			gPush();
			{
			gTranslate(0, -(0.5+0.4*i), 0);
			gScale(0.1, 0.1, 0.1);
			setColor(vec4(0,0,0,1));
			drawSphere();
			}
			gPop();
		}
	}
	gPop();
	gTranslate(0, 1.5, 0);
	gPush(); //upper body
	{
		gTranslate(0,1,0);
		gScale(1, 1, 1);
		setColor(vec4(1, 1, 1, 1));
		drawSphere();
	}
	gPop();
	gTranslate(0, 1, 1);
	// facial features
	gPush(); //mounth 
	{
		for (i=-3; i<4; i++){
			gPush();
			{
			if (i <= 0){
				gTranslate(0, -0.05*i, 0);
			}
			else if (i > 0){
				gTranslate(0, 0.05*i, 0);
			}
			gTranslate(i*0.1, -0.5, 0);
			gScale(0.05, 0.05, 0.05);
			setColor(vec4(1,0,0,1));
			drawSphere();
			}
			gPop();
		}
	}
	gPop();
	gPush(); // nose
	{
		gRotate(25, 1, 0, 1);
		gScale(0.3, 0.3, 1.5);
		setColor(vec4(0.9,0.4,0.01,1));
		drawCone();
	}
	gPop();
	gTranslate(0.35, 0.25, 0);
	gPush(); //eyes
	{ 
		gScale(0.15, 0.15, 0.15);
		setColor(vec4(0.043, 0.219, 0.086,1));
		drawSphere();
	}
	gPop();
    	gPush(); 
	{ 
		gTranslate(-0.7, 0, 0);
		gScale(0.15, 0.15, 0.15);
		setColor(vec4(0.043, 0.219, 0.086,1));
		drawSphere();
	}
	gPop();
	gTranslate(-0.35, 0.5, -1);
	gPush(); // hat
	{
		//add one texture here
		gTranslate(0, 0.55, 0);
		gRotate(-90, 1, 0, 0);
		gScale(0.9, 0.9, 1.5);
		setColor(vec4(0.396, 0.039, 0.721,1));
		drawCone();
	}
	gPop();
	gTranslate(0, 1.25, 0);
	gPush(); 
	{
		gTranslate(0, 0.1, 0);
		gScale(0.2, 0.2, 0.2);
		setColor(vec4(0.396, 0.039, 0.721,1));
		drawSphere();
	}
	gPop();
	gTranslate(0, -3.5, 2);
	gPush(); // left arm
	{
		gTranslate(-1.5, 0,-2);
		gRotate(-45, 0, 0,1);
		gRotate(-90, 0,1,0);
		gScale(0.1, 0.1, 2);
		setColor(vec4(0.313, 0.125, 0.007,1));
		drawCylinder();
	}
	gPop();
	gPush(); // right arm
	{
		gTranslate(1.5, 0, -2);
		gRotate(45, 0, 0,1);
		gRotate(90, 0, 1, 0);
		gScale(0.1, 0.1, 2);
		setColor(vec4(0.313, 0.125, 0.007,1));
		drawCylinder();
	}
	gPop();
 }

function snow(){
	    //snow
	gPush();
	gRotate(90, 1, 0, 0);
	for (i=0; i<6;  i++){
	gRotate(45*i, 1,1, 1);
	gPush();
	gScale(0.05, 0.05, 1);
	setColor(vec4(0.933, 0.905, 0.905, 1));
	drawCylinder();
	gPop();
	}
	gPop();
}

function winter(){
	 gPush();
	gScale(0.5, 0.5, 0.5);
	gTranslate(-2, 2, -3);
	snow();
	gPop();
	gPush();
	gTranslate(3, -5.5, -3);
	snow();
	gPop();
	gPush();
	gScale(1.3, 1.3, 1.3);
	gTranslate(-4, 3, -4);
	snow();
	gPop();
	gPush();
	gTranslate(5, 4, -2);
	gScale(0.7, 0.7 ,0.7);
	snow();
	gPop();
	gPush();
	gScale(0.5, 0.5 ,0.5);
	gTranslate(-7, -5, -1);
	snow();
	gPop();
	gPush();
	gTranslate(-2, -1.5, 0);
	snow();
	gPop();
	gPush();
	gTranslate(3, 5, -1);
	snow();
	gPop();
	gPush();
	gScale(1.3, 1.3 ,1.3);
	gTranslate(-1, -3, -0.5);
	snow();
	gPop();
		gPush();
	gTranslate(2, 2, -0.5);
	snow();
	gPop();
		gPush();
	gScale(0.5, 0.5 ,0.5);
	gTranslate(2, 2, -0.2);
	snow();
	gPop();
}

function tree(){
	//trees
	gl.uniform1i(gl.getUniformLocation(program, "t1"), 0);
	gPush();
	gRotate(-90, 1, 0, 0);
		for (i=1; i<5; i++){
		gPush();
		gTranslate(0, 0, -(1+i));
		gScale(1, 1, 3);
		setColor(vec4(0.027, 0.396, 0.003,1));
		drawCone();
		gPop();
	}
	gPop();
	
		gTranslate(0, -6.5,0);
		gPush();
	{
		gScale(0.3, 1, 0.3);
		setColor(vec4(0.270, 0.101, 0.050,1));
		drawCube();
	}
	gPop();
}


function cloud(){
	//cloud
	gPush();
	{
		gScale(3, 1, 1);
		setColor(vec4(1, 1, 1, 1));
		drawSphere();
		gTranslate(0.7, -0.5, 0)
		gScale(0.5, 0.5, 0.5);
		setColor(vec4(1, 1, 1, 1));
		drawSphere();
		gTranslate(-3, -0.5 ,0);
		gScale(1, 1, 1);
		setColor(vec4(1, 1, 1, 1));
		drawSphere();
		gTranslate(1, 3, 0);
		gScale(1, 2, 2);
		setColor(vec4(1, 1, 1, 1));
		drawSphere();
	}
	gPop();
}

function sky(){
	 gPush();
	gScale(0.5, 0.5, 0.5);
	gTranslate(-2, 2, -3);
	cloud();
	gPop();
	gPush();
	gTranslate(3, -5.5, -3);
	cloud();
	gPop();
	gPush();
	gScale(1.3, 1.3, 1.3);
	gTranslate(-4, 3, -4);
	cloud();
	gPop();
	gPush();
	gTranslate(3, 4, -6);
	gScale(0.3, 0.3 ,0.3);
	cloud();
	gPop();
	gPush();
	gTranslate(-4, -4, -6);
	gScale(0.5, 0.5 ,0.5);
	cloud();
	gPop();
}

// A simple camera controller which uses an HTML element as the event
// source for constructing a view matrix. Assign an "onchange"
// function to the controller as follows to receive the updated X and
// Y angles for the camera:
//
//   var controller = new CameraController(canvas);
//   controller.onchange = function(xRot, yRot) { ... };
//
// The view matrix is computed elsewhere.
function CameraController(element) {
    var controller = this;
    this.onchange = null;
    this.xRot = 0;
    this.yRot = 0;
    this.scaleFactor = 3.0;
    this.dragging = false;
    this.curX = 0;
    this.curY = 0;
    
    // Assign a mouse down handler to the HTML element.
    element.onmousedown = function(ev) {
        controller.dragging = true;
        controller.curX = ev.clientX;
        controller.curY = ev.clientY;
    };
    
    // Assign a mouse up handler to the HTML element.
    element.onmouseup = function(ev) {
        controller.dragging = false;
    };
    
    // Assign a mouse move handler to the HTML element.
    element.onmousemove = function(ev) {
        if (controller.dragging) {
            // Determine how far we have moved since the last mouse move
            // event.
            var curX = ev.clientX;
            var curY = ev.clientY;
            var deltaX = (controller.curX - curX) / controller.scaleFactor;
            var deltaY = (controller.curY - curY) / controller.scaleFactor;
            controller.curX = curX;
            controller.curY = curY;
            // Update the X and Y rotation angles based on the mouse motion.
            controller.yRot = (controller.yRot + deltaX) % 360;
            controller.xRot = (controller.xRot + deltaY);
            // Clamp the X rotation to prevent the camera from going upside
            // down.
            if (controller.xRot < -90) {
                controller.xRot = -90;
            } else if (controller.xRot > 90) {
                controller.xRot = 90;
            }
            // Send the onchange event to any listener.
            if (controller.onchange != null) {
                controller.onchange(controller.xRot, controller.yRot);
            }
        }
    };
}
