// import stream from './video-stream';
import aframe from 'aframe';
import aframeExtras from 'aframe-extras';
import draggable from './components/drag-move';

require('webrtc-adapter');

aframeExtras.physics.registerAll(aframe);
aframeExtras.primitives.registerAll(aframe);
draggable(aframe);

/*
var videoElement = document.querySelector('video');

function gotStream(stream) {
  window.stream = stream; // make stream available to console
  videoElement.srcObject = stream;
}

stream().then(gotStream);
*/
