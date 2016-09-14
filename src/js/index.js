// import stream from './video-stream';
import aframe from 'aframe';
import aframeExtras from 'aframe-extras';
import deepEqual from 'deep-equal';

require('webrtc-adapter');

aframeExtras.physics.registerAll(aframe);
aframeExtras.primitives.registerAll(aframe);

/*
var videoElement = document.querySelector('video');

function gotStream(stream) {
  window.stream = stream; // make stream available to console
  videoElement.srcObject = stream;
}

stream().then(gotStream);
*/

const scene = document.querySelector('a-scene');

function degToRad(degrees) {
  return degrees * (Math.PI / 180);
}

function unproject(vector, camera) {

  const cameraRotationEuler = new aframe.THREE.Euler(
    degToRad(camera.components.rotation.data.x),
    degToRad(camera.components.rotation.data.y),
    degToRad(camera.components.rotation.data.z),
    'XYZ' // TODO: correct?
  );

  const cameraPosition = new aframe.THREE.Vector3(
    camera.components.position.data.x,
    camera.components.position.data.y,
    camera.components.position.data.z
  );

  const matrix = new aframe.THREE.Matrix4();

  const cameraWorld = new aframe.THREE.Matrix4();
  cameraWorld.makeRotationFromEuler(cameraRotationEuler);
  cameraWorld.setPosition(cameraPosition);

  matrix.multiplyMatrices(
    cameraWorld,
    matrix.getInverse(camera.components.camera.camera.projectionMatrix)
  );

  return vector.applyProjection(matrix);

}

function clientCoordsTo3DCanvasCoords(
  clientX,
  clientY,
  offsetX,
  offsetY,
  clientWidth,
  clientHeight
) {
  return {
    x: (((clientX - offsetX) / clientWidth) * 2) - 1,
    y: (-((clientY - offsetY) / clientHeight) * 2) + 1,
  };
}

function screenCoordsToDirection(
  aframeCamera,
  {x: cameraX, y: cameraY, z: cameraZ},
  {x: clientX, y: clientY}
) {

  // scale mouse coordinates down to -1 <-> +1
  const {x: mouseX, y: mouseY} = clientCoordsTo3DCanvasCoords(
    clientX, clientY,
    0, 0, // TODO: Replace with canvas position
    window.innerWidth,
    window.innerHeight
  );

  // apply camera transformation from near-plane of mouse x/y into 3d space
  // NOTE: This should be replaced with THREE code directly once the aframe bug
  // is fixed:
  // const projectedVector = new aframe.THREE
  //  .Vector3(mouseX, mouseY, -1)
  //  .unproject(threeCamera);
  const projectedVector = unproject(
    new aframe.THREE.Vector3(mouseX, mouseY, -1),
    aframeCamera
  );

  const cameraPosAsVec3 = new aframe.THREE.Vector3(cameraX, cameraY, cameraZ);

  // Get the unit length direction vector from the camera's position
  const {x, y, z} = projectedVector.sub(cameraPosAsVec3).normalize();

  return {x, y, z};
}

/**
 * @param planeNormal {THREE.Vector3}
 * @param planeConstant {Float} Distance from origin of the plane
 * @param rayDirection {THREE.Vector3} Direction of ray from the origin
 *
 * @return {THREE.Vector3} The intersection point of the ray and plane
 */
function rayPlaneIntersection(planeNormal, planeConstant, rayDirection) {
  // A line from the camera position toward (and through) the plane
  const distanceToPlane = planeConstant / planeNormal.dot(rayDirection);
  return rayDirection.multiplyScalar(distanceToPlane);
}

/**
 * @param camera Three.js Camera instance
 * @param Object Position of the camera
 * @param Object position of the mouse (scaled to be between -1 to 1)
 * @param depth Depth into the screen to calculate world coordinates for
 */
function directionToWorldCoords(
  camera,
  {x: cameraX, y: cameraY, z: cameraZ},
  {x: directionX, y: directionY, z: directionZ},
  depth
) {

  // TODO: Cache these Vector3's for re-use
  const cameraPosAsVec3 = new aframe.THREE.Vector3(cameraX, cameraY, cameraZ);
  const direction = new aframe.THREE.Vector3(directionX, directionY, directionZ);

  // A line from the camera position toward (and through) the plane
  const newPosition = rayPlaneIntersection(
    camera.getWorldDirection(),
    depth,
    direction
  );

  // Reposition back to the camera position
  const {x, y, z} = newPosition.add(cameraPosAsVec3);

  return {x, y, z};

}

function selectItem(camera, clientX, clientY) {

  const {x: directionX, y: directionY, z: directionZ} = screenCoordsToDirection(
    camera,
    camera.components.position.data,
    {x: clientX, y: clientY}
  );

  const {x: cameraX, y: cameraY, z: cameraZ} = camera.components.position.data;

  const cameraPosAsVec3 = new aframe.THREE.Vector3(cameraX, cameraY, cameraZ);
  const directionAsVec3 = new aframe.THREE.Vector3(directionX, directionY, directionZ);

  const raycaster = new aframe.THREE.Raycaster();

  // TODO: Schema variables
  raycaster.far = Infinity;
  raycaster.near = 0;

  raycaster.set(cameraPosAsVec3, directionAsVec3);

  const selector = '';
  let objects;

  // Push meshes onto list of objects to intersect.
  // TODO: Schema variables
  if (selector) {
    const objectEls = camera.sceneEl.querySelectorAll(selector);
    objects = [];
    for (let i = 0; i < objectEls.length; i++) {
      objects.push(objectEls[i].object3D);
    }
  } else {
    // If objects not defined, intersect with everything.
    objects = camera.sceneEl.object3D.children;
  }

  // TODO: `recursive` as Schema variables
  const recursive = true;

  const intersected = raycaster
    .intersectObjects(objects, recursive)
    // Only keep intersections against objects that have a reference to an entity.
    .filter(intersection => !!intersection.object.el)
    // Only keep ones that are visible
    .filter(intersection => intersection.object.parent.visible)
    // The first element is the closest (TODO: Confirm this is always true)
    [0]; // eslint-disable-line no-unexpected-multiline

  if (!intersected) {
    return {};
  }

  const {point, object} = intersected;

  // Aligned to the world direction of the camera
  // At the specified intersection point
  const plane = new aframe.THREE.Plane().setFromNormalAndCoplanarPoint(
    camera.components.camera.camera.getWorldDirection().clone().negate(),
    point.clone().sub(cameraPosAsVec3)
  );

  const depth = plane.constant;

  const offset = point.sub(object.getWorldPosition());

  return {depth, offset, element: object.el};

}

function dragItem(element, offset, camera, depth, mouseInfo) {

  const {x: offsetX, y: offsetY, z: offsetZ} = offset;
  let lastMouseInfo = mouseInfo;

  function onMouseMove({clientX, clientY}) {

    lastMouseInfo = {clientX, clientY};

    const direction = screenCoordsToDirection(
      camera,
      camera.components.position.data,
      {x: clientX, y: clientY}
    );

    const {x, y, z} = directionToWorldCoords(
      camera.components.camera.camera,
      camera.components.position.data,
      direction,
      depth
    );

    element.setAttribute('position', {x: x - offsetX, y: y - offsetY, z: z - offsetZ});
  }

  function onCameraMove({detail}) {
    if (detail.name === 'position' && !deepEqual(detail.oldData, detail.newData)) {
      onMouseMove(lastMouseInfo);
    }
  }

  document.addEventListener('mousemove', onMouseMove);
  camera.addEventListener('componentchanged', onCameraMove);

  // The "unlisten" function
  return _ => {
    document.removeEventListener('mousemove', onMouseMove);
    camera.removeEventListener('componentchanged', onCameraMove);
  };
}

function run() {
  const camera = scene.camera.el;
  let unlisten;

  document.addEventListener('mousedown', ({clientX, clientY}) => {
    const {depth, offset, element} = selectItem(camera, clientX, clientY);
    if (element) {
      unlisten = dragItem(element, offset, camera, depth, {clientX, clientY});
    }
  });

  document.addEventListener('mouseup', _ => {
    unlisten && unlisten(); // eslint-disable-line no-unused-expressions
    unlisten = undefined;
  });
}

if (scene.hasLoaded) {
  run();
} else {
  scene.addEventListener('loaded', run);
}
