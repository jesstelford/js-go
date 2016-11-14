import aframe from 'aframe';
import React from 'react';
import asap from 'asap';
import styled, {keyframes} from 'styled-components';
import {addPrefixedEventListener, domFromString} from '../../lib/dom';
import AframeContainer from '../aframe-container';

const transitionInAnimation = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const transitionOutAnimation = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

function getTransitionInStyle(props) {
  if (!props.transitionIn) {
    return '';
  }
  return props.hasLoaded ? `animation: ${transitionInAnimation} 1s ease-out` : 'opacity: 0';
}

function getTransitionOutStyle(props) {
  return props.transitionOut ? `animation: ${transitionOutAnimation} 1s ease-out` : '';
}

const Container = styled.section`
  ${getTransitionInStyle}
  ${getTransitionOutStyle}
`;

const Catch = React.createClass({

  propTypes: {
    onGetOutOfDodge: React.PropTypes.func.isRequired,
    onCatchMonster: React.PropTypes.func.isRequired,
    transitionIn: React.PropTypes.func,
    transitionOut: React.PropTypes.func,
  },

  onMonsterBallCollision({detail: {body: {el: collidedWith}}}) {
    if (collidedWith === this._monsterEl) {
      // Note: We're inside the phsyics collision handler now.
      // If we were to signal that the monster was caught now, it would remove
      // the bodies from the world while it is still processing, resulting in
      // weird behaviour.
      // Instead, we do it as soon as possible after the current task has
      // finished executing.
      // We can't even `.pause()`, because that removes the body too
      asap(this.props.onCatchMonster);
      return;
    }
  },

  monsterBallLoaded() {
    this._monsterBallEl.addEventListener('collide', this.onMonsterBallCollision);
  },

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

      this.monsterBallLoaded();

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

  onSceneLoaded(scene) {

    if (!scene || (scene && this.state.hasLoaded)) {
      return;
    }

    this._scene = scene;

    this._monsterBallEl = scene.querySelector('#monster-ball');
    this._monsterEl = scene.querySelector('#monster');

    this._monsterBallEl.addEventListener('dragend', this.onDragend);

    this.monsterBallLoaded();

    if (!this.state.hasLoaded) {
      this.setState({hasLoaded: true});
    }

  },

  getInitialState() {
    return {
      hasLoaded: false,
    };
  },

  componentWillUnmount() {
    // Tear down
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
        id="monster"
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

    /* eslint-disable max-len */
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
    /* eslint-enable max-len */
  },

  onRef(ref) {
    if (!ref) {
      return;
    }

    // transition animation callbacks
    addPrefixedEventListener(ref, 'animationend', ({animationName}) => {
      if (animationName === transitionInAnimation) {
        this.props.transitionIn();
      } else if (animationName === transitionOutAnimation) {
        this.props.transitionOut();
      }
    });

  },

  render() {
    return (
      <Container
        transitionIn={this.props.transitionIn}
        transitionOut={this.props.transitionOut}
        hasLoaded={this.state.hasLoaded}
        innerRef={this.onRef}
      >
        <AframeContainer
          onSceneLoaded={this.onSceneLoaded}
          renderAframe={this.renderAframe}
        />
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: 'white',
            padding: '10px',
          }}
          onClick={this.props.onGetOutOfDodge}
        >
          Run
        </div>
      </Container>
    );
  },
});

export default Catch;
