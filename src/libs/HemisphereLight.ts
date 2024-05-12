import * as THREE from "three";

export default class HemisphereLight extends THREE.HemisphereLight {
	constructor(skyColor = 0xffffbb, groundColor = 0x080820, intensity = 0.5) {
		super(skyColor, groundColor, intensity);
	}
}
