import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export default class Camera extends THREE.PerspectiveCamera {
	public helper: THREE.CameraHelper;
	public controls?: OrbitControls;
	constructor(
		eye: THREE.Vector3,
		lookAt: THREE.Vector3,
		near = 1,
		far = 20000,
		fov = 45,
		aspect = window.innerWidth / window.innerHeight,
	) {
		super(fov, aspect, near, far);
		this.position.set(eye.x, eye.y, eye.z);
		this.lookAt(lookAt);
		this.helper = new THREE.CameraHelper(this);
	}

	createControls = (render: THREE.WebGLRenderer) => {
		this.controls = new OrbitControls(this, render.domElement);
		return this.controls;
	};

	resize = () => {
		// カメラのアスペクト比を正す
		const width = window.innerWidth;
		const height = window.innerHeight;
		this.aspect = width / height;
		this.updateProjectionMatrix();
	};
}
