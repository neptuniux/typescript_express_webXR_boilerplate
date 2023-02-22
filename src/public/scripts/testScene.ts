// eslint-disable-next-line import/no-extraneous-dependencies
import * as THREE from 'three';
// eslint-disable-next-line import/no-extraneous-dependencies
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry';
// eslint-disable-next-line import/no-extraneous-dependencies
import { VRButton } from 'three/examples/jsm/webxr/VRButton';
// eslint-disable-next-line import/no-extraneous-dependencies
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory';

// eslint-disable-next-line import/no-extraneous-dependencies
import { io, Socket } from 'socket.io-client';

type User = {
  id: string;
  position: any;
  rotation: any;
};

class TestScene {
  public camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    10,
  );

  public scene: THREE.Scene = new THREE.Scene();

  public raycaster: THREE.Raycaster = new THREE.Raycaster();

  public renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({ antialias: true });

  public controller1:
  THREE.Object3D<THREE.Event> | THREE.XRTargetRaySpace = this.renderer.xr.getController(0);

  public controller2:
  THREE.Object3D<THREE.Event> | THREE.XRTargetRaySpace = this.renderer.xr.getController(1);

  public controllerGrip1: THREE.XRGripSpace | undefined;

  public controllerGrip2: THREE.XRGripSpace | undefined;

  public room: THREE.LineSegments = new THREE.LineSegments(
    new BoxLineGeometry(6, 6, 6, 10, 10, 10).translate(0, 3, 0),
    new THREE.LineBasicMaterial({ color: 0x808080 }),
  );

  public marker:
  THREE.Object3D<THREE.Event> |
  THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial> = new THREE.Mesh(
      new THREE.CircleGeometry(0.25, 32).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0x808080 }),
    );

  public floor:
  THREE.Object3D<THREE.Event> |
  THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial> = new THREE.Mesh(
      new THREE.PlaneGeometry(4.8, 4.8, 2, 2).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0x808080, transparent: true, opacity: 0.25 }),
    );

  public localSocket: Socket | undefined;

  public users: User[] = [];

  public baseReferenceSpace: XRReferenceSpace | null | undefined;

  public INTERSECTION: THREE.Vector3 | undefined;

  public tempMatrix = new THREE.Matrix4();

  constructor(socket: Socket) {
    this.init();
    this.localSocket = socket;
  }

  init() {
    this.scene.background = new THREE.Color(0x505050);
    this.camera.position.set(0, 1, 3);
    this.scene.add(this.room);

    this.scene.add(new THREE.HemisphereLight(0x606060, 0x404040));
    const light = new THREE.DirectionalLight(0xffffff);
    light.position.set(1, 1, 1).normalize();
    this.scene.add(light);
    this.scene.add(this.marker);
    this.scene.add(this.floor);

    const dragableCube = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.2, 0.2),
      new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
    );
    dragableCube.name = 'draggableCube';
    dragableCube.position.set(0, 0, -1);
    this.scene.add(dragableCube);

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth * 0.9, window.innerHeight * 0.9);
    this.renderer.domElement.className = 'threejs_canvas';
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    // eslint-disable-next-line no-return-assign
    this.renderer.xr.addEventListener('sessionstart', () => this.baseReferenceSpace = this.renderer.xr.getReferenceSpace());
    this.renderer.xr.enabled = true;

    document.body.appendChild(this.renderer.domElement);
    document.body.appendChild(VRButton.createButton(this.renderer));

    // controllers

    const onSelectStart = () => {
      this.scene.userData.isSelecting = true;
    };

    const onSelectEnd = () => {
      this.scene.userData.isSelecting = false;

      if (this.INTERSECTION) {
        const offsetPosition = {
          x: -this.INTERSECTION.x, y: -this.INTERSECTION.y, z: -this.INTERSECTION.z, w: 1,
        };
        const offsetRotation = new THREE.Quaternion();
        const transform = new XRRigidTransform(offsetPosition, offsetRotation);
        if (this.baseReferenceSpace) {
          this.renderer.xr.setReferenceSpace(
            this.baseReferenceSpace.getOffsetReferenceSpace(transform),
          );
        } else {
          throw new Error('baseReferenceSpace is null');
        }
      }
    };

    this.controller1 = this.renderer.xr.getController(0);
    this.controller1.addEventListener('selectstart', onSelectStart);
    this.controller1.addEventListener('selectend', onSelectEnd);
    this.controller1.addEventListener('connected', (event) => {
      this.scene.add(this.buildController(event.data));
    });
    this.controller1.addEventListener('disconnected', () => {
      this.scene.remove(this.scene.children[0]);
    });
    this.scene.add(this.controller1);

    this.controller2 = this.renderer.xr.getController(1);
    this.controller2.addEventListener('selectstart', onSelectStart);
    this.controller2.addEventListener('selectend', onSelectEnd);
    this.controller2.addEventListener('connected', (event) => {
      console.log('controller2 connected', event);
      this.scene.add(this.buildController(event.data));
    });
    this.controller2.addEventListener('disconnected', () => {
      this.scene.remove(this.scene.children[0]);
    });
    this.scene.add(this.controller2);

    const controllerModelFactory = new XRControllerModelFactory();

    this.controllerGrip1 = this.renderer.xr.getControllerGrip(0);
    this.controllerGrip1.add(controllerModelFactory.createControllerModel(this.controllerGrip1));
    this.scene.add(this.controllerGrip1);

    this.controllerGrip2 = this.renderer.xr.getControllerGrip(1);
    this.controllerGrip2.add(controllerModelFactory.createControllerModel(this.controllerGrip2));
    this.scene.add(this.controllerGrip2);

    window.addEventListener('resize', this.onWindowResize, false);

    const button = document.getElementById('moveCube');
    if (button) {
      button.addEventListener('click', () => {
        const cube = this.scene.getObjectByName('draggableCube');
        if (cube) {
          cube.position.set(
            Math.random() * 2 - 1,
            Math.random() * 2 - 1,
            Math.random() * 2 - 1,
          );
          cube.rotation.set(
            Math.random() * 2 * Math.PI,
            Math.random() * 2 * Math.PI,
            Math.random() * 2 * Math.PI,
          );
        }
      });
    }
  }

  // eslint-disable-next-line class-methods-use-this,consistent-return
  buildController(data: { targetRayMode: any }) {
    let geometry;
    let material;

    switch (data.targetRayMode) {
      case 'tracked-pointer':
        geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, -1], 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute([0.5, 0.5, 0.5, 0, 0, 0], 3));
        material = new THREE.LineBasicMaterial(
          { vertexColors: true, blending: THREE.AdditiveBlending },
        );
        return new THREE.Line(geometry, material);

      case 'gaze':
        geometry = new THREE.RingGeometry(0.02, 0.04, 32).translate(0, 0, -1);
        material = new THREE.MeshBasicMaterial({ opacity: 0.5, transparent: false });
        return new THREE.Mesh(geometry, material);

      default:
        return new THREE.Mesh();
    }
  }

  updatePositions() {
    let userGroup = this.scene.getObjectByName('userGroup');
    if (userGroup) {
      this.scene.remove(userGroup);
    } else {
      userGroup = new THREE.Group();
      userGroup.name = 'userGroup';
    }
    for (let i = 0; i < this.users.length; i += 1) {
      const user = this.users[i];
      const newCube = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.1, 0.1),
        new THREE.MeshBasicMaterial({ color: 0xff0000 }),
      );
      newCube.name = user.id;
      userGroup.add(newCube).position.set(user.position.x, user.position.y, user.position.z);
      // newCube.rotation.set(user.rotation.x, user.rotation.y, user.rotation.z);
    }
    this.scene.add(userGroup);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    this.INTERSECTION = undefined;

    if (this.controller1.userData.isSelecting === true) {
      this.tempMatrix.identity().extractRotation(this.controller1.matrixWorld);

      this.raycaster.ray.origin.setFromMatrixPosition(this.controller1.matrixWorld);
      this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(this.tempMatrix);

      const intersects = this.raycaster.intersectObjects([this.floor]);

      if (intersects.length > 0) {
        this.INTERSECTION = intersects[0].point;
      }
    } else if (this.controller2.userData.isSelecting === true) {
      this.tempMatrix.identity().extractRotation(this.controller2.matrixWorld);

      this.raycaster.ray.origin.setFromMatrixPosition(this.controller2.matrixWorld);
      this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(this.tempMatrix);

      const intersects = this.raycaster.intersectObjects([this.floor]);

      if (intersects.length > 0) {
        this.INTERSECTION = intersects[0].point;
      }
    }

    if (this.INTERSECTION) {
      this.marker.position.copy(this.INTERSECTION);
    }

    this.marker.visible = this.INTERSECTION !== undefined;

    if (this.localSocket && this.camera) {
      this.localSocket.emit('updatePosition', { id: this.localSocket.id, position: this.camera.position, rotation: this.camera.rotation });
    }

    this.updatePositions();

    this.renderer.render(this.scene, this.camera);
  }

  animate() {
    this.renderer.setAnimationLoop(this.render.bind(this));
  }
}

export default TestScene;
