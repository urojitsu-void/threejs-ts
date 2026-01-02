import type { VRMAnimation } from "@pixiv/three-vrm-animation";
import TWEEN, { type Tween } from "@tweenjs/tween.js";
import type * as THREE from "three";
import AmbientLight from "./libs/AmbientLight";
import Audio from "./libs/Audio";
import AudioListener from "./libs/AudioListener";
import Axis from "./libs/Axis";
import Box from "./libs/Box";
import Camera2D from "./libs/Camera2D";
import Camera3D from "./libs/Camera3D";
import Clock from "./libs/Clock";
import Cone from "./libs/Cone";
import ConeMarker from "./libs/ConeMarker";
import Cylinder from "./libs/Cylinder";
// import CubeMap from './src/CubeMap'
import DirectionalLight from "./libs/DirectionalLight";
import DragControls from "./libs/DragControls";
import Fog from "./libs/Fog";
import GLTFModel from "./libs/GLTFModel";
import Grid from "./libs/Grid";
import HeightMap from "./libs/HeightMap";
import HemisphereLight from "./libs/HemisphereLight";
import Keyboard from "./libs/Keyboard";
import Loader from "./libs/Loader";
import Particle from "./libs/Particle";
import PhysicsWorld from "./libs/PhysicsWorld";
import PositionalAudio from "./libs/PositionalAudio";
import RayCaster from "./libs/RayCaster";
import Render from "./libs/Render";
import Scene from "./libs/Scene";
import Sky from "./libs/Sky";
import Sphere from "./libs/Sphere";
import Sprite from "./libs/Sprite";
import VRMAvatar from "./libs/VRMAvatar";
import Vec2 from "./libs/Vec2";
import Vec3 from "./libs/Vec3";
import Water from "./libs/Water";

export default class Game {
	clock!: Clock;
	loader!: Loader;
	scene!: Scene;
	sceneOrtho!: Scene;
	renderer!: Render;
	physicsWorld!: PhysicsWorld;
	rayCaster!: RayCaster;
	camera!: Camera3D;
	controlCamera!: Camera3D;
	selectCamera!: Camera3D;
	isDebug = false;
	cameraOrtho!: Camera2D;
	audioListener!: AudioListener;
	buffer!: AudioBuffer;
	soundBuffer!: AudioBuffer;
	bgm!: Audio;
	sound!: PositionalAudio;
	light!: DirectionalLight;
	hemisphereLight!: HemisphereLight;
	ambient!: AmbientLight;
	sky!: Sky;
	water!: Water;
	heightMap!: HeightMap;
	trees: GLTFModel[] = [];
	model!: GLTFModel;
	isGround = false;
	particle!: Particle;
	grid!: Grid;
	axis!: Axis;
	sprite!: Sprite;
	tween!: Tween<any>;
	tweenBack!: Tween<any>;
	keyboard!: Keyboard;
	dynamicObjects: (Sphere | Box | Cylinder | Cone)[] = [];
	dragControls!: DragControls;
	helper!: ConeMarker;
	clicked = false;
	clickPos: Vec3 = new Vec3();
	objectTimePeriod = 0;
	timeNextSpawn = 0;
	prevPressC = false;
	jumbTime = 0;
	vrmAvatar!: VRMAvatar;
	vrmAnimations: VRMAnimation[] = [];

	init = async () => {
		// アニメーションとかで使う時間用
		this.clock = new Clock();
		this.loader = new Loader();
		// シーン作成
		this.scene = new Scene();
		this.sceneOrtho = new Scene();
		// this.cubeMap = new CubeMap('textures/')
		// this.scene.background = this.cubeMap
		this.scene.fog = new Fog();
		// レンダラー作成
		this.renderer = new Render(this.onResize);
		// 物理世界作成
		this.physicsWorld = new PhysicsWorld();
		await this.physicsWorld.init();

		// RayCaster
		this.rayCaster = new RayCaster();

		// 3Dカメラ
		const eye = new Vec3(0, 50, -150);
		const lookAt = new Vec3(0, 0, 0);
		this.camera = new Camera3D(eye, lookAt);
		this.scene.add(this.camera);
		this.scene.add(this.camera.helper); // helper

		// コントロールカメラ
		const debugEye = new Vec3(100, 200, 200);
		const debugLookAt = new Vec3(0, 0, 0);
		this.controlCamera = new Camera3D(debugEye, debugLookAt, 1, 4000);
		this.controlCamera.controls = this.controlCamera.createControls(
			this.renderer,
		);

		this.selectCamera = this.controlCamera;
		this.isDebug = true;

		// 2Dカメラ
		this.cameraOrtho = new Camera2D();

		// Audio
		this.audioListener = new AudioListener();
		this.buffer = await this.loader.loadAudio(
			"./sounds/bgm_maoudamashii_healing13.mp3",
		);
		this.bgm = new Audio(this.buffer, this.audioListener);
		this.bgm.setLoop(true);
		this.bgm.setVolume(0.1);
		this.bgm.play();
		this.soundBuffer = await this.loader.loadAudio("./sounds/ping_pong.mp3");
		this.selectCamera.add(this.audioListener);
		this.sound = new PositionalAudio(this.soundBuffer, this.audioListener);
		this.sound.setVolume(10);

		// lighting
		this.light = new DirectionalLight();

		const parameters = {
			distance: 400,
			inclination: 0.3,
			azimuth: 0.205,
		};
		const theta = Math.PI * (parameters.inclination - 0.5);
		const phi = 2 * Math.PI * (parameters.azimuth - 0.5);
		this.light.position.x = parameters.distance * Math.cos(phi);
		this.light.position.y =
			parameters.distance * Math.sin(phi) * Math.sin(theta);
		this.light.position.z =
			parameters.distance * Math.sin(phi) * Math.cos(theta);
		this.scene.add(this.light);
		this.ambient = new AmbientLight(0x404040);
		this.scene.add(this.ambient);
		this.hemisphereLight = new HemisphereLight();
		this.scene.add(this.hemisphereLight);

		// Sky
		this.sky = new Sky();
		this.sky.setEnv({
			turbidity: 10,
			rayleigh: 2,
			mieCoefficient: 0.005,
			mieDirectionalG: 0.8,
		});
		this.sky.setLight(this.light);
		this.scene.add(this.sky);

		// Water
		this.water = new Water(this.light);
		this.water.setEnv({ distortionScale: 3.7, alpha: 0.95 });
		this.water.setLight(this.light);
		this.scene.add(this.water);

		// HeightMap
		this.heightMap = new HeightMap();
		this.scene.add(this.heightMap);
		this.physicsWorld.addHeightMapBody(this.heightMap);

		// GLTF
		const tree = await this.loader.loadGLTFModel("./model/tree.glb");
		const treePositions = [
			new Vec3(132, 20, -190),
			new Vec3(216, 20, 80),
			new Vec3(-82, 20, 222),
			new Vec3(13, 20, -125),
			new Vec3(-100, 20, 31),
		];
		this.trees = [];
		for (let i = 0; i < 5; i++) {
			this.trees.push(new GLTFModel(tree, true, true));
			this.trees[i].init(treePositions[i], 0, 8);
			this.trees[i].getCenter();
			this.physicsWorld.addBoxBody(
				this.trees[i].object,
				this.trees[i].size.multiplyScalar(0.8),
				0,
				true,
			);
			this.scene.add(this.trees[i].object);
			// const box = new Box(this.trees[i].boundingBox.size().multiplyScalar(6))
			// box.position.copy(this.trees[i].position)
			// this.scene.add(box)
		}

		// GLTF Skin
		const gltf = await this.loader.loadGLTFModel("./model/Soldier.glb");
		this.model = new GLTFModel(gltf, true);
		this.model.init(new Vec3(0, 20, 0), -Math.PI, 10);
		this.model.actions?.[1].play();
		this.model.getCenter();
		this.physicsWorld.addHumanBody(this.model.object, this.model.size, 0.5);
		this.scene.add(this.model.object);
		// this.model.add(this.sound)
		// this.scene.add(this.model.boxHelper);
		this.isGround = false;

		// Particle
		this.particle = new Particle("./textures/particle2.png");
		this.scene.add(this.particle);

		// Grid
		this.grid = new Grid();
		this.scene.add(this.grid);
		// Axis
		this.axis = new Axis();
		this.scene.add(this.axis);

		// Sprite
		const texture = await this.loader.loadTexture("./textures/sprite1.png");
		this.sprite = new Sprite(texture);
		this.sprite.setPos(-1, 1);
		this.sprite.setCenter({ right: true, bottom: true });
		this.sprite.setSize(64, 64);
		this.sceneOrtho.add(this.sprite);

		const coords = { x: -1, y: 1 };
		this.tween = new TWEEN.Tween(coords)
			.to({ x: -1, y: 0 }, 3000)
			.easing(TWEEN.Easing.Quadratic.Out)
			.onUpdate(() => {
				this.sprite.setPos(coords.x, coords.y);
			});

		this.tweenBack = new TWEEN.Tween(coords)
			.to({ x: -1, y: 1 }, 3000)
			.easing(TWEEN.Easing.Quadratic.Out)
			.onUpdate(() => {
				this.sprite.setPos(coords.x, coords.y);
			});

		this.tween.chain(this.tweenBack);
		this.tweenBack.chain(this.tween);
		this.tween.delay(3000).start();

		// キーボード
		this.keyboard = new Keyboard();

		// ドラッグ処理
		this.dynamicObjects = [];
		this.dragControls = new DragControls(
			this.dynamicObjects,
			this.controlCamera,
			this.renderer,
			this.onDragStart,
			this.onDragEnd,
		);

		// マウス/タッチ
		this.helper = new ConeMarker(20, 100);
		this.helper.geometry.translate(0, 50, 0);
		this.helper.geometry.rotateX(Math.PI / 2);
		this.helper.geometry.scale(0.1, 0.1, 0.1);
		this.scene.add(this.helper);
		document.addEventListener("mousemove", this.onMouseMove, false);
		document.addEventListener("mousedown", this.onMouseClick, false);
		this.clicked = false;
		this.clickPos = new Vec3();

		this.objectTimePeriod = 3;
		this.timeNextSpawn = this.objectTimePeriod;

		try {
			const vrm = await this.loader.loadVRM("./model/void.vrm");
			this.vrmAvatar = new VRMAvatar(vrm);
			this.vrmAvatar.dispose();
			this.vrmAvatar.init(new Vec3(0, 20, 0), 0, 15);
			this.vrmAvatar.getCenter();
			this.physicsWorld.addHumanBody(
				this.vrmAvatar.object,
				this.vrmAvatar.size,
				0.5,
			);
			this.scene.add(this.vrmAvatar.object);
		} catch (error) {
			console.warn("VRMの読み込みに失敗しました", error);
			return;
		}

		try {
			this.vrmAnimations = await this.loader.loadVRMAnimation(
				"./model/sample.vrma",
			);
			if (this.vrmAnimations.length > 0) {
				this.vrmAvatar?.play(this.vrmAnimations[0]);
			}
		} catch (error) {
			console.warn("VRMAの読み込みに失敗しました", error);
		}

		requestAnimationFrame(this.loop);
	};

	onDragStart = (e: {
		object: THREE.Mesh & { userData?: { ignorePhysics: boolean } };
	}) => {
		if (this.selectCamera.controls) {
			this.selectCamera.controls.enabled = false;
		}
		if (e.object.userData) {
			e.object.userData.ignorePhysics = true;
		}
	};

	onDragEnd = (e: {
		object: THREE.Mesh & { userData?: { ignorePhysics: boolean } };
	}) => {
		if (e.object.userData) {
			this.physicsWorld.setPhysicsPose(e.object);
			e.object.userData.ignorePhysics = false;
		}
		if (this.selectCamera.controls) {
			this.selectCamera.controls.enabled = true;
		}
	};

	loop = (frame: number) => {
		requestAnimationFrame(this.loop);
		this.render(frame);
	};

	onResize = () => {
		this.renderer.resize();

		const cameras = [this.camera, this.cameraOrtho, this.controlCamera];
		for (const camera of cameras) {
			camera.resize();
		}
		this.sprite.onResizeWindow();
	};

	onMouseMove = (event: MouseEvent) => {
		const mouse = new Vec2(
			(event.clientX / this.renderer.domElement.clientWidth) * 2 - 1,
			-(event.clientY / this.renderer.domElement.clientHeight) * 2 + 1,
		);

		const intersects = this.rayCaster.getIntersect(
			mouse,
			this.selectCamera,
			this.heightMap,
		);

		if (intersects[0]?.face && intersects[0].point) {
			this.helper.position.set(0, 0, 0);
			this.helper.lookAt(intersects[0].face.normal);
			this.helper.position.copy(intersects[0].point);
		}
	};

	onMouseClick = (event: MouseEvent) => {
		const mouse = new Vec2(
			(event.clientX / this.renderer.domElement.clientWidth) * 2 - 1,
			-(event.clientY / this.renderer.domElement.clientHeight) * 2 + 1,
		);

		const intersects = this.rayCaster.getIntersect(
			mouse,
			this.selectCamera,
			this.heightMap,
		);

		if (intersects.length > 0) {
			this.clicked = true;
			this.clickPos = intersects[0].point;
		}
	};

	render = (frame: number) => {
		const { delta, time } = this.clock.update();
		this.camera.lookAt(
			new Vec3(
				this.model.position.x,
				this.model.position.y + 10,
				this.model.position.z,
			),
		);
		const cameraDir = new Vec3(
			this.model.position.x - this.camera.position.x,
			0,
			this.model.position.z - this.camera.position.z,
		);
		const cameraDistance = 100;
		if (cameraDir.length() > cameraDistance) {
			const target = cameraDir.normalize().multiplyScalar(cameraDistance);
			this.camera.position.copy(
				new Vec3(
					this.model.position.x - target.x,
					this.camera.position.y,
					this.model.position.z - target.z,
				),
			);
		}

		TWEEN.update(frame); // TWEENオブジェクト更新
		this.model.mixer?.update(delta); // モデルアニメーション更新
		this.vrmAvatar?.update(delta);

		// 動的にオブジェクトを生成する
		if (this.dynamicObjects.length < 5 && time > this.timeNextSpawn) {
			const objectType = Math.ceil(Math.random() * 4);
			let mesh: Sphere | Box | Cylinder | Cone | null = null;
			const initPos = new Vec3(0, 100, 0);
			const objectSize = 2;
			switch (objectType) {
				case 1:
					mesh = new Sphere(3 + Math.random() * objectSize);
					if (mesh instanceof Sphere) {
						mesh.position.set(initPos.x, initPos.y, initPos.z);
						this.physicsWorld.addSphereBody(mesh, mesh.radius, objectSize * 5);
					}
					break;
				case 2:
					mesh = new Box(
						new Vec3(
							4 + Math.random() * objectSize,
							4 + Math.random() * objectSize,
							4 + Math.random() * objectSize,
						),
					);
					if (mesh instanceof Box) {
						mesh.position.set(initPos.x, initPos.y, initPos.z);
						this.physicsWorld.addBoxBody(mesh, mesh.size, objectSize * 5);
					}
					break;
				case 3:
					mesh = new Cylinder(
						3 + Math.random() * objectSize,
						3 + Math.random() * objectSize,
					);
					if (mesh instanceof Cylinder) {
						mesh.position.set(initPos.x, initPos.y, initPos.z);
						this.physicsWorld.addCylinderBody(
							mesh,
							mesh.radius,
							mesh.height,
							objectSize * 5,
						);
					}
					break;
				default:
					mesh = new Cone(
						3 + Math.random() * objectSize,
						2 + Math.random() * objectSize,
					);
					if (mesh instanceof Cone) {
						mesh.position.set(initPos.x, initPos.y, initPos.z);
						this.physicsWorld.addConeBody(
							mesh,
							mesh.radius,
							mesh.height,
							objectSize * 5,
						);
					}
					break;
			}

			this.scene.add(mesh);
			this.dynamicObjects.push(mesh);
			this.timeNextSpawn = time + this.objectTimePeriod;
		}

		// C
		if (this.keyboard.isPressC() && !this.prevPressC) {
			this.isDebug = !this.isDebug;
			this.prevPressC = true;
			if (this.isDebug) {
				this.selectCamera.remove(this.audioListener);
				this.selectCamera = this.controlCamera;
				this.camera.helper.visible = true;
				this.grid.visible = true;
				this.axis.visible = true;
				this.selectCamera.add(this.audioListener);
			} else {
				this.selectCamera.remove(this.audioListener);
				this.selectCamera = this.camera;
				this.camera.helper.visible = false;
				this.grid.visible = false;
				this.axis.visible = false;
				this.selectCamera.add(this.audioListener);
			}
		} else if (!this.keyboard.isPressC()) {
			this.prevPressC = false;
		}

		if (
			!(
				this.keyboard.isPressA() ||
				this.keyboard.isPressD() ||
				this.keyboard.isPressW() ||
				this.keyboard.isPressS()
			)
		) {
			this.model.stop();
			// A
		} else if (this.keyboard.isPressA()) {
			this.model.move(this.selectCamera, Math.PI / 2);
			// D
		} else if (this.keyboard.isPressD()) {
			this.model.move(this.selectCamera, -Math.PI / 2);
			// W
		} else if (this.keyboard.isPressW()) {
			this.model.move(this.selectCamera, 0);
			// S
		} else if (this.keyboard.isPressS()) {
			this.model.move(this.selectCamera, Math.PI);
		}
		if (this.clicked) {
			const dir = new Vec3(
				this.clickPos.x - this.model.position.x,
				0,
				this.clickPos.z - this.model.position.z,
			);
			if (dir.length() < 3) {
				this.clicked = false;
			}
			this.model.moveTo(this.clickPos);
		}
		// 移動結果を物理計算空間に反映
		this.physicsWorld.setPhysicsPose(this.model.object);
		this.physicsWorld.setPhysicsPose(this.vrmAvatar.object);

		const delay = 3;
		if (
			this.isGround &&
			time > (this.jumbTime || 0) + delay &&
			this.keyboard.isPressSpace()
		) {
			this.physicsWorld.addImpulse(this.model.object, new Vec3(0, 8000, 0));
			this.sound.play();
			this.isGround = false;
			this.jumbTime = time;
		}
		this.physicsWorld.addForce(this.model.object, new Vec3(0, -3000, 0));

		// 物理計算更新
		this.physicsWorld.update(delta);

		// 物理空間上のオブジェクトの当たり判定
		const hitResult = this.physicsWorld.hitTest([
			this.heightMap,
			this.model.object,
		]);
		if (Object.keys(hitResult).length > 0) {
			if (time > (this.jumbTime || 0) + delay) {
				this.isGround = true;
			}
		}

		for (let i = 0; i < this.dynamicObjects.length; i++) {
			const objThree = this.dynamicObjects[i];
			// ドラッグしていないオブジェクト以外反映する
			if (objThree.userData?.ignorePhysics) {
				continue;
			}
			this.physicsWorld.setModelPose(objThree);
		}

		this.particle.update(delta * 0.1);
		this.water.update();

		this.physicsWorld.setModelPose(this.model.object);
		this.physicsWorld.setModelPose(this.vrmAvatar.object);
		this.controlCamera.controls?.update();
		this.renderer.setClearColor(0x000000, 0);
		this.renderer.clear(true, true, true);
		this.renderer.render(this.scene, this.selectCamera);
		this.renderer.clearDepth();
		this.renderer.render(this.sceneOrtho, this.cameraOrtho);
	};
}
