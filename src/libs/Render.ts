import * as THREE from "three";

export default class Render extends THREE.WebGLRenderer {
	constructor(onResize = () => {}, color = 0xf3f3f3) {
		super({
			antialias: true,
			stencil: true,
			alpha: true,
		});
		// render用タグをbodyに追加
		const container = document.createElement("div");
		container.appendChild(this.domElement);
		document.body.appendChild(container);

		this.setClearColor(color, 1.0);
		// ウィンドウサイズが変更された場合、レンダラーをリサイズする
		this.resize();
		window.addEventListener("resize", onResize);

		this.autoClear = false;
		this.shadowMap.enabled = true;
		this.shadowMap.type = THREE.PCFSoftShadowMap;
	}

	resize = () => {
		// レンダラーのサイズを調整する
		this.setPixelRatio(window.devicePixelRatio);
		this.setSize(window.innerWidth, window.innerHeight);
	};
}
