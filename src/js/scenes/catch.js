import aframe from 'aframe';
import React from 'react';
import {domFromString} from '../lib/dom';

const Catch = React.createClass({

  onDragend({detail: {velocity}}) {

    this._ballInFlight = true;
    this._ballPosition = this._monsterBallEl.object3D.getWorldPosition().toArray().join(' ');

    this._monsterBallEl.pause();

    // Insert a copy of the ball which is globally positioned
    this._monsterBallEl.parentNode.removeChild(this._monsterBallEl);

    this._monsterBallEl = domFromString(this.renderMonsterBall());

    this._scene.appendChild(this._monsterBallEl);

    const run = _ => {

      this._monsterBallEl.removeEventListener('loaded', run);

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

      // this._monsterBallEl.play();

      // Set the velocity to make it fly!
      this._monsterBallEl.body.velocity.set(
        rotatedVelocity.x,
        rotatedVelocity.y,
        rotatedVelocity.z
      );

    };

    if (!this._monsterBallEl.hasLoaded) {
      this._monsterBallEl.addEventListener('loaded', run);
    } else {
      run();
    }

  },

  onRef(ref) {

    this._scene = ref.querySelector('a-scene');

    if (!ref) {
      return;
    }
    this._monsterBallEl = ref.querySelector('#monster-ball');
    this._monsterBallEl.addEventListener('dragend', this.onDragend);
  },

  renderMonsterBall() {
    return `
      <a-sphere
        id="monster-ball"
        ${this._ballInFlight ? 'dynamic-body="mass: 200"' : 'click-drag'}
        position="${this._ballPosition || '0 0 -2'}"
        radius="0.5"
        color="#EF2D5E"
      ></a-sphere>
    `.trim();
  },

  renderAframe() {

    return `
      <a-scene debug class="scene" physics>

        <a-grid static-body position="0 0 0"></a-grid>

        <a-box
          dynamic-body
          position="0 3 -2"
          width="0.5"
          height="0.5"
          depth="0.5"
          color="#EF2D5E"
        ></a-box>

        ${this._ballInFlight ? this.renderMonsterBall() : ''}

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

          ${/* Ball starts attached to the camera */''}
          ${this._ballInFlight ? '' : this.renderMonsterBall()}
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
