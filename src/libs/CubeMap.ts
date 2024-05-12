import * as THREE from "three";

export default class CubeMap {
	private reflectionCube: THREE.CubeTexture;
	constructor(path: string, ext = ".jpg") {
		const urls = [
			`${path}px${ext}`,
			`${path}nx${ext}`,
			`${path}py${ext}`,
			`${path}ny${ext}`,
			`${path}pz${ext}`,
			`${path}nz${ext}`,
		] as const;
		this.reflectionCube = new THREE.CubeTextureLoader().load(urls);
		this.reflectionCube.format = THREE.RGBFormat;
	}

	get texture() {
		return this.reflectionCube;
	}
}
