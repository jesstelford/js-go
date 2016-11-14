import aframe from 'aframe';
import React from 'react';
import styled, {keyframes} from 'styled-components';
import {addPrefixedEventListener, domFromString} from '../../lib/dom';
import AframeContainer from '../aframe-container';

const setProperty = aframe.utils.entity.setComponentProperty;
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
            height="0.5"
            radius-bottom="0"
            radius-top="0.05"
            rotation="90 0 0"
            position="0 0 0.25"
            color="#f00"
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

    // foursquare's free venues API
    fetch(`https://api.foursquare.com/v2/venues/explore?client_id=MWVIR52CTGVY0GZGFJB53UEUJRGJETB3SQI4KY1JWAEA1GIO&client_secret=TME3XHDYNTXQX0MMF3AME2TYW1F4KY5QUOI4RL5AP1P0GGXR&v=20161018&m=foursquare&ll=${lat},${long}&section=topPicks&time=any&day=any`)
      .then(res => res.json())
      .then(res => {
        res.response.groups[0].items.map(({venue}) => ({
          id: venue.id,
          lat: venue.location.lat,
          long: venue.location.lng,
        }))
        .filter(({id}) => !venueCache[id])
        .forEach(venue => {
          venue.marker = this.addMarker();
          venueCache[venue.id] = venue;
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
            setProperty(venue.marker, 'visible', false);
          } else {
            setProperty(venue.marker, 'visible', true);
          }

          setProperty(venue.marker, 'position', position);
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

      // Get the user's location from the browser
      this._geoWatchId = navigator.geolocation.watchPosition(position => {

        const long = position.coords.longitude;
        const lat = position.coords.latitude;

        // center the map on that location
        setProperty(this._mapEl, 'map.center', `${long} ${lat}`);

        // and zoom in: 20 is very zoomed in, 0 is really zoomed out
        setProperty(this._mapEl, 'map.zoom', '13');

        // Place the marker in the correct position
        setProperty(currentLocationEl, 'position', this._mapEl.components.map.project(long, lat));
        setProperty(currentLocationEl, 'visible', true);

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
      <a-scene>

        <a-map
          width="7"
          height="4"
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

        <a-sky color="#ECECEC"></a-sky>

        <a-entity position="0 0.4 1">
          <a-camera></a-camera>
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
