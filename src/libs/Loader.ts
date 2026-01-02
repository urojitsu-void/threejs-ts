import * as THREE from "three";
import { type VRM, VRMLoaderPlugin } from "@pixiv/three-vrm";
import {
	VRMAnimationLoaderPlugin,
	type VRMAnimation,
} from "@pixiv/three-vrm-animation";
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
		this.gltfLoader.register((parser) => new VRMLoaderPlugin(parser));
		this.gltfLoader.register((parser) => new VRMAnimationLoaderPlugin(parser));
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

	loadVRM = async (filename: string) => {
		const gltf = await this.gltfLoader.loadAsync(filename);
		const vrm = gltf.userData.vrm as VRM | undefined;
		if (!vrm) {
			throw new Error(`VRMの読み込みに失敗しました: ${filename}`);
		}
		return vrm;
	};

	loadVRMAnimation = async (filename: string) => {
		const gltf = await this.gltfLoader.loadAsync(filename);
		const animations = (gltf.userData.vrmAnimations ?? []) as VRMAnimation[];
		return animations;
	};
}
