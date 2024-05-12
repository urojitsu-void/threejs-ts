import * as THREE from "three";

export default class DirectionalLight extends THREE.DirectionalLight {
	constructor(
		direction = new THREE.Vector3(100, 100, 50),
		dLight = 512,
		color = 0xffffff,
		shadowMapSize = 1024,
	) {
		// lighting
		super(color, 0.5);
		this.position.set(direction.x, direction.y, direction.z);
		this.castShadow = true;
		const sLight = dLight * 0.25;
		this.shadow.camera.left = -sLight;
		this.shadow.camera.right = sLight;
		this.shadow.camera.top = sLight;
		this.shadow.camera.bottom = -sLight;
		this.shadow.camera.near = dLight / 30;
		this.shadow.camera.far = dLight;
		this.shadow.mapSize.x = shadowMapSize * 2;
		this.shadow.mapSize.y = shadowMapSize * 2;
	}
}
