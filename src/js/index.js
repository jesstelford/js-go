import aframe from 'aframe';
import aframeExtras from 'aframe-extras';
import registerClickDragComponent from 'aframe-click-drag-component';
import aframeKeyboardControls from 'aframe-keyboard-controls';
import stream from './video-stream';

require('webrtc-adapter');

aframe.registerComponent('keyboard-controls', aframeKeyboardControls);
registerClickDragComponent(aframe);
aframeExtras.physics.registerAll(aframe);
aframeExtras.primitives.registerAll(aframe);
aframeExtras.controls.registerAll(aframe);

function run() {

  const draggable = document.querySelector('[click-drag]');

  draggable.addEventListener('dragstart', _ => {
    draggable.pause();
  });

  draggable.addEventListener('dragend', ({detail: {velocity}}) => {

    // We're dealing with a very heavy ball (mass: 100), so we want to
    // reduce the velocity a little
    const velocityDamp = 0.3;

    const camera = draggable.sceneEl.camera;

    // The "up" vector of the camera
    const rotation = camera.up.clone();
    // crossed with the "forward" / direction vector of the camera
    // gives us the 3rd orthogonal axis of the camera's rotation
    rotation.cross(camera.getWorldDirection());

    // A damped down velocity vector
    const rotatedVelocity = new aframe.THREE.Vector3(
      velocity.x * velocityDamp,
      velocity.y * velocityDamp,
      velocity.z * velocityDamp
    );

    rotatedVelocity.applyAxisAngle(rotation, Math.PI / 8);

    draggable.play();
    draggable.body.velocity.set(rotatedVelocity.x, rotatedVelocity.y, rotatedVelocity.z);
  });

}

document.addEventListener('DOMContentLoaded', _ => {
  const scene = document.querySelector('a-scene');
  const videoElement = document.querySelector('video');

  function gotStream(videoStream) {
    window.stream = videoStream; // make stream available to console
    videoElement.srcObject = videoStream;
  }

  if (scene.hasLoaded) {
    run();
  } else {
    scene.addEventListener('loaded', run);
  }

  //stream().then(gotStream);
});
