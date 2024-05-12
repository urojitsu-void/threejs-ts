import type * as THREE from "three";
import { DragControls as ThreeDragControls } from "three/addons/controls/DragControls.js";

export default class DragControls {
	constructor(
		draggableObjects: THREE.Object3D[],
		camera: THREE.Camera,
		renderer: THREE.Renderer,
		onDragStart: THREE.EventListener<any, "dragstart", ThreeDragControls>,
		onDragEnd: THREE.EventListener<any, "dragend", ThreeDragControls>,
	) {
		const dragControls = new ThreeDragControls(
			draggableObjects,
			camera,
			renderer.domElement,
		);
		dragControls.addEventListener("dragstart", onDragStart);
		dragControls.addEventListener("dragend", onDragEnd);
	}
}
