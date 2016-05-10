/*
 * @license
 * Copyright (c) 2016 ryan hs <mr.ryansilalahi@gmail.com>
 * MIT License
 * https://github.com/ryanhs/TicTacToe3D.git
 */

(function(){
	'use strict';

	var GUI = function(containerID){
		var scene, renderer, composer;
		var camera, cameraControls;
		var tiles = [];
		var control = {};
		var mouseClickListener = [];
		var board = [[null, null, null], [null, null, null], [null, null, null]];
		
		
		// init the scene
		function init_scene(){

			if( Detector.webgl ){
				renderer = new THREE.WebGLRenderer({
					antialias		: true,	// to get smoother output
				});
				renderer.setClearColor( 0x2B2B2B );
			}else{
				renderer	= new THREE.CanvasRenderer();
			}
			renderer.setSize( window.innerWidth, window.innerHeight );
			document.getElementById(containerID).appendChild(renderer.domElement);

			// create a scene
			scene = new THREE.Scene();

			// put a camera in the scene
			camera	= new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 10000 );
			camera.position.set(0, 0, 8);
			
			//~ // JSON.stringify(gui.getCamera().matrix.toArray())
			//~ // ... read cameraState somehow ...
			//~ var cameraState = "[0.9750500321388245,0.1829545795917511,-0.1257181316614151,0,-0.016175780445337296,0.6233882308006287,0.7817451357841492,0,0.22139504551887512,-0.7602070569992065,0.6107941269874573,0,1.771160364151001,-6.081655979156494,4.886353015899658,1]"
			//~ camera.matrix.fromArray(JSON.parse(cameraState));
			//~ // Get back position/rotation/scale attributes, couldn't find a better method for this
			//~ camera.matrix.decompose(camera.position, camera.quaternion, camera.scale); 
			
			scene.add(camera);

			// create a camera contol
			cameraControls	= new THREE.TrackballControls( camera )

			// transparently support window resize
			THREEx.WindowResize.bind(renderer, camera);
			// allow 'f' to go fullscreen where this feature is supported
			//~ if( THREEx.FullScreen.available() ){
				//~ THREEx.FullScreen.bindKey();		
				//~ document.getElementById('inlineDoc').innerHTML	+= "- <i>f</i> for fullscreen";
			//~ }
		}
		
		// animation loop
		function animate() {
			requestAnimationFrame( animate );
			cameraControls.update();
			
			// do some animation for tiles :-)
			var id;
			for(id in tiles){
				if(tiles[id].material.materials[0].wireframeLinewidth >= 10)
					tiles[id].material.materials[0].wireframe = false;
				
				if(tiles[id].material.materials[0].wireframeLinewidth < 10)
					tiles[id].material.materials[0].wireframeLinewidth += 0.3; // speed
			}
			
			// actually render the scene
			renderer.render( scene, camera );
		}
		
		function init_lightning(){
			var light;
			
			light = new THREE.AmbientLight( Math.random() * 0xffffff );
			scene.add( light );
			
			light = new THREE.DirectionalLight( Math.random() * 0xffffff );
			light.position.set( Math.random(), Math.random(), Math.random() ).normalize();
			scene.add( light );
			
			light = new THREE.DirectionalLight( Math.random() * 0xffffff );
			light.position.set( Math.random(), Math.random(), Math.random() ).normalize();
			scene.add( light );
			
			light = new THREE.PointLight( Math.random() * 0xffffff );
			light.position.set( Math.random()-0.5, Math.random()-0.5, Math.random()-0.5 ).normalize().multiplyScalar(1.2);
			scene.add( light );
			
			light = new THREE.PointLight( Math.random() * 0xffffff );
			light.position.set( Math.random()-0.5, Math.random()-0.5, Math.random()-0.5 ).normalize().multiplyScalar(1.2);
			scene.add( light );
			
			light = new THREE.PointLight(0xFFFFFF); // Adds white colored point light
			light.position.set(-10, 0, 10);
			scene.add(light);
		}
		
		function loadGrid(x, y, z){
			var material = new THREE.LineBasicMaterial({ambient: 0x808080, color: 0xFFFFFF});
			var geometry = new THREE.Geometry();
			geometry.vertices.push(
				new THREE.Vector3( x[0], y[0], z[0] ),
				new THREE.Vector3( x[1], y[1], z[1] )
			);
			var line = new THREE.Line( geometry, material );
			scene.add( line );
		}
		
		function addGrid(){
			loadGrid([-0.5, -0.5],
					 [-1.5,  1.5],
					 [   0,    0]);
			
			loadGrid([ 0.5,  0.5],
					 [-1.5,  1.5],
					 [   0,    0]);
			
			loadGrid([-1.5,  1.5],
					 [ 0.5,  0.5],
					 [   0,    0]);
			
			loadGrid([-1.5,  1.5],
					 [-0.5, -0.5],
					 [   0,    0]);
		}
		
		control.init = function(){
			// setup scene
			if( !init_scene() ) animate();
			
			// add some lightning
			init_lightning();
			
			// put some grid as board
			addGrid();
			
			// implement onClick
			document.getElementById(containerID).addEventListener('mousedown', onMouseDown, false);
		}
		
		control.getScene = function(){ return scene; }
		control.getCamera = function(){ return camera; }
		control.getRenderer = function(){ return renderer; }
		
		
		
		
		
		
		
		
		
		function addObject(object, x, y, z, callback){
			var loader = new THREE.JSONLoader(true);
				loader.load("js/" + object + ".js", function (Geometry, materials) {
					//~ materials[0].wireframe = true;
					var mesh = new THREE.Mesh(Geometry, new THREE.MeshFaceMaterial(materials)); // Creates new mesh
						mesh.scale.set(0.1, 0.1, 0.1); // Scales down the mesh
						mesh.position.set(x, y, z); // Positions the mesh left from the center
					
					// add some animation?
					mesh.material.materials[0].wireframe = true;
					
					scene.add(mesh); // Adds mesh to the scene
					tiles.push(mesh); // add to tiles, for reset
					if(callback !== undefined) callback(mesh);
				});
		}
		
		function addX(x, y, z, callback){ addObject("X", x, y , z, callback); }
		function addO(x, y, z, callback){ addObject("O", x, y , z, callback); }
		
		control.X = function(x, y, callback){
			var row  = x - 1;
			var cell = Math.abs(y - 3);
			
			if(!control.exists(x, y)){
				addX(x - 2, y - 2, 0, function(mesh){
					board[row][cell] = ['X', mesh];
					if(callback !== undefined) callback(mesh);
				});
			}
		}
		control.O = function(x, y, callback){
			var row  = x - 1;
			var cell = Math.abs(y - 3);
			
			if(!control.exists(x, y)){
				addO(x - 2, y - 2, 0, function(mesh){
					board[row][cell] = ['O', mesh];
					if(callback !== undefined) callback(mesh);
				});
			}
		}
		
		/*
		 * check if tile exists in board
		 */
		control.exists = function(x, y){
			var row  = x - 1;
			var cell = Math.abs(y - 3);
			
			return board[row][cell] != null;
		}
		
		control.reset = function(){
			var id;
			for(id in tiles){
				scene.remove(tiles[id]);
			}
			tiles = [];
			board = [[null, null, null], [null, null, null], [null, null, null]];
			return true;
		}
		
		
		
		
		
		
		
		
		function getXY(cX, cY){
			var projector = new THREE.Projector();
			var planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
			var mv = new THREE.Vector3(
				(cX / window.innerWidth) * 2 - 1,
				-(cY / window.innerHeight) * 2 + 1,
				0.5 );
			var raycaster = projector.pickingRay(mv, camera);
			var pos = raycaster.ray.intersectPlane(planeZ);

			return pos;
		}
		
		function onMouseDown(e) {
			var vector = getXY(e.clientX, e.clientY),
				x = null,
				y = null;
			
			if(vector.x > -1.5 && vector.x < -0.5) x = 1; // -1
			if(vector.x > -0.5 && vector.x <  0.5) x = 2; //  0
			if(vector.x >  0.5 && vector.x <  1.5) x = 3; //  1
			
			if(vector.y >  0.5 && vector.y <  1.5) y = 3; //  1
			if(vector.y > -0.5 && vector.y <  0.5) y = 2; //  0
			if(vector.y > -1.5 && vector.y < -0.5) y = 1; // -1
			
			// if click outside board
			if(x == null || y == null) return;
			
			// do callback
			var id;
			for(id in mouseClickListener){
				mouseClickListener[id](x, y);
			}
		}
		
		control.addMouseClickListener = function(callback){
			mouseClickListener.push(callback);
		}
		
			
		return control;
	}

	if(typeof window !== 'undefined') window.GUI = GUI;
})()
