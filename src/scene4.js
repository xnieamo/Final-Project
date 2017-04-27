const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much

// Each scene uses the following API:
//        initScene()
//        updateScene()
//        changeTrigger()
//        cleanupScene()

/*********************************** VISUAL ***********************************/
var car, lakeCamera;

var lakeMat;
function initScene(framework, visualConfig) {
    var camera = framework.camera;
    var scene = framework.scene;
    var renderer = framework.renderer;
    visualConfig.camera.pos = new THREE.Vector3( -2.2573092695749275, 7.656400269550838, -16.61839425151948 );
    // camera.up.set(new THREE.Vector3(0,1,0));
    camera.position.set(visualConfig.camera.pos.x, visualConfig.camera.pos.y, visualConfig.camera.pos.z);
    camera.lookAt(new THREE.Vector3(0, 20, 10));
    scene.background = new THREE.Color( 0x336688 );

    lakeCamera = camera.clone();
    lakeCamera.position.set(0,0,0);
    lakeCamera.lookAt(new THREE.Vector3(0,0,-1));

    renderTarget = new THREE.WebGLRenderTarget( 512, 512, { format: THREE.RGBFormat } );
    var texture = THREE.ImageUtils.loadTexture('./water.jpg'); // water texture from wind waker
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    var lakeGeo = new THREE.PlaneGeometry( 500,250,200,100 );
    lakeMat = new THREE.ShaderMaterial({
      uniforms: {
        "time": { value: 0 },
        "cameraPos": { value: visualConfig.camera.pos },
        "waterSampler": { value: texture },
        "mirrorSampler": { value: renderTarget.texture },
    		"mirrorColor": { value: new THREE.Color( 0xaaaaaa ) },
    		"textureMatrix" : { value: new THREE.Matrix4() }
      },
      side: THREE.DoubleSide,
      vertexShader: require('./shaders/terrain-vert.glsl'),
      fragmentShader: require('./shaders/terrain-frag.glsl')
    });
    var plane = new THREE.Mesh( lakeGeo, lakeMat/*new THREE.MeshBasicMaterial( { map: renderTarget } )*/ );
    plane.position.set(0,0,100);
    plane.rotateX(Math.PI/2);
    scene.add(plane);




    var skyboxGeo = new THREE.BoxGeometry( 1000,1000,1000 );
    var skyboxMat = new THREE.MeshBasicMaterial( { side: THREE.DoubleSide } );
    var skyboxMesh = new THREE.Mesh( skyboxGeo, skyboxMat );
    skyboxMesh.position.set(0,0,0);
    scene.add(skyboxMesh);

    visualConfig.sceneProps = {
      bouys: [],
      particles: []
    };
    visualConfig.sceneReady = true;
}

var water;
var renderTarget;

function updateScene(framework, visualConfig, delta) {
  var camera = framework.camera;
  var scene = framework.scene;
  var renderer = framework.renderer;

  // camera.position.set(visualConfig.camera.pos.x, visualConfig.camera.pos.y, visualConfig.camera.pos.z);
  // camera.lookAt(new THREE.Vector3(0,10,10));

  if (visualConfig.sceneReady) {

    renderer.render( scene, lakeCamera, renderTarget, true );

    for (var i = 0; i < visualConfig.sceneProps.bouys.length; i++) {
      var bouy = visualConfig.sceneProps.bouys[i];
      var name = bouy.name;
      var b = scene.getObjectByName(name);
    	if (b !== undefined) {
    		b.position.set(bouy.pos.x,bouy.pos.y,bouy.pos.z);
    	}
      bouy.update(delta);
    }

    for (var i = 0; i < visualConfig.sceneProps.particles.length; i++) {
      var particle = visualConfig.sceneProps.particles[i];
      var name = particle.name;
      var p = scene.getObjectByName(name);
      if (p !== undefined) {
        p.position.set(particle.pos.x,particle.pos.y,particle.pos.z);
      }
      particle.update(delta);
    }
    lakeMat.uniforms.time.value += delta;
  }
}

function genBouy(scene) {
  var pos = new THREE.Vector3( (Math.random()-0.5) * 100, 0, Math.random() * 200);
  var geometry = new THREE.ConeGeometry( 12,9,16,5 );
  var material = new THREE.ShaderMaterial( {
    uniforms: {
      "time": { value: 0 },
      "random": { value: (Math.random() - 0.5) * 10.0 }
    },
    side: THREE.DoubleSide,
    vertexShader: require('./shaders/bouy-vert.glsl'),
    fragmentShader: require('./shaders/bouy-frag.glsl')
  } );
  var mesh = new THREE.Mesh( geometry, material );
  mesh.name = "bouy"+Math.random();
  mesh.position.set(pos.x, pos.y, pos.z);
  scene.add(mesh);
  return {
    name: mesh.name,
    mass: 1000,
    pos: pos,
    vel: new THREE.Vector3( 0,0,0 ),
    t: Math.random(),
    update: function(delta) {
      this.t += delta;
      this.pos.y = 0.2*(Math.sin(2*this.t)+ 3*Math.sin(this.t+Math.PI/4) + Math.sin(this.t) + Math.sin(this.t+Math.PI/2)) - 5;
    }
  };
}


function genParticle(scene) {
  var pos = new THREE.Vector3( (Math.random()-0.5) * 100, 0, Math.random() * 200 );
  var geometry = new THREE.IcosahedronGeometry(Math.random()*5, 2);
  var mesh = new THREE.Mesh( geometry );
  mesh.name = "particle"+Math.random();
  mesh.position.set(pos.x, pos.y, pos.z);
  scene.add(mesh);
  return {
    name: mesh.name,
    pos: pos,
    vel: new THREE.Vector3( 0,Math.random()*5,0 ),
    update: function(delta) {
      this.pos.y += this.vel.y * delta;
    }
  };
}

function bassCallback(framework, visualConfig) {
  visualConfig.sceneProps.bouys.push(genBouy(framework.scene));
}

function melodyCallback(framework, visualConfig) {
  visualConfig.sceneProps.particles.push(genParticle(framework.scene));
}

function changeTrigger(visualConfig) {
  return false;
}

function cleanupScene(scene) {
  scene.background = new THREE.Color( 0xff0000 );
  while(scene.children.length > 0){
    scene.remove(scene.children[0]);
  }
}

/*********************************** EXPORT ***********************************/

export default {
  initScene: initScene,
  updateScene: updateScene,
  bassCallback: bassCallback,
  melodyCallback: melodyCallback,
  changeTrigger: changeTrigger,
  cleanupScene: cleanupScene
}

export function other() {
  return 2
}
