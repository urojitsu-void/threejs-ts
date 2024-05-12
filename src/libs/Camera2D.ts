import * as THREE from "three";

export default class Camera2D extends THREE.OrthographicCamera {
	constructor(
		width = window.innerWidth,
		height = window.innerHeight,
		near = 1,
		far = 10,
	) {
		super(-width / 2, width / 2, height / 2, -height / 2, near, far);
		this.position.z = far;
	}

	resize = () => {
		// カメラのアスペクト比を正す
		this.left = window.innerWidth / -2;
		this.right = window.innerWidth / 2;
		this.top = window.innerHeight / 2;
		this.bottom = window.innerHeight / -2;
		this.updateProjectionMatrix();
	};
}
