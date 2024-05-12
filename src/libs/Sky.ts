import type * as THREE from "three";
import { Sky as ThreeSky } from "three/addons/objects/Sky.js";

export default class Sky extends ThreeSky {
	constructor(scale = 10000) {
		super();
		this.scale.setScalar(scale);
		const uniforms = this.material.uniforms;
		uniforms.turbidity.value = 10; // 混濁
		uniforms.rayleigh.value = 2; // レイリー散乱
		uniforms.mieCoefficient.value = 0.005; // ミー係数
		uniforms.mieDirectionalG.value = 0.8; // ミー指向性グラディエント
	}

	setEnv = (params: {
		turbidity?: number;
		rayleigh?: number;
		mieCoefficient?: number;
		mieDirectionalG?: number;
	}) => {
		const uniforms = this.material.uniforms;
		if (params.turbidity) uniforms.turbidity.value = params.turbidity;
		if (params.rayleigh) uniforms.rayleigh.value = params.rayleigh;

		if (params.mieCoefficient)
			uniforms.mieCoefficient.value = params.mieCoefficient;
		if (params.mieDirectionalG)
			uniforms.mieDirectionalG.value = params.mieDirectionalG;
	};

	setLight = (light: THREE.Light) => {
		this.material.uniforms.sunPosition.value.copy(light.position);
	};
}
