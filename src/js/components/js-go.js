import React from 'react';
import pascalCase from 'pascal-case';

import CatchScene from './scenes/catch';
import MapScene from './scenes/map';

const JSGo = React.createClass({

  getInitialState() {
    return {
      gameState: 'map',
    };
  },

  handleHuntMonster(/* monster */) {
    // TODO: Flesh this out some more?
    this.setState({
      gameState: 'catch',
    });
  },

  handleRunFromMonster(/* monster */) {
    // TODO: Flesh this out some more?
    this.setState({
      gameState: 'map',
    });
  },

  handleCaughtMonsterNext(/* monster */) {
    this.setState({
      gameState: 'map',
    });
  },

  handleCatchMonster(/* monster */) {
    // TODO: Flesh this out some more?
    this.setState({
      gameState: 'caught-monster',
    });
  },

  handleOpenMenu() {
    this.setState({
      gameState: 'menu',
    });
  },

  renderMapState() {
    return (
      <MapScene
        onHuntMonster={this.handleHuntMonster}
        onOpenMenu={this.handleOpenMenu}
      />
    );
  },

  renderCatchState() {
    return (
      <CatchScene
        onGetOutOfDodge={this.handleRunFromMonster}
        onCatchMonster={this.handleCatchMonster}
      />
    );
  },

  renderCaughtMonsterState() {
    return (
      <div>
        🎉 You caught the monster! 🎉
        <button
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
          onClick={this.handleCaughtMonsterNext}
        >
          Done
        </button>
      </div>
    );
  },

  renderMenuState() {
    return (
      <div>
        Menu.
      </div>
    );
  },

  render() {
    const stateRenderer = this[`render${pascalCase(this.state.gameState)}State`];
    return (
      <div>{stateRenderer()}</div>
    );
  },
});

export default JSGo;
