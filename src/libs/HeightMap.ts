import * as THREE from "three";
import { ImprovedNoise } from "three/addons/math/ImprovedNoise.js";

export default class HeightMap extends THREE.Mesh {
	terrainDepth: number;
	terrainWidth: number;
	terrainGeometoryWidth: number;
	terrainGeometoryDepth: number;
	terrainMinHeight: number;
	terrainMaxHeight: number;
	heightData: Float32Array;

	constructor(size = 512, geometrySize = 512, minHeight = -1, maxHeight = 30) {
		super();
		const heightData = this.generateHeight(size, size, minHeight, maxHeight);
		const terrainMesh = this.createGeometry(
			size,
			size,
			geometrySize,
			geometrySize,
			heightData,
		);
		this.geometry = terrainMesh.geometry;
		this.material = terrainMesh.material;
		this.terrainWidth = this.terrainDepth = size;
		this.terrainGeometoryWidth = this.terrainGeometoryDepth = geometrySize;
		this.terrainMinHeight = minHeight;
		this.terrainMaxHeight = maxHeight;
		this.heightData = heightData;
		this.receiveShadow = true;
		this.castShadow = true;
	}

	// パーリンノイズからHeightMap生成
	generateHeight = (
		terrainWidth: number,
		terrainDepth: number,
		minHeight: number,
		maxHeight: number,
	) => {
		const size = terrainWidth * terrainDepth;
		const data = new Float32Array(size);
		const perlin = new ImprovedNoise();
		const hRange = maxHeight - minHeight;
		let quality = 1;
		const z = Math.random() * 100;
		for (let j = 0; j < 4; j++) {
			for (let i = 0; i < size; i++) {
				const x = i % terrainWidth;
				const y = ~~(i / terrainWidth);
				data[i] +=
					(Math.abs(
						perlin.noise(x / quality, y / quality, z) * quality * 1.75,
					) /
						255.0) *
						hRange +
					minHeight;
			}
			quality *= 5;
		}
		return data;
	};

	// Mesh作成
	createGeometry = (
		terrainWidth: number,
		terrainDepth: number,
		terrainGeometoryWidth: number,
		terrainGeometoryHeight: number,
		heightData: Float32Array,
	) => {
		const geometry = new THREE.PlaneGeometry(
			terrainGeometoryWidth,
			terrainGeometoryHeight,
			terrainWidth - 1,
			terrainDepth - 1,
		);
		geometry.rotateX(-Math.PI / 2);
		const vertices = geometry.attributes.position.array;
		for (let i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
			// j + 1 because it is the y component that we modify
			vertices[j + 1] = heightData[i];
		}
		geometry.computeVertexNormals();
		const texture = new THREE.CanvasTexture(
			this.generateTexture(heightData, terrainWidth, terrainDepth),
		);
		texture.wrapS = THREE.ClampToEdgeWrapping;
		texture.wrapT = THREE.ClampToEdgeWrapping;
		const terrainMesh = new THREE.Mesh(
			geometry,
			new THREE.MeshLambertMaterial({ map: texture }),
		);
		return terrainMesh;
	};

	// ベイクドマップテクスチャ作成
	generateTexture = (data: Float32Array, width: number, height: number) => {
		const vector3 = new THREE.Vector3(0, 0, 0);
		const sun = new THREE.Vector3(1, 1, 1);
		sun.normalize();
		const canvas = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;
		let context = canvas.getContext("2d");
		if (context) {
			context.fillStyle = "#000";
			context.fillRect(0, 0, width, height);
			const image = context.getImageData(0, 0, canvas.width, canvas.height);
			const imageData = image.data;
			for (let i = 0, j = 0, l = imageData.length; i < l; i += 4, j++) {
				vector3.x = data[j - 2] - data[j + 2];
				vector3.y = 2;
				vector3.z = data[j - width * 2] - data[j + width * 2];
				vector3.normalize();
				const shade = vector3.dot(sun);
				imageData[i] = (96 + shade * 128) * (0.5 + data[j] * 0.007);
				imageData[i + 1] = (32 + shade * 96) * (0.5 + data[j] * 0.007);
				imageData[i + 2] = shade * 96 * (0.5 + data[j] * 0.007);
			}
			context.putImageData(image, 0, 0);
		}
		// Scaled 4x
		const canvasScaled = document.createElement("canvas");
		canvasScaled.width = width * 4;
		canvasScaled.height = height * 4;
		context = canvasScaled.getContext("2d");
		if (context) {
			context.scale(4, 4);
			context.drawImage(canvas, 0, 0);
			const image = context?.getImageData(
				0,
				0,
				canvasScaled.width,
				canvasScaled.height,
			);
			const imageData = image.data;
			for (let i = 0, l = imageData.length; i < l; i += 4) {
				const v = ~~(Math.random() * 5);
				imageData[i] += v;
				imageData[i + 1] += v;
				imageData[i + 2] += v;
			}
			context.putImageData(image, 0, 0);
		}
		return canvasScaled;
	};
}
