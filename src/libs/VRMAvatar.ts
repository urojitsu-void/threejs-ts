import { type VRM, VRMUtils } from "@pixiv/three-vrm";
import {
	type VRMAnimation,
	VRMLookAtQuaternionProxy,
	createVRMAnimationClip,
} from "@pixiv/three-vrm-animation";
import * as THREE from "three";

export default class VRMAvatar {
	private vrm?: VRM;
	private mixer?: THREE.AnimationMixer;
	private action?: THREE.AnimationAction;
	private lookAtProxy?: VRMLookAtQuaternionProxy;

	constructor(private scene: THREE.Scene) {}

	setVRM(vrm: VRM) {
		this.dispose();
		this.vrm = vrm;
		VRMUtils.removeUnnecessaryVertices(vrm.scene);
		VRMUtils.removeUnnecessaryJoints(vrm.scene);
		vrm.scene.traverse((obj) => {
			obj.frustumCulled = false;
		});
		if (vrm.lookAt) {
			this.lookAtProxy = new VRMLookAtQuaternionProxy(vrm.lookAt);
			this.lookAtProxy.name = "lookAtQuaternionProxy";
			vrm.scene.add(this.lookAtProxy);
		}
		this.scene.add(vrm.scene);
	}

	play(animation: VRMAnimation) {
		if (!this.vrm) {
			return;
		}
		const clip = createVRMAnimationClip(animation, this.vrm);
		if (!this.mixer) {
			this.mixer = new THREE.AnimationMixer(this.vrm.scene);
		}
		this.action?.stop();
		this.action = this.mixer.clipAction(clip);
		this.action.reset();
		this.action.play();
	}

	update(delta: number) {
		this.mixer?.update(delta);
		this.vrm?.update(delta);
	}

	dispose() {
		if (this.action) {
			this.action.stop();
			this.action = undefined;
		}
		if (this.mixer) {
			this.mixer.stopAllAction();
			this.mixer.uncacheRoot(this.vrm?.scene ?? new THREE.Object3D());
			this.mixer = undefined;
		}
		if (this.lookAtProxy && this.vrm) {
			this.vrm.scene.remove(this.lookAtProxy);
			this.lookAtProxy = undefined;
		}
		if (this.vrm) {
			this.scene.remove(this.vrm.scene);
			this.vrm = undefined;
		}
	}
}
