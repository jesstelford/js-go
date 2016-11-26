import React from 'react';

export default {
  name: React.PropTypes.string.isRequired,
  stats: React.PropTypes.shape({
    hp: React.PropTypes.number.isRequired,
    defence: React.PropTypes.number.isRequired,
    attack: React.PropTypes.number.isRequired,
  }).isRequired,
  onDone: React.PropTypes.func.isRequired,
  type: React.PropTypes.shape({
    name: React.PropTypes.string.isRequired,
    colour: React.PropTypes.string,
  }).isRequired,
  transitionOut: React.PropTypes.func,
  transitionIn: React.PropTypes.func,
};
