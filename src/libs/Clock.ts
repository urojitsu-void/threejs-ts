import * as THREE from "three";

export default class Clock extends THREE.Clock {
	private time: number;
	constructor() {
		super();
		this.time = 0;
	}

	update = () => {
		const delta = this.getDelta();
		this.time += delta;
		return { delta, time: this.time };
	};
}
