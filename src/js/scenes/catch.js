import aframe from 'aframe';
import React from 'react';

const Catch = React.createClass({
  onDragstart() {
    this._monsterBallEl.components['dynamic-body'].pause();
  },

  onDragend({detail: {velocity}}) {

    // We're dealing with a very heavy ball (mass: 100), so we want to
    // reduce the velocity a little
    const velocityDamp = 0.3;

    const camera = this._monsterBallEl.sceneEl.camera;

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

    this._monsterBallEl.components['dynamic-body'].play();
    this._monsterBallEl.body.velocity.set(rotatedVelocity.x, rotatedVelocity.y, rotatedVelocity.z);
  },

  onRef(ref) {
    if (!ref) {
      return;
    }
    this._monsterBallEl = ref.querySelector('#monster-ball');
    this._monsterBallEl.addEventListener('dragstart', this.onDragstart);
    this._monsterBallEl.addEventListener('dragend', this.onDragend);
  },

  renderAframe() {

    return `
      <a-scene debug class="scene" physics>

        <a-grid static-body position="0 0 0"></a-grid>

        <a-sphere
          id="monster-ball"
          click-drag
          dynamic-body="mass: 20"
          position="0 4 -2"
          radius="0.5"
          color="#EF2D5E"
        ></a-sphere>

        <a-box
          dynamic-body
          position="0 3 -2"
          width="0.5"
          height="0.5"
          depth="0.5"
          color="#EF2D5E"
        ></a-box>

        <a-entity
          camera="userHeight: 1.6"
          keyboard-controls="mode: fps"
          universal-controls="movementEnabled: false; rotationControls: hmd"
          position="0 1.6 4"
        >
          <a-video-billboard
            frustum-lock="widthProperty: video-billboard.minWidth; heightProperty: video-billboard.minHeight; depth: 10;"
            position="0 0 0"
          ></a-video-billboard>
        </a-entity>

      </a-scene>
    `.trim();
  },

  render() {
    return (
      <div ref={this.onRef} dangerouslySetInnerHTML={{__html: this.renderAframe()}} />
    );
  },
});

export default Catch;
