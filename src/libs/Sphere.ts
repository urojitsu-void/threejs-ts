import * as THREE from "three";

export default class Sphere extends THREE.Mesh {
	public readonly radius: number;
	constructor(radius: number, color = Math.floor(Math.random() * (1 << 24))) {
		super(
			new THREE.SphereGeometry(radius, 20, 20),
			new THREE.MeshPhongMaterial({ color }),
		);
		this.radius = radius;
		this.receiveShadow = true;
		this.castShadow = true;
	}
}
