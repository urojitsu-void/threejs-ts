import * as THREE from "three";
import { type GLTF, GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export default class Loader {
	private gltfLoader: GLTFLoader;
	private texLoader: THREE.TextureLoader;
	private audioLoader: THREE.AudioLoader;

	constructor() {
		this.texLoader = new THREE.TextureLoader();
		this.audioLoader = new THREE.AudioLoader();
		this.gltfLoader = new GLTFLoader();
		this.gltfLoader.setCrossOrigin("anonymous");
	}

	loadTexture = (filename: string) => {
		return new Promise<THREE.Texture>((resolve) => {
			this.texLoader.load(filename, (texture) => resolve(texture));
		});
	};

	loadAudio = (filename: string) => {
		return new Promise<AudioBuffer>((resolve) => {
			this.audioLoader.load(filename, (buffer) => resolve(buffer));
		});
	};

	loadGLTFModel = (filename: string) => {
		return new Promise<GLTF>((resolve) => {
			this.gltfLoader.load(filename, (data) => resolve(data));
		});
	};
}
