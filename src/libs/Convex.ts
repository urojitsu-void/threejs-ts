import * as THREE from "three";

import { ConvexGeometry } from "three/addons/geometries/ConvexGeometry.js";

export default class Convex extends THREE.Mesh {
	constructor(
		vertices: THREE.Vector3[],
		color = Math.floor(Math.random() * (1 << 24)),
	) {
		super(new ConvexGeometry(vertices), new THREE.MeshBasicMaterial({ color }));
	}
}
