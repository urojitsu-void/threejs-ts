import * as THREE from "three";

export default class Audio extends THREE.Audio {
	constructor(buffer: AudioBuffer, listener: THREE.AudioListener) {
		super(listener);
		this.setBuffer(buffer);
	}
}
