import * as THREE from "three";

export default class Sprite extends THREE.Sprite {
	private initWindowWidth = 0;
	private initWindowHeight = 0;
	private w = 0;
	private h = 0;
	constructor(texture: THREE.Texture, depth = 1, fog = false) {
		super(new THREE.SpriteMaterial({ map: texture, fog }));
		this.initWindowWidth = window.innerWidth;
		this.initWindowHeight = window.innerHeight;
		this.position.set(0, 0, depth);
		this.center.set(0.5, 0.5);
		this.scale.set(texture.image.width, texture.image.height, depth);
	}

	setPos = (x: number, y: number) => {
		const width = window.innerWidth / 2;
		const height = window.innerHeight / 2;
		this.position.set(width * x, height * y, this.position.z);
	};

	setCenter = (
		align: {
			left?: boolean;
			top?: boolean;
			bottom?: boolean;
			right?: boolean;
			center?: boolean;
		} = { left: false, top: false, bottom: false, right: false, center: true },
	) => {
		if (align.center) {
			this.center.set(0.5, 0.5);
		} else if (align.left && align.top) {
			this.center.set(1, 0);
		} else if (align.left && align.bottom) {
			this.center.set(1, 1);
		} else if (align.right && align.top) {
			this.center.set(0, 0);
		} else if (align.right && align.bottom) {
			this.center.set(0, 1);
		}
	};

	setSize = (w: number, h: number) => {
		this.w = w;
		this.h = h;
		const scale =
			(window.innerWidth + window.innerHeight) /
			(this.initWindowWidth + this.initWindowHeight);
		this.scale.set(w * scale, h * scale, this.scale.z);
	};

	setDepth = (depth: number) => {
		this.position.z = depth;
	};

	onResizeWindow = () => {
		const scale =
			(window.innerWidth + window.innerHeight) /
			(this.initWindowWidth + this.initWindowHeight);
		this.scale.set(this.w * scale, this.h * scale, this.scale.z);
	};
}
