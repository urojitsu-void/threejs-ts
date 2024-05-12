import * as THREE from "three";

export default class Cylinder extends THREE.Mesh {
	public readonly radius: number;
	public readonly height: number;
	constructor(
		radius: number,
		height: number,
		color = Math.floor(Math.random() * (1 << 24)),
	) {
		super(
			new THREE.CylinderGeometry(radius, radius, height, 20, 1),
			new THREE.MeshPhongMaterial({ color }),
		);
		this.radius = radius;
		this.height = height;
		this.receiveShadow = true;
		this.castShadow = true;
	}
}
