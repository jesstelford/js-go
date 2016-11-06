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

    // necessary if the user starts dragging before the physics system has
    // finished initializing
    const run = _ => {

      this._monsterBallEl.removeEventListener('loaded', run);

      // We're dealing with a very heavy ball (mass: 100), so we want to
      // reduce the velocity a little
      const velocityDamp = 0.6;

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

      rotatedVelocity.applyAxisAngle(rotation, Math.PI / 4);

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
        ${this._ballInFlight ? 'dynamic-body="mass: 20"' : 'click-drag'}
        position="${this._ballPosition || '0 -0.5 -1'}"
        radius="0.1"
        color="#EF2D5E"
      ></a-sphere>
    `.trim();
  },

  renderMonster() {
    return `
      <a-box
        static-body
        position="0 0.5 -2"
        width="0.5"
        height="1"
        depth="0.5"
        color="#EF2D5E"
      ></a-box>
    `.trim();
  },

  renderAframe() {

    return `
      <a-scene debug class="scene" physics>

        ${/* Our transparent "ground" */''}
        <a-plane
          static-body
          position="0 0 0"
          rotation="-90 0 0"
          width="100"
          height="100"
          visible="false"
        ></a-plane>

        ${this.renderMonster()}

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

  getOutOfDodge() {
    console.log('run away!');
  },

  render() {
    return (
      <div>
        <div ref={this.onRef} dangerouslySetInnerHTML={{__html: this.renderAframe()}} />
        <div style={{position: 'absolute', top: '10px', right: '10px', backgroundColor: 'white', padding: '10px'}} onClick={this.getOutOfDodge}>
          Run
        </div>
      </div>
    );
  },
});

export default Catch;
