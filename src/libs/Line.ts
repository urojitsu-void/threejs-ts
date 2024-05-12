import * as THREE from "three";

export default class Line extends THREE.Line {
	constructor(
		start = new THREE.Vector3(0, 0, 0),
		end = new THREE.Vector3(0, 0, 1),
		color = Math.floor(Math.random() * (1 << 24)),
	) {
		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute(
			"position",
			new THREE.Float32BufferAttribute(
				[...start.toArray(), ...end.toArray()],
				3,
			),
		);
		super(geometry, new THREE.LineBasicMaterial({ color }));
	}
}
