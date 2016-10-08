import aframe from 'aframe';
import aframeExtras from 'aframe-extras';
import aframeKeyboardControls from 'aframe-keyboard-controls';
import stream from './video-stream';

require('webrtc-adapter');

aframe.registerComponent('keyboard-controls', aframeKeyboardControls);
aframeExtras.primitives.registerAll(aframe);
aframeExtras.controls.registerAll(aframe);

document.addEventListener('DOMContentLoaded', _ => {
  const videoElement = document.querySelector('video');

  function gotStream(videoStream) {
    window.stream = videoStream; // make stream available to console
    videoElement.srcObject = videoStream;
  }

  stream().then(gotStream);
});
