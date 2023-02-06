import * as THREE from 'three';
import {
	GLTFLoader
} from 'GLTFLoaders';
import {
	RGBELoader
} from 'RGBELoader';
import {
	TextureLoader
} from 'three';

import * as dat from 'dat.gui';

/* -------------------------------------------------------------------------- */
/*                                Instance GUI                                */
/* -------------------------------------------------------------------------- */
const gui = new dat.GUI();

//Creation du colorPicker GUI
class ColorGUIHelper {
	constructor(object, prop) {
		this.object = object;
		this.prop = prop;
	}
	get value() {
		return `#${this.object[this.prop].getHexString()}`;
	}
	set value(hexString) {
		this.object[this.prop].set(hexString);
	}
}

/* -------------------------------------------------------------------------- */
/*                                Create SCENE                                */
/* -------------------------------------------------------------------------- */
const scene = new THREE.Scene();

/* -------------------------------------------------------------------------- */
/*                                   CAMERA                                   */
/* -------------------------------------------------------------------------- */
const camera = new THREE.PerspectiveCamera(105, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.x = -.5;
camera.position.y = 1.2;
camera.position.z = 2.4;

/* -------------------------------------------------------------------------- */
/*                                  RENDERER                                  */
/* -------------------------------------------------------------------------- */
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

/* -------------------------------------------------------------------------- */
/*                              Reflet // EnvMap                              */
/* -------------------------------------------------------------------------- */
// Uniquement des fichiers .HDR
const hdrEquirect = new RGBELoader()
	.setPath('models/')
	.load('empty_warehouse_01_2k.hdr', function () {
		hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
		animate();
	});

/* -------------------------------------------------------------------------- */
/*                                   Texture                                  */
/* -------------------------------------------------------------------------- */
// Ca marche pas.
const texture = new THREE.TextureLoader().load('models/normal_map.jpg');
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(4, 4)

/* -------------------------------------------------------------------------- */
/*                                    MODEL                                   */
/* -------------------------------------------------------------------------- */
const loader = new GLTFLoader();
loader.load('models/pearl/pearl3.gltf', function (gltf) {
		var Material = new THREE.MeshPhysicalMaterial({
			color: 0xffffff,
			roughness: 0.1,
			metalness: 0,
			transmission: 1,
			opacity: 1,
			ior: 2.5,
			reflectivity: 1,
			thickness: 0.5,
			clearcoat: 1,
			clearcoatRoughness: .7,

			envMap: hdrEquirect,
			envMapIntensity: 1,

			normalMap: texture,
			clearcoatNormalMap: texture,
			normalScale: new THREE.Vector2(1, 1),
			clearcoatNormalScale: new THREE.Vector2(1, 1)
			// specularIntensity: 3.5,
			// specularColor: 0xff0000,
		})

		let model = gltf.scene;

		// GUI pour le MODEL.
		//PATTERN : 
		//gui.add(Material, 'nomDeLaPropriété',min, max, pas)
		gui.addColor(new ColorGUIHelper(Material, 'color'), 'value').name('color');

		gui.add(Material, 'roughness', 0, 2, 0.05)
		gui.add(Material, 'metalness', 0, 1, 0.1)
		gui.add(Material, 'transmission', 0, 1, 0.1)
		gui.add(Material, 'opacity', 0, 1, 0.1)
		gui.add(Material, 'ior', 0, 5, 0.1)
		gui.add(Material, 'reflectivity', 0, 5, 0.1)
		gui.add(Material, 'thickness', 0, 5, 0.1)
		gui.add(Material, 'clearcoat', 0, 5, 0.1)
		gui.add(Material, 'clearcoatRoughness', 0, 1, 0.1)
		gui.add(Material, 'envMapIntensity', 0, 1, 0.1)




		// Ca je sais pas faut que je creuse.
		model.traverse((child, i) => {
			if (child.isMesh) {
				child.material = Material;
				child.material.side = THREE.DoubleSide;
				if (child.material.map) {
					child.material.map = texture;
					child.material.map.needsUpdate = true;
				}
			}
		})

		scene.add(model);
	},

	// Console Log quand ca a fini de charger avec succes
	function (xhr) {

		console.log((xhr.loaded / xhr.total * 100) + '% loaded');

	},
	// Console log quand ca plante.
	function (error) {

		console.log('An error happened');

	})


/* -------------------------------------------------------------------------- */
/*                                   LIGHTS                                   */
/* -------------------------------------------------------------------------- */
const dir_light = new THREE.DirectionalLight(0xffffff, 3);
dir_light.position.set(2, 1, 2)
scene.add(dir_light)

/* -------------------------------------------------------------------------- */
/*                                 BACKGROUND                                 */
/* -------------------------------------------------------------------------- */
// scene.background = new THREE.Color('#656565');
const background_loader = new THREE.TextureLoader();
scene.background = background_loader.load('models/boat.jpg');




/* -------------------------------------------------------------------------- */
/*                                     GUI                                    */
/* -------------------------------------------------------------------------- */
// gui.add(camera.position, 'x', -10, 10).step(0.1).name('pos x')
// gui.add(camera.position, 'y', -10, 10).step(0.1).name('pos y')
// gui.add(camera.position, 'z', -10, 10).step(0.1).name('pos Z')

gui.addColor(new ColorGUIHelper(dir_light, 'color'), 'value').name('color');
gui.add(dir_light, 'intensity', 0, 6, 0.01);
gui.add(dir_light.position, 'x', -10, 10);
gui.add(dir_light.position, 'z', -10, 10);
gui.add(dir_light.position, 'y', 0, 10);


/* -------------------------------------------------------------------------- */
/*                                   ANIMTE                                   */
/* -------------------------------------------------------------------------- */
function animate() {
	requestAnimationFrame(animate);
	scene.rotation.y += 0.0001;

	renderer.render(scene, camera);
};

animate();