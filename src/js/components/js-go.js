import React from 'react';
import styled from 'styled-components';
import pascalCase from 'pascal-case';

import CatchScene from './scenes/catch';
import MapScene from './scenes/map';
import Caught from './caught';

const Container = styled.section`
  height: 100%;
  overflow: auto; /* prevent child margins from breaking out */
`;

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
      <Caught
        onDone={this.handleCaughtMonsterNext}
        name="The Thing"
        type={{
          colour: 'green',
          name: 'Gelatinous',
        }}
        stats={{
          hp: 100,
          attack: 42,
          defence: 35,
        }}
      />
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
      <Container>{stateRenderer()}</Container>
    );
  },
});

export default JSGo;
