import aframe from 'aframe';
import React from 'react';
import ReactDOM from 'react-dom';
import aframeExtras from 'aframe-extras';
import registerClickDragComponent from 'aframe-click-drag-component';
import registerFrustumLockComponent from 'aframe-frustum-lock-component';
import registerVideoBillboard from 'aframe-video-billboard';
import aframeKeyboardControls from 'aframe-keyboard-controls';
import registerMap from 'aframe-map';
import {injectGlobal as injectGlobalStyle} from 'styled-components';

import JSGo from './components/js-go';

require('webrtc-adapter');

aframe.registerComponent('keyboard-controls', aframeKeyboardControls);
registerClickDragComponent(aframe);
registerFrustumLockComponent(aframe);
registerVideoBillboard(aframe);
registerMap(aframe);
aframeExtras.physics.registerAll(aframe);
aframeExtras.controls.registerAll(aframe);

// apply a natural box layout model to all elements,
// but allowing components to change
// eslint-disable-next-line no-unused-expressions
injectGlobalStyle`
  html {
    box-sizing: border-box;
  }
  *, *:before, *:after {
    box-sizing: inherit;
  }
  html, body {
    height: 100%;
    height: 100%;
  }
  #js-go {
    height: 100%;
  }
`;

document.addEventListener('DOMContentLoaded', _ => {
  ReactDOM.render(<JSGo />, document.querySelector('#js-go'));
});
