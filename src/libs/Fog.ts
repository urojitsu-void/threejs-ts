import * as THREE from "three";

export default class Fog extends THREE.FogExp2 {
	constructor(distance = 0.001, color = 0xefd1b5) {
		super(color, distance);
	}
}
