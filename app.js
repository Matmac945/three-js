import * as THREE from '/node_modules/three/build/three.module.js';

function main2() {
	const canvas = document.querySelector('#c');
	const renderer = new THREE.WebGLRenderer({ canvas });

	const fov = 75;
	const aspect = 2; // the canvas default
	const near = 0.1;
	const far = 5;
	const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera.position.z = 2;

	const scene = new THREE.Scene();

	{
		const color = 0xffffff;
		const intensity = 1;
		const light = new THREE.DirectionalLight(color, intensity);
		light.position.set(-1, 2, 4);
		scene.add(light);
	}

	const boxWidth = 1;
	const boxHeight = 1;
	const boxDepth = 1;
	const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

	function makeInstance(geometry, color, x) {
		const material = new THREE.MeshPhongMaterial({ color });

		const cube = new THREE.Mesh(geometry, material);
		scene.add(cube);

		cube.position.x = x;

		return cube;
	}

	const cubes = [
		makeInstance(geometry, 0x44aa88, 0),
		makeInstance(geometry, 0x8844aa, -2),
		makeInstance(geometry, 0xaa8844, 2),
	];

	function resizeRendererToDisplaySize(renderer) {
		const canvas = renderer.domElement;
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		const needResize = canvas.width !== width || canvas.height !== height;
		if (needResize) {
			renderer.setSize(width, height, false);
		}
		return needResize;
	}

	function render(time) {
		time *= 0.001; // convert time to seconds

		if (resizeRendererToDisplaySize(renderer)) {
			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();
		}

		cubes.forEach((cube, ndx) => {
			const speed = 1 + ndx * 0.1;
			const rot = time * speed;
			cube.rotation.x = rot;
			cube.rotation.y = rot;
		});

		renderer.render(scene, camera);

		requestAnimationFrame(render);
	}
	requestAnimationFrame(render);
}

//main();

function main() {
	const canvas = document.querySelector('#c');

	// vars
	const num = 30;
	const objects = [];
	const raycaster = new THREE.Raycaster();
	const mouse = new THREE.Vector2();
	let light, t;

	// create camera
	const fov = 75;
	const aspect = window.innerWidth / window.innerHeight; // the canvas default
	const near = 0.1;
	const far = 1000;
	const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera.position.z = 5;

	// create a scene
	const scene = new THREE.Scene();

	// create renderer
	const renderer = new THREE.WebGLRenderer({ canvas });

	//Create a Spot light
	light = new THREE.SpotLight(0xccddff, 0.8);
	light.position.set(0, 0, 5);
	scene.add(light);

	// load a ground texture
	var texture = new THREE.TextureLoader().load('/_Example/assets/stone.jpg');
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set(12, 12);
	const color = 0xccddff;
	// create ground material
	const material = new THREE.MeshPhongMaterial({
		map: texture,
		bumpMap: texture,
	});

	// create ground mesh
	const geometry = new THREE.PlaneBufferGeometry(100, 100);
	const ground = new THREE.Mesh(geometry, material);
	ground.rotation.z = (Math.PI / 180) * -45;
	ground.rotation.x = (Math.PI / 180) * -90;
	ground.position.y = -2.0;
	scene.add(ground);

	// load object texture
	const texture_t = new THREE.TextureLoader().load(
		'_Example/assets/rock_01_diffusion.jpg'
	);

	const envMap = new THREE.CubeTextureLoader()
		.setPath('_Example/assets/')
		.load(['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg']);

	// create Tetrahedron
	const geometry_t = new THREE.TetrahedronBufferGeometry(2, 0);
	const material_t = new THREE.MeshPhysicalMaterial({
		map: texture_t,
		envMap: envMap,
		metalness: 1.0,
		roughness: 0.0,
	});
	t = new THREE.Mesh(geometry_t, material_t);
	t.rotation.x = (Math.PI / 180) * -10;
	scene.add(t);

	for (let i = 0; i <= num; i++) {
		// particle code will go here
		const geometry_p = new THREE.SphereBufferGeometry(0.1, 6, 6);
		const material_p = new THREE.MeshPhysicalMaterial({
			envMap: envMap,
			metalness: 1.0,
		});
		const particle = new THREE.Mesh(geometry_p, material_p);

		// set random position
		particle.position.set(
			Math.random() * 100.0 - 50.0,
			0.0,
			Math.random() * -10.0
		);

		// calc distnace as constant and assign to object
		let a = new THREE.Vector3(0, 0, 0);
		let b = particle.position;
		let d = a.distanceTo(b);
		particle.distance = d;

		// define 2 random but constant angles in radians
		particle.radians = (Math.random() * 360 * Math.PI) / 180; // initial angle
		particle.radians2 = (Math.random() * 360 * Math.PI) / 180; // initial angle

		// add object to scene
		scene.add(particle);

		// add to collection
		objects.push(particle);
	}

	function resizeRendererToDisplaySize(renderer) {
		const canvas = renderer.domElement;
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		const needResize = canvas.width !== width || canvas.height !== height;
		if (needResize) {
			renderer.setSize(width, height, false);
		}
		return needResize;
	}

	function render(time) {
		time *= 0.001; // convert time to seconds

		if (resizeRendererToDisplaySize(renderer)) {
			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();
		}

		t.rotation.y -= 0.005;
		// t.rotation.x -= 0.005;
		camera.lookAt(t.position);
		renderer.render(scene, camera);

		for (let i = 0; i <= num; i++) {
			let o = objects[i];
			o.rotation.y += 0.01;
			if (i % 2 == 0) {
				o.radians += 0.005;
				o.radians2 += 0.005;
			} else {
				o.radians -= 0.005;
				o.radians2 -= 0.005;
			}
			o.position.x = Math.cos(o.radians) * o.distance;
			o.position.z = Math.sin(o.radians) * o.distance;
			o.position.y = Math.sin(o.radians2) * o.distance * 0.5;
		}

		requestAnimationFrame(render);
	}
	requestAnimationFrame(render);

	document.addEventListener('mousemove', onDocumentMouseMove, false);
	function onDocumentMouseMove(event) {
		event.preventDefault();
		mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
		mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
		raycaster.setFromCamera(mouse, camera);
		let intersects = raycaster.intersectObjects(objects, true);
		if (intersects.length > 0) {
			active = intersects[0].object;
			active.material.color.setHex(Math.random() * 0x9999999);
		}
		t.rotation.z = mouse.x * 0.5;
		t.rotation.x = mouse.y * 0.5;
	}
}
main();
