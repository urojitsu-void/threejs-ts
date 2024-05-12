import Ammo from "ammojs-typed";
import * as THREE from "three";
import type HeightMap from "./HeightMap";

export default class PhysicsWorld {
	private physicsWorld!: Ammo.btDiscreteDynamicsWorld;

	init = async () => {
		// workaround
		// https://github.com/giniedp/ammojs-typed/issues/18#issue-1978313055
		await Ammo.bind(Ammo)(Ammo);
		const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
		const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
		const broadphase = new Ammo.btDbvtBroadphase();
		const solver = new Ammo.btSequentialImpulseConstraintSolver();
		this.physicsWorld = new Ammo.btDiscreteDynamicsWorld(
			dispatcher,
			broadphase,
			solver,
			collisionConfiguration,
		);
		this.physicsWorld.setGravity(new Ammo.btVector3(0, -9.8, 0));
	};

	// 物理世界のシミュレーションを更新する（重力計算、衝突計算など）
	update = (deltaTime: number) => {
		this.physicsWorld.stepSimulation(deltaTime, 10);
	};

	addSphereBody = (
		objThree: THREE.Object3D,
		radius: number,
		mass: number,
		isKinematic = false,
		isStatic = false,
	) => {
		const shape = new Ammo.btSphereShape(radius);
		shape.setMargin(0.05);

		const transform = this.createTransform(
			objThree.position,
			objThree.quaternion,
		);
		objThree.userData.physicsBody = this.createBody(
			mass,
			transform,
			shape,
			isKinematic,
			isStatic,
		);
		this.physicsWorld.addRigidBody(objThree.userData.physicsBody);
	};

	addBoxBody = (
		objThree: THREE.Object3D,
		size: THREE.Vector3,
		mass: number,
		isKinematic = false,
		isStatic = false,
	) => {
		const shape = new Ammo.btBoxShape(
			new Ammo.btVector3(size.x * 0.5, size.y * 0.5, size.z * 0.5),
		);
		shape.setMargin(0.05);

		const pos = new THREE.Vector3(
			objThree.position.x,
			objThree.position.y,
			objThree.position.z,
		);
		const transform = this.createTransform(pos, objThree.quaternion);
		objThree.userData.physicsBody = this.createBody(
			mass,
			transform,
			shape,
			isKinematic,
			isStatic,
		);
		this.physicsWorld.addRigidBody(objThree.userData.physicsBody);
	};

	addCylinderBody = (
		objThree: THREE.Object3D,
		radius: number,
		height: number,
		mass: number,
		isKinematic = false,
		isStatic = false,
	) => {
		const shape = new Ammo.btCylinderShape(
			new Ammo.btVector3(radius, height * 0.5, radius),
		);
		shape.setMargin(0.05);

		const transform = this.createTransform(
			objThree.position,
			objThree.quaternion,
		);
		objThree.userData.physicsBody = this.createBody(
			mass,
			transform,
			shape,
			isKinematic,
			isStatic,
		);
		this.physicsWorld.addRigidBody(objThree.userData.physicsBody);
	};

	addConeBody = (
		objThree: THREE.Object3D,
		radius: number,
		height: number,
		mass: number,
		isKinematic = false,
		isStatic = false,
	) => {
		const shape = new Ammo.btConeShape(radius, height);
		shape.setMargin(0.05);

		const transform = this.createTransform(
			objThree.position,
			objThree.quaternion,
		);
		objThree.userData.physicsBody = this.createBody(
			mass,
			transform,
			shape,
			isKinematic,
			isStatic,
		);
		this.physicsWorld.addRigidBody(objThree.userData.physicsBody);
	};

	addCapsuleBody = (
		objThree: THREE.Object3D,
		radius: number,
		height: number,
		mass: number,
		isKinematic = false,
		isStatic = false,
	) => {
		const shape = new Ammo.btCapsuleShape(radius, height * 0.5);
		shape.setMargin(0.05);

		const transform = this.createTransform(
			objThree.position,
			objThree.quaternion,
		);
		objThree.userData.physicsBody = this.createBody(
			mass,
			transform,
			shape,
			isKinematic,
			isStatic,
		);
		this.physicsWorld.addRigidBody(objThree.userData.physicsBody);
	};

	addConvexBody = (
		objThree: THREE.Object3D,
		vertices: THREE.Vector3[],
		mass: number,
		isKinematic = false,
		isStatic = false,
	) => {
		const shape = new Ammo.btConvexHullShape();
		for (let i = 0; i < vertices.length; i++) {
			const vec = vertices[i];
			shape.addPoint(new Ammo.btVector3(vec.x, vec.y, vec.z));
		}

		const transform = this.createTransform(
			objThree.position,
			objThree.quaternion,
		);
		objThree.userData.physicsBody = this.createBody(
			mass,
			transform,
			shape,
			isKinematic,
			isStatic,
		);
		this.physicsWorld.addRigidBody(objThree.userData.physicsBody);
	};

	addHeightMapBody = (objThree: HeightMap) => {
		// Ammo heapに高さデータのバッファを作成する
		const ammoHeightData = Ammo._malloc(
			4 * objThree.terrainWidth * objThree.terrainDepth,
		);
		// Ammoのバッファにデータをコピー
		let p = 0;
		let p2 = 0;
		for (let j = 0; j < objThree.terrainDepth; j++) {
			for (let i = 0; i < objThree.terrainWidth; i++) {
				// write 32-bit float data to memory
				Ammo.HEAPF32[(ammoHeightData + p2) >> 2] = objThree.heightData[p];
				p++;
				// 4 bytes/float
				p2 += 4;
			}
		}
		const heightFieldShape = new Ammo.btHeightfieldTerrainShape(
			objThree.terrainWidth, // 横幅
			objThree.terrainDepth, // 縦幅
			ammoHeightData, // 高さデータ
			1, // 高さのスケール
			objThree.terrainMinHeight, // AABB判定に使用される高さの最小
			objThree.terrainMaxHeight, // AABB判定に使用される高さの最大
			1, // 上方向の軸番号(Y軸:1)
			"PHY_FLOAT", // データタイプの指定
			false, // 三角形化の際のエッジ反転
		);
		// Set horizontal scale
		const scaleX = objThree.terrainGeometoryWidth / (objThree.terrainWidth - 1);
		const scaleZ = objThree.terrainGeometoryDepth / (objThree.terrainDepth - 1);
		heightFieldShape.setLocalScaling(new Ammo.btVector3(scaleX, 1, scaleZ));
		heightFieldShape.setMargin(0.05);

		const groundTransform = new Ammo.btTransform();
		groundTransform.setIdentity();
		// Shifts the terrain, since bullet re-centers it on its bounding box.
		groundTransform.setOrigin(
			new Ammo.btVector3(
				0,
				(objThree.terrainMaxHeight + objThree.terrainMinHeight) / 2,
				0,
			),
		);
		objThree.userData.physicsBody = this.createBody(
			0,
			groundTransform,
			heightFieldShape,
			false,
			true,
		);
		this.physicsWorld.addRigidBody(objThree.userData.physicsBody);
	};

	addHumanBody = (
		objThree: THREE.Object3D,
		size = new THREE.Vector3(1, 1, 1),
		scale = 1,
		friction = 1,
		mass = 200,
	) => {
		this.addCapsuleBody(
			objThree,
			(size.x ** 2 + size.z ** 2) ** 0.5 * 0.5 * scale,
			size.y,
			mass,
		);
		// 回転させない
		objThree.userData.physicsBody.setAngularFactor(0, 1, 0);
		// 摩擦（登れる坂の傾斜に影響）
		objThree.userData.physicsBody.setFriction(friction);
	};

	// 物理世界の姿勢作成
	createTransform = (
		pos = new THREE.Vector3(0, 0, 0),
		q = new THREE.Quaternion(0, 0, 0, 1),
	) => {
		const transform = new Ammo.btTransform();
		transform.setIdentity();
		transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
		transform.setRotation(new Ammo.btQuaternion(q.x, q.y, q.z, q.w));
		return transform;
	};

	// 物理世界の衝突オブジェクトを作成
	createBody = (
		mass: number,
		transform: Ammo.btTransform,
		shape: Ammo.btCollisionShape,
		isKinematic = false,
		isStatic = false,
	) => {
		const localInertia = new Ammo.btVector3(0, 0, 0);
		const isStaticOrKinematic = isStatic || isKinematic;
		if (!isStaticOrKinematic) {
			shape.calculateLocalInertia(mass, localInertia);
		}
		const motionState = new Ammo.btDefaultMotionState(transform);
		const rbInfo = new Ammo.btRigidBodyConstructionInfo(
			isStaticOrKinematic ? 0 : mass,
			motionState,
			shape,
			localInertia,
		);
		const body = new Ammo.btRigidBody(rbInfo);
		if (isKinematic) {
			const BODYFLAG_KINEMATIC_OBJECT = 2;
			const BODYSTATE_DISABLE_DEACTIVATION = 4;
			body.setCollisionFlags(
				body.getCollisionFlags() | BODYFLAG_KINEMATIC_OBJECT,
			);
			body.setActivationState(BODYSTATE_DISABLE_DEACTIVATION);
		}
		return body;
	};

	addImpulse = (
		objThree: THREE.Object3D,
		impulse = new THREE.Vector3(0, 0, 0),
	) => {
		const objPhys =
			objThree.userData.physicsBody && objThree.userData.physicsBody;
		if (objPhys) {
			objPhys.applyCentralImpulse(
				new Ammo.btVector3(impulse.x, impulse.y, impulse.z),
			);
		}
	};

	addForce = (objThree: THREE.Object3D, force = new THREE.Vector3(0, 0, 0)) => {
		const objPhys =
			objThree.userData.physicsBody && objThree.userData.physicsBody;
		if (objPhys) {
			objPhys.applyCentralForce(new Ammo.btVector3(force.x, force.y, force.z));
		}
	};

	// モデルの描画姿勢を物理世界の姿勢に反映
	setPhysicsPose = (objThree: THREE.Object3D & { center?: THREE.Vector3 }) => {
		const objPhys =
			objThree.userData.physicsBody && objThree.userData.physicsBody;
		if (objPhys) {
			const pos = objThree.position;
			const center = objThree.center
				? objThree.center
				: new THREE.Vector3(0, 0, 0);
			const q = objThree.quaternion;
			const transform = new Ammo.btTransform();
			transform.setIdentity();
			transform.setOrigin(
				new Ammo.btVector3(
					pos.x - center.x,
					pos.y - center.y,
					pos.z - center.z,
				),
			);
			transform.setRotation(new Ammo.btQuaternion(q.x, q.y, q.z, q.w));
			const motionState = new Ammo.btDefaultMotionState(transform);
			// sleep状態を強制解除して計算対象に含める
			const ACTIVE_TAG = 1;
			objPhys.forceActivationState(ACTIVE_TAG);
			objPhys.activate();
			objPhys.setMotionState(motionState);
		}
	};

	// 物理世界の姿勢をモデルの描画姿勢に反映
	setModelPose = (
		objThree: THREE.Object3D & {
			center?: THREE.Vector3;
			boxHelper?: THREE.BoxHelper;
		},
	) => {
		const ms = objThree.userData.physicsBody?.getMotionState();
		if (ms) {
			const transformAux1 = new Ammo.btTransform();
			ms.getWorldTransform(transformAux1);
			const p = transformAux1.getOrigin();
			const q = transformAux1.getRotation();
			const center = objThree.center
				? objThree.center
				: new THREE.Vector3(0, 0, 0);
			objThree.position.set(
				p.x() + center.x,
				p.y() + center.y,
				p.z() + center.z,
			);
			objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
			if (objThree.boxHelper) {
				objThree.boxHelper.setFromObject(objThree);
			}
		}
	};

	getPointer = (body: unknown): number => (Ammo as any).getPointer(body);

	// 物理空間上のオブジェクトの当たり判定
	hitTest = (targets: THREE.Object3D[], needHitPoint = false) => {
		const targetPtrs: { [key: number]: boolean } = {};
		for (const key in targets) {
			const target = targets[key];
			if (!target.userData.physicsBody) continue;
			targetPtrs[this.getPointer(target.userData.physicsBody)] = true;
		}

		const hits: {
			a: number;
			b: number;
			pts?: { a: Ammo.btVector3; b: Ammo.btVector3 }[];
		}[] = [];
		const numManifolds = this.physicsWorld.getDispatcher().getNumManifolds();
		for (let i = 0; i < numManifolds; i++) {
			const contactManifold = this.physicsWorld
				.getDispatcher()
				.getManifoldByIndexInternal(i);
			const objA = contactManifold.getBody0();
			const objB = contactManifold.getBody1();
			const objAptr = this.getPointer(objA);
			const objBptr = this.getPointer(objB);
			if (!targetPtrs[objAptr] || !targetPtrs[objBptr]) continue;

			if (needHitPoint) {
				const numContacts = contactManifold.getNumContacts();
				const pts: { a: Ammo.btVector3; b: Ammo.btVector3 }[] = [];
				for (let j = 0; j < numContacts; j++) {
					const pt = contactManifold.getContactPoint(j);
					if (pt.getDistance() < 0) {
						const ptA = pt.getPositionWorldOnA();
						const ptB = pt.getPositionWorldOnB();
						pts.push({ a: ptA, b: ptB });
					}
				}
				hits.push({ a: objAptr, b: objBptr, pts });
			} else {
				hits.push({ a: objAptr, b: objBptr });
			}
		}

		return hits;
	};
}
