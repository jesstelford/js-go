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
      gameState: 'catch',
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

  triggerTransition(onTransitionEnd) {

    const transitionedIn = _ => {
      this.setState({
        transitioningOut: false,
        transitioningIn: false,
      });
    };

    const transitionedOut = _ => {
      onTransitionEnd();

      this.setState({
        transitioningOut: false,
        transitioningIn: true,
        onTransitionEnd: transitionedIn,
      });
    };

    this.setState({
      transitioningOut: true,
      onTransitionEnd: transitionedOut,
    });

  },

  renderMapState() {
    return (
      <MapScene
        onOpenMenu={_ => this.triggerTransition(this.handleOpenMenu)}
        onHuntMonster={_ => this.triggerTransition(this.handleHuntMonster)}
        transitionOut={this.state.transitioningOut && this.state.onTransitionEnd}
        transitionIn={this.state.transitioningIn && this.state.onTransitionEnd}
      />
    );
  },

  renderCatchState() {
    return (
      <CatchScene
        onGetOutOfDodge={_ => this.triggerTransition(this.handleRunFromMonster)}
        onCatchMonster={_ => this.triggerTransition(this.handleCatchMonster)}
        transitionOut={this.state.transitioningOut && this.state.onTransitionEnd}
        transitionIn={this.state.transitioningIn && this.state.onTransitionEnd}
      />
    );
  },

  renderCaughtMonsterState() {
    return (
      <Caught
        onDone={_ => this.triggerTransition(this.handleCaughtMonsterNext)}
        transitionOut={this.state.transitioningOut && this.state.onTransitionEnd}
        transitionIn={this.state.transitioningIn && this.state.onTransitionEnd}
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
