require('webrtc-adapter');

// import stream from './video-stream'; // eslint-disable-line import/imports-first
import aframe from 'aframe'; // eslint-disable-line import/imports-first

/*
var videoElement = document.querySelector('video');

function gotStream(stream) {
  window.stream = stream; // make stream available to console
  videoElement.srcObject = stream;
}

stream().then(gotStream);
*/

const scene = document.querySelector('a-scene');

/**
 * @param camera Three.js Camera instance
 * @param Object Position of the camera
 * @param Object position of the mouse (scaled to be between -1 to 1)
 * @param depth Depth into the screen to calculate world coordinates for
 */
function screenToWorldCoords(
  camera,
  {x: cameraX, y: cameraY, z: cameraZ},
  {x: mouseX, y: mouseY},
  depth
) {

  const cameraPosAsVec3 = new aframe.THREE.Vector3(cameraX, cameraY, cameraZ);

  const projectedVector = new aframe.THREE
    .Vector3(mouseX, mouseY, -1)
    .unproject(camera);

  // Get the unit length direction vector from the camera's position
  const direction = projectedVector.sub(cameraPosAsVec3).normalize();

  // Aligned to the world direction of the camera
  // At the specified depth along the z axis
  const plane = new aframe.THREE.Plane(
    camera.getWorldDirection().clone().negate(),
    depth
  );

  // A line from the camera position toward (and through) the plane
  const newPosition = plane.intersectLine(
    new aframe.THREE.Line3(
      new aframe.THREE.Vector3(),
      direction.multiplyScalar(100.0)
    )
  );

  // Reposition back to the camera position
  const {x, y, z} = newPosition.add(cameraPosAsVec3);

  return {x, y, z};

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

function run() {
  const sphere = document.querySelector('#tracked');
  const camera = scene.camera.el;
  document.addEventListener('mousemove', ({clientX, clientY}) => {

    // scale mouse coordinates down to -1 <-> +1
    const {x: mouseX, y: mouseY} = clientCoordsTo3DCanvasCoords(
      clientX, clientY,
      0, 0,
      window.innerWidth,
      window.innerHeight
    );

    const {x, y, z} = screenToWorldCoords(
      camera.components.camera.camera,
      camera.components.position.data,
      {x: mouseX, y: mouseY},
      2.0
    );

    sphere.setAttribute('position', {x, y, z});
  });
}

if (scene.hasLoaded) {
  run();
} else {
  scene.addEventListener('loaded', run);
}
