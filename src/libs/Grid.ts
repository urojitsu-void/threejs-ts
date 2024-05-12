import * as THREE from "three";

export default class Grid extends THREE.GridHelper {
	constructor(size = 200, slice = 5) {
		super(size, slice);
	}
}
