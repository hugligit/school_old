import * as THREE from 'three';
import { GLTFLoader } from 'loader';
import { DRACOLoader } from 'draco';
import { OrbitControls } from './controls/OrbitControls.js';

function main(){
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});

    const fov = 75;
    const aspect = 2;
    const near = 0.1;
    const far = 10;

    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;

    const color = 0xffffff;
    const intensity = 3;


    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
    // const material = new THREE.MeshPhongMaterial({color: 0x44aa88});
    // const cube = new THREE.Mesh(geometry, material);
    const light = new THREE.DirectionalLight(color, intensity);
    // scene.add(cube);
    // scene.add(light);
    const envLight = new THREE.AmbientLight( 0xdddddd); // soft white light
    scene.add( envLight );

    const cubes = [
        makeInstance(geometry, 0x44aa88, 0),
        makeInstance(geometry, 0x8844aa, -2),
        makeInstance(geometry, 0xaa8844, 2),
    ];

    // cubes.forEach((cube, ndx) => {
    //     scene.add(cube)
    // });

    const loader =  new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    loader.setDRACOLoader(dracoLoader);

    let mixer

	loader.load(
		"./box.gltf",
		function(gltf){
            const root =  gltf.scene
            const box = new THREE.Box3().setFromObject(root);
            mixer = new THREE.AnimationMixer(root);
            gltf.animations.forEach((clip) => {
                console.log(1);
                mixer.clipAction(clip).play();
            });
            console.log(box.getSize(new THREE.Vector3()).length());
            console.log(box.getSize(new THREE.Vector3()));

			scene.add(gltf.scene);
            // console.log(dumpObject(gltf.scene)).join("\n");
			// gltf.animations; // Array<THREE.AnimationClip>
			// gltf.scene; // THREE.Group
			// gltf.scenes; // Array<THREE.Group>
			// gltf.cameras; // Array<THREE.Camera>
			// gltf.asset; // Object

		},
		// called while loading is progressing
		function ( xhr ) {
			console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
		},
		// called when loading has errors
		function ( error ) {
			console.log( 'An error happened' );
            console.log(error);
		}
	);

    console.log(scene);

    camera.position.z = 4;
    light.position.set(-1, 2, 4);
    renderer.render(scene, camera);


    const controls = new OrbitControls( camera, renderer.domElement );
    controls.addEventListener( 'change', render ); // use if there is no animation loop
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.target.set( 0, 0, - 0.2 );
    controls.update();

    function render(time){
        time *= 0.001;

        mixer.update(0.12);

        cubes.forEach((cube, ndx) => {
            cube.rotation.x = time;
            cube.rotation.y = time;
        });

        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();

        const needResize = canvas.width !== width || canvas.height !== height;


        if(needResize){
            renderer.setSize(width, height, false);
        }

        renderer.render(scene, camera);
        // requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

function makeInstance(geometry, color, x) {
    const material = new THREE.MeshPhongMaterial({color});
    const cube = new THREE.Mesh(geometry, material);
    // scene.add(cube);
    cube.position.x = x;
    return cube;
}

function dumpObject(obj, lines = [], isLast = true, prefix = '') {
  const localPrefix = isLast ? '└─' : '├─';
  lines.push(`${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`);
  const newPrefix = prefix + (isLast ? '  ' : '│ ');
  const lastNdx = obj.children.length - 1;
  obj.children.forEach((child, ndx) => {
    const isLast = ndx === lastNdx;
    dumpObject(child, lines, isLast, newPrefix);
  });
  return lines;
}
main(); 
