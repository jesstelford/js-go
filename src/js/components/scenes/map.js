import React from 'react';
import styled, {keyframes} from 'styled-components';
import style from './style.json';
import {addPrefixedEventListener, domFromString} from '../../lib/dom';
import getVenues from '../../lib/foursquare';
import AframeContainer from '../aframe-container';

const venueCache = {};

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

const Map = React.createClass({

  propTypes: {
    onHuntMonster: React.PropTypes.func.isRequired,
    onOpenMenu: React.PropTypes.func.isRequired,
    transitionIn: React.PropTypes.func,
    transitionOut: React.PropTypes.func,
  },

  // Creating an inverted cone and adding it to the scene as a place marker
  addMarker() {

    const marker = domFromString(
      `
        <a-entity>
          <a-cone
            height="0.8"
            radius-bottom="0"
            radius-top="0.1"
            rotation="90 0 0"
            position="0 0 0.25"
            color="#10d4ff"
          ></a-cone>
          <a-sphere
            radius="0.3"
            position="0 0 0.9"
            color="#10d4ff"
          ></a-cone>
        </a-entity>
      `.trim()
    );

    this._mapEl.appendChild(marker);

    return marker;

  },

  // Whenever we have a new location, add new markers,
  // and update all markers positions.
  // If a marker is off the map, hide it
  onLocationUpdate(lat, long, width, height) {

    const halfWidth = width / 2;
    const halfHeight = height / 2;

    const ne = this._mapEl.components.map.unproject(halfWidth, halfHeight);
    const sw = this._mapEl.components.map.unproject(-halfWidth, -halfHeight);

    const boundingBox = {
      ne: {
        lat: ne[1],
        long: ne[0],
      },
      sw: {
        lat: sw[1],
        long: sw[0],
      },
    };

    getVenues(boundingBox).then(venues => {
      venues.map(({id, location}) => ({
        id,
        lat: location.lat,
        long: location.lng,
      }))
      .filter(({id}) => !venueCache[id])
      .forEach(venue => {
        venue.marker = this.addMarker();
        venueCache[venue.id] = venue;
        console.log(`created marker at ${venue.lat} ${venue.long}`);
        venue.marker.addEventListener('click', _ => {
          console.log(`clicked marker at ${venue.lat} ${venue.long}`);
        });
      });

      Object.keys(venueCache).forEach(markerId => {
        const venue = venueCache[markerId];
        const position = this._mapEl.components.map.project(venue.long, venue.lat);

        if (
          position.x > halfWidth
          || position.x < -halfWidth
          || position.y > halfHeight
          || position.y < -halfHeight
        ) {
          venue.marker.setAttribute('visible', false);
          venue.marker.setAttribute('material', 'visible', false);
        } else {
          venue.marker.setAttribute('visible', true);
          venue.marker.setAttribute('material', 'visible', true);
        }

        venue.marker.setAttribute('position', position);
      });
    });
  },

  onSceneLoaded(scene) {

    if (!scene || (scene && this.state.hasLoaded)) {
      return;
    }

    this._scene = scene;

    const currentLocationEl = this._scene.querySelector('#current-location');
    this._mapEl = this._scene.querySelector('a-map');

    // Once the map is loaded
    this._mapEl.addEventListener('map-loaded', _ => {

      const geomData = this._mapEl.components.geometry.data;

      const options = {
        enableHighAccuracy: true,
      };

      this._mapEl.setAttribute('map', 'style', JSON.stringify(style));

      // Get the user's location from the browser
      this._geoWatchId = navigator.geolocation.watchPosition(position => {

        const long = position.coords.longitude;
        const lat = position.coords.latitude;

        // center the map on that location
        this._mapEl.setAttribute('map', 'center', `${long} ${lat}`);

        // and zoom in: 20 is very zoomed in, 0 is really zoomed out
        this._mapEl.setAttribute('map', 'zoom', '16');

        // Place the marker in the correct position
        // setProperty(currentLocationEl, 'position', this._mapEl.components.map.project(long, lat));
        currentLocationEl.setAttribute('position', {x: 0, y: 0, z: 0});
        currentLocationEl.setAttribute('visible', true);
        currentLocationEl.setAttribute('material', 'visible', true);

        this.onLocationUpdate(lat, long, geomData.width, geomData.height);

      }, error => {
        // eslint-disable-next-line no-console
        console.error(error);
      }, options);

      // Purposely don't do this inside the location callback as the scene has
      // still "loaded", we're just waiting on more accurate location data.
      if (!this.state.hasLoaded) {
        this.setState({hasLoaded: true});
      }
    });

  },

  getInitialState() {
    return {
      hasLoaded: false,
    };
  },

  componentWillUnmount() {
    if (this._geoWatchId) {
      navigator.geolocation.clearWatch(this._geoWatchId);
    }

    // Otherwise, pending rAF's still execute the `.tick()` function of
    // components and systems
    if (this._scene) {
      this._scene.pause();
    }
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
      <a-scene fog="type: linear; color: #fff; near: 10; far: 15">

        <a-assets>
          <img id="sky-clouds" src="img/sky-clouds.jpg">
        </a-assets>

        <a-map
          width="35"
          height="35"
          map="pxToWorldRatio: 50"
          position="0 0 0"
          rotation="-90 0 0"
        >

          <a-sphere
            id="current-location"
            color="#00f"
            position="0 0 0"
            visible="false"
            radius="0.05"
          ></a-sphere>

        </a-map>

        <a-entity position="0 0.4 1">
          <a-camera
            id="camera"
            position="0.46 1.6 -0.9"
            rotation="-35 -250 0"
            mouse-cursor
          >
          </a-camera>
          <a-entity follow="#camera">
            <a-sphere
              radius="30"
              scale="-1 1 1"
              position="0 -7 0"
              material="fog: false; shader: flat"
              src="#sky-clouds"
            ></a-sphere>
          </a-entity>
        </a-entity>
      </a-scene>
    `.trim();
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
            bottom: '10px',
            right: '10px',
            backgroundColor: 'white',
            padding: '10px',
          }}
          onClick={this.props.onOpenMenu}
        >
          Menu
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            backgroundColor: 'white',
            padding: '10px',
          }}
          onClick={this.props.onHuntMonster}
        >
          Hunt!
        </div>
      </Container>
    );
  },
});

export default Map;
