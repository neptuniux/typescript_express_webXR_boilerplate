// eslint-disable-next-line import/no-extraneous-dependencies
import * as THREE from 'three';

// eslint-disable-next-line import/no-extraneous-dependencies
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry';
// eslint-disable-next-line import/no-extraneous-dependencies
import { VRButton } from 'three/examples/jsm/webxr/VRButton';
// eslint-disable-next-line import/no-extraneous-dependencies
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory';

let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let raycaster: THREE.Raycaster;
let renderer: THREE.WebGLRenderer;
let controller1: THREE.Object3D<THREE.Event> | THREE.XRTargetRaySpace;
let controller2: THREE.Object3D<THREE.Event> | THREE.XRTargetRaySpace;
let controllerGrip1;
let controllerGrip2;
let room;
let marker: THREE.Object3D<THREE.Event> | THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
let floor: THREE.Object3D<THREE.Event> | THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
let baseReferenceSpace: XRReferenceSpace | null;
let INTERSECTION: THREE.Vector3 | undefined;

const tempMatrix = new THREE.Matrix4();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x505050);

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10);
  camera.position.set(0, 1, 3);

  room = new THREE.LineSegments(
    new BoxLineGeometry(6, 6, 6, 10, 10, 10).translate(0, 3, 0),
    new THREE.LineBasicMaterial({ color: 0x808080 }),
  );
  scene.add(room);

  scene.add(new THREE.HemisphereLight(0x606060, 0x404040));

  const light = new THREE.DirectionalLight(0xffffff);
  light.position.set(1, 1, 1).normalize();
  scene.add(light);

  marker = new THREE.Mesh(
    new THREE.CircleGeometry(0.25, 32).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0x808080 }),
  );
  scene.add(marker);

  floor = new THREE.Mesh(
    new THREE.PlaneGeometry(4.8, 4.8, 2, 2).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0x808080, transparent: true, opacity: 0.25 }),
  );
  scene.add(floor);

  raycaster = new THREE.Raycaster();

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;

  // eslint-disable-next-line no-return-assign
  renderer.xr.addEventListener('sessionstart', () => baseReferenceSpace = renderer.xr.getReferenceSpace());
  renderer.xr.enabled = true;

  document.body.appendChild(renderer.domElement);
  document.body.appendChild(VRButton.createButton(renderer));

  // controllers

  const onSelectStart = () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.userData.isSelecting = true;
  };

  const onSelectEnd = () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.userData.isSelecting = false;

    if (INTERSECTION) {
      const offsetPosition = {
        x: -INTERSECTION.x, y: -INTERSECTION.y, z: -INTERSECTION.z, w: 1,
      };
      const offsetRotation = new THREE.Quaternion();
      const transform = new XRRigidTransform(offsetPosition, offsetRotation);
      if (baseReferenceSpace) {
        renderer.xr.setReferenceSpace(baseReferenceSpace.getOffsetReferenceSpace(transform));
      } else {
        throw new Error('baseReferenceSpace is null');
      }
    }
  };

  controller1 = renderer.xr.getController(0);
  controller1.addEventListener('selectstart', onSelectStart);
  controller1.addEventListener('selectend', onSelectEnd);
  controller1.addEventListener('connected', function (event) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    this.add(buildController(event.data));
  });
  controller1.addEventListener('disconnected', function () {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.remove(this.children[0]);
  });
  scene.add(controller1);

  controller2 = renderer.xr.getController(1);
  controller2.addEventListener('selectstart', onSelectStart);
  controller2.addEventListener('selectend', onSelectEnd);
  controller2.addEventListener('connected', function (event) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    this.add(buildController(event.data));
  });
  controller2.addEventListener('disconnected', function () {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.remove(this.children[0]);
  });
  scene.add(controller2);

  // The XRControllerModelFactory will automatically fetch controller models
  // that match what the user is holding as closely as possible. The models
  // should be attached to the object returned from getControllerGrip in
  // order to match the orientation of the held device.

  const controllerModelFactory = new XRControllerModelFactory();

  controllerGrip1 = renderer.xr.getControllerGrip(0);
  controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
  scene.add(controllerGrip1);

  controllerGrip2 = renderer.xr.getControllerGrip(1);
  controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
  scene.add(controllerGrip2);

  //

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  window.addEventListener('resize', onWindowResize, false);
}

// eslint-disable-next-line consistent-return
function buildController(data: { targetRayMode: any; }) {
  let geometry; let
    material;

  // eslint-disable-next-line default-case
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
      material = new THREE.MeshBasicMaterial({ opacity: 0.5, transparent: true });
      return new THREE.Mesh(geometry, material);
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

//

function animate() {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  renderer.setAnimationLoop(render);
}

function render() {
  INTERSECTION = undefined;

  if (controller1.userData.isSelecting === true) {
    tempMatrix.identity().extractRotation(controller1.matrixWorld);

    raycaster.ray.origin.setFromMatrixPosition(controller1.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

    const intersects = raycaster.intersectObjects([floor]);

    if (intersects.length > 0) {
      INTERSECTION = intersects[0].point;
    }
  } else if (controller2.userData.isSelecting === true) {
    tempMatrix.identity().extractRotation(controller2.matrixWorld);

    raycaster.ray.origin.setFromMatrixPosition(controller2.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

    const intersects = raycaster.intersectObjects([floor]);

    if (intersects.length > 0) {
      INTERSECTION = intersects[0].point;
    }
  }

  if (INTERSECTION) marker.position.copy(INTERSECTION);

  marker.visible = INTERSECTION !== undefined;

  renderer.render(scene, camera);
}

init();
animate();
