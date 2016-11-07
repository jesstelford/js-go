import aframe from 'aframe';
import React from 'react';
import ReactDOM from 'react-dom';
import aframeExtras from 'aframe-extras';
import registerClickDragComponent from 'aframe-click-drag-component';
import registerFrustumLockComponent from 'aframe-frustum-lock-component';
import registerVideoBillboard from 'aframe-video-billboard';
import aframeKeyboardControls from 'aframe-keyboard-controls';
import registerMap from 'aframe-map';

import CatchScene from './scenes/catch';
import MapScene from './scenes/map';

require('webrtc-adapter');

aframe.registerComponent('keyboard-controls', aframeKeyboardControls);
registerClickDragComponent(aframe);
registerFrustumLockComponent(aframe);
registerVideoBillboard(aframe);
registerMap(aframe);
aframeExtras.physics.registerAll(aframe);
aframeExtras.controls.registerAll(aframe);

document.addEventListener('DOMContentLoaded', _ => {
  ReactDOM.render(<MapScene />, document.querySelector('#catch-scene'));
});
