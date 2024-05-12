import * as THREE from "three";

export default class ConeMarker extends THREE.Mesh {
	constructor(radius: number, height: number, radiusSegments = 3) {
		super(
			new THREE.ConeGeometry(radius, height, radiusSegments),
			new THREE.MeshNormalMaterial(),
		);
	}
}
