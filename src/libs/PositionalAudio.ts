import * as THREE from "three";

export default class PositionalAudio extends THREE.PositionalAudio {
	constructor(buffer: AudioBuffer, listener: THREE.AudioListener) {
		super(listener);
		this.setBuffer(buffer);
	}
}
