import * as THREE from 'three';
import {
	GLTFLoader
} from 'GLTFLoaders';
import {
	RGBELoader
} from 'RGBELoader';


const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(105, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 3;
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const loader = new GLTFLoader();

// EnvMap, fichier HDR, c'est les reglets sur le modele.
const hdrEquirect = new RGBELoader()
	.setPath('models/')
	.load('empty_warehouse_01_2k.hdr', function () {
		hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
		animate();
	});

const texture = new THREE.TextureLoader().load('models/s.png');

loader.load('models/scene.gltf', function (gltf) {
		var Material = new THREE.MeshPhysicalMaterial({
			color: 0x13d0ff,
			transmission: 0,
			opacity: 1,
			metalness: .5,
			roughness: 0,
			ior: 1.5,
			thickness: 0.01,
			specularIntensity: 1,
			specularColor: 0xffffff,
			envMap: hdrEquirect,
			envMapIntensity: 1,
			map: texture,
			normalScale: 5,
			clearcoat: 1,
			clearcoatRoughness: 1,
			attenuationColor: 0x000000,
			fog: false,
		})

		let model = gltf.scene;

		model.traverse((child, i) => {
			if (child.isMesh) {
				child.material = Material;
				child.material.side = THREE.DoubleSide;
			}
		})
		scene.add(model);
	},
	function (xhr) {

		console.log((xhr.loaded / xhr.total * 100) + '% loaded');

	},
	function (error) {

		console.log('An error happened');

	})


const dir_light = new THREE.DirectionalLight(0x568135, 3);
dir_light.position.set(2,1,2)
scene.add(dir_light)

const background_loader = new THREE.TextureLoader();
scene.background = background_loader.load('models/boat.jpg')

function animate() {
	requestAnimationFrame(animate);
	scene.rotation.y += 0.01;

	renderer.render(scene, camera);
};

animate();