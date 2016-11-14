import React from 'react';
import {default as ensureSceneLoaded} from '../lib/scenes';

const AframeContainer = React.createClass({

  propTypes: {
    onSceneLoaded: React.PropTypes.func,
    renderAframe: React.PropTypes.func,
  },

  shouldComponentUpdate() {
    return false;
  },

  render() {
    return (
      <div
        ref={ref => ensureSceneLoaded(this.props.onSceneLoaded, ref)}
        dangerouslySetInnerHTML={{__html: this.props.renderAframe()}}
      />
    );
  },

});

export default AframeContainer;
