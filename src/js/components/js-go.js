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

  handleHuntMonster(monster) {
    this.setState({
      gameState: 'catch',
      monster,
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
        onHuntMonster={monster => this.triggerTransition(this.handleHuntMonster.bind(this, monster))}
        transitionOut={this.state.transitioningOut && this.state.onTransitionEnd}
        transitionIn={this.state.transitioningIn && this.state.onTransitionEnd}
      />
    );
  },

  renderCatchState() {
    return (
      <CatchScene
        monster={this.state.monster}
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
        {...this.state.monster}
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
