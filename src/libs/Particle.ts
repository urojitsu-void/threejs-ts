import * as THREE from "three";

export default class Particle extends THREE.Points {
	constructor(
		filename: string,
		num = 1000,
		hslColor = { h: 0.4, s: 0.5, l: 0.5 },
		size = 10,
	) {
		super();
		this.geometry = this.createVertices(num);
		this.material = this.createMaterial(filename, hslColor, size);
	}

	private createVertices = (num: number) => {
		const vertices: number[] = [];
		for (let i = 0; i < num; i++) {
			const x = Math.random() * num * 2 - num;
			const y = Math.random() * num * 2 - num;
			const z = Math.random() * num * 2 - num;
			vertices.push(x, y, z);
		}
		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute(
			"position",
			new THREE.Float32BufferAttribute(vertices, 3),
		);
		return geometry;
	};

	private assignSRGB = (texture: THREE.Texture) => {
		texture.colorSpace = THREE.SRGBColorSpace;
	};

	private createMaterial = (
		filename: string,
		hslColor: { h: number; s: number; l: number },
		size: number,
	) => {
		const textureLoader = new THREE.TextureLoader();
		const sprite = textureLoader.load(filename, this.assignSRGB);
		const material = new THREE.PointsMaterial({
			size,
			map: sprite,
			blending: THREE.AdditiveBlending,
			depthTest: false,
			transparent: true,
		});

		material.color.setHSL(
			hslColor.h,
			hslColor.s,
			hslColor.l,
			THREE.SRGBColorSpace,
		);
		return material;
	};

	public update = (delta: number) => {
		this.rotation.y += delta;
	};
}
