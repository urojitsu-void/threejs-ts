import * as THREE from "three";

export default class RayCaster extends THREE.Raycaster {
	getIntersect = (
		mouse: THREE.Vector2,
		camera: THREE.Camera,
		mesh: THREE.Object3D<THREE.Object3DEventMap>,
	) => {
		this.setFromCamera(mouse, camera);
		const intersects = this.intersectObject(mesh);
		return intersects;
	};
}
