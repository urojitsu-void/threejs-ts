import * as THREE from "three";

export default class Cone extends THREE.Mesh {
	public readonly radius: number;
	public readonly height: number;
	constructor(
		radius: number,
		height: number,
		radiusSegments = 20,
		heightSegments = 1,
		color = Math.floor(Math.random() * (1 << 24)),
	) {
		super(
			new THREE.ConeGeometry(radius, height, radiusSegments, heightSegments),
			new THREE.MeshPhongMaterial({ color }),
		);
		this.radius = radius;
		this.height = height;
		this.receiveShadow = true;
		this.castShadow = true;
	}
}
