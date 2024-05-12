import * as THREE from "three";

export default class AmbientLight extends THREE.AmbientLight {
	constructor(color = 0x111111) {
		super(color, 1);
	}
}
