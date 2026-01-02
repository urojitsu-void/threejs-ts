import { type VRM, VRMUtils } from "@pixiv/three-vrm";
import {
	type VRMAnimation,
	VRMLookAtQuaternionProxy,
	createVRMAnimationClip,
} from "@pixiv/three-vrm-animation";
import * as THREE from "three";

export default class VRMAvatar {
	object: THREE.Group<THREE.Object3DEventMap>;
	boxHelper: THREE.BoxHelper = new THREE.BoxHelper(
		new THREE.Object3D(),
		0xffff00,
	);
	size: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
	center: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
	initPos: THREE.Vector3 = new THREE.Vector3();
	initRotate = 0;
	initScale: THREE.Vector3 = new THREE.Vector3(1, 1, 1);
	maxSpeed = 0.2;
	speed = 0.5;
	velocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
	private mixer?: THREE.AnimationMixer;
	private action?: THREE.AnimationAction;
	private lookAtProxy?: VRMLookAtQuaternionProxy;

	constructor(private vrm: VRM) {
		this.object = vrm.scene;
		this.prepareScene();
	}

	private prepareScene() {
		VRMUtils.removeUnnecessaryVertices(this.object);
		VRMUtils.removeUnnecessaryJoints(this.object);
		this.object.traverse((obj) => {
			obj.frustumCulled = false;
			obj.castShadow = true;
			obj.receiveShadow = true;
		});
		if (this.vrm.lookAt) {
			this.lookAtProxy = new VRMLookAtQuaternionProxy(this.vrm.lookAt);
			this.lookAtProxy.name = "lookAtQuaternionProxy";
			this.object.add(this.lookAtProxy);
		}
	}

	get position() {
		return this.object.position;
	}

	init = (pos: THREE.Vector3, rotate: number, size: number) => {
		this.initPos.copy(pos);
		this.initRotate = rotate;
		this.initScale.set(size, size, size);
		this.object.position.set(pos.x, pos.y, pos.z);
		this.object.scale.set(size, size, size);
		this.object.rotation.set(0, rotate, 0);
		this.object.updateMatrixWorld(true);
	};

	getCenter = () => {
		this.boxHelper = new THREE.BoxHelper(this.object, 0xffff00);
		const box3 = new THREE.Box3().setFromObject(this.boxHelper);
		box3.getSize(this.size);
		if (!Number.isFinite(this.size.x) || this.size.length() === 0) {
			this.size.set(1, 1.7, 1);
		}
		this.center = new THREE.Vector3(0, -this.size.y * 0.5, 0);
	};

	setSpeed = (speed: number, maxSpeed: number) => {
		this.speed = speed;
		this.maxSpeed = maxSpeed;
	};

	move = (camera: THREE.Camera, radian: number) => {
		const dir = new THREE.Vector3();
		camera.getWorldDirection(dir);
		dir.y = 0;
		dir.normalize();
		const yAxis = new THREE.Vector3(0, 1, 0);

		dir.applyAxisAngle(yAxis, radian);
		const rotate = new THREE.Vector3();
		rotate.copy(dir);
		rotate.applyAxisAngle(yAxis, this.initRotate);
		this.object.lookAt(
			new THREE.Vector3(
				this.object.position.x + rotate.x,
				this.object.position.y + rotate.y,
				this.object.position.z + rotate.z,
			),
		);
		dir.multiplyScalar(this.speed);
		if (this.velocity.length() < this.maxSpeed) {
			this.velocity.x += dir.x;
			this.velocity.z += dir.z;
		}
		this.object.position.x += this.velocity.x;
		this.object.position.z += this.velocity.z;
	};

	moveTo = (pos: THREE.Vector3) => {
		const dir = new THREE.Vector3(
			pos.x - this.object.position.x,
			pos.y - this.object.position.y,
			pos.z - this.object.position.z,
		);
		dir.y = 0;
		dir.normalize();
		const yAxis = new THREE.Vector3(0, 1, 0);

		const rotate = new THREE.Vector3();
		rotate.copy(dir);
		rotate.applyAxisAngle(yAxis, this.initRotate);
		this.object.lookAt(
			new THREE.Vector3(
				this.object.position.x + rotate.x,
				this.object.position.y + rotate.y,
				this.object.position.z + rotate.z,
			),
		);
		dir.multiplyScalar(this.speed);
		if (this.velocity.length() < this.maxSpeed) {
			this.velocity.x += dir.x;
			this.velocity.z += dir.z;
		}
		this.object.position.x += this.velocity.x;
		this.object.position.z += this.velocity.z;
	};

	stop = () => {
		this.velocity.x = 0;
		this.velocity.z = 0;
	};

	play = (animation: VRMAnimation) => {
		const clip = createVRMAnimationClip(animation, this.vrm);
		if (!this.mixer) {
			this.mixer = new THREE.AnimationMixer(this.object);
		}
		this.action?.stop();
		this.action = this.mixer.clipAction(clip);
		this.action.reset();
		this.action.play();
	};

	update = (delta: number) => {
		this.mixer?.update(delta);
		this.vrm.update(delta);
	};

	dispose = () => {
		this.action?.stop();
		if (this.mixer) {
			this.mixer.stopAllAction();
			this.mixer.uncacheRoot(this.object);
			this.mixer = undefined;
		}
		if (this.lookAtProxy) {
			this.object.remove(this.lookAtProxy);
			this.lookAtProxy = undefined;
		}
		if (this.object.parent) {
			this.object.parent.remove(this.object);
		}
	};
}
