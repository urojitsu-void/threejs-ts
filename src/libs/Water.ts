import * as THREE from "three";
import { Water as ThreeWater } from "three/addons/objects/Water.js";

export default class Water extends ThreeWater {
	constructor(
		directinalLight: THREE.DirectionalLight,
		waterColor = 0x001e0f,
		sunColor = 0xffffff,
		fog = false,
		size = 10000,
		textureSize = 512,
	) {
		const waterGeometry = new THREE.PlaneGeometry(size, size);
		super(waterGeometry, {
			textureWidth: textureSize,
			textureHeight: textureSize,
			waterNormals: new THREE.TextureLoader().load(
				"./textures/waternormals.jpg",
				(texture) => {
					texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
				},
			),
			sunDirection: directinalLight
				? directinalLight.position.clone().normalize()
				: undefined,
			sunColor,
			waterColor,
			distortionScale: 3.7,
			alpha: 1.0,
			fog,
		});
		this.rotation.x = -Math.PI / 2;
	}

	setEnv = (params: { distortionScale: number; alpha: number }) => {
		const uniforms = this.material.uniforms;
		if (params.distortionScale)
			uniforms.distortionScale.value = params.distortionScale;
		if (params.alpha) uniforms.alpha.value = params.alpha;
	};

	setLight = (light: THREE.Light) => {
		this.material.uniforms.sunDirection.value.copy(light.position).normalize();
	};

	update = (delta = 1.0 / 60.0) => {
		this.material.uniforms.time.value += delta;
	};
}
