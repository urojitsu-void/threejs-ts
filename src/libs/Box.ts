import * as THREE from "three";

export default class Box extends THREE.Mesh {
	public readonly size: THREE.Vector3;
	constructor(
		size = new THREE.Vector3(1, 1, 1),
		color = Math.floor(Math.random() * (1 << 24)),
	) {
		super(
			new THREE.BoxGeometry(size.x, size.y, size.z),
			new THREE.MeshPhongMaterial({ color }),
		);
		this.size = size;
		this.receiveShadow = true;
		this.castShadow = true;
	}
}
