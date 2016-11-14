const state = {};

const stateMap = {
  map: {
    to: ['catch'],
    onEnter: (fromState, toState, fromData) => Promise.resolve({message: 'enter catch from map'}),
    onExit: (fromState, toState, fromData) => Promise.resolve({message: 'enter catch from map'}),
  },
  menu: {
    catch: {
      onEnter: _ => Promise.resolve({message: 'enter catch from menu'}),
    },
  },
};

const stateStack = [];

const onStateChange = (fromState, toState) => {
  if (state.transitioningTo) {
    throw new Error(`Cannot transition. Already transitioning to ${state.transitioningTo}`);
  }

  if (!stateMap[fromState]) {
    throw new Error(`How did we get into this state!? ${fromState}`);
  }

  const transition = stateMap[fromState][toState];

  if (!transition) {
    throw new Error(`Illegal state transition: [${fromState}] to [${toState}]`);
  }

  state.transitioningTo = toState;

  Promise.resolve(transition.onEnter(fromState, toState, state.data))
    .then(newStateData => {
      state.data = newStateData;
      delete state.transitioningTo;
    })
    .catch(error => {
      /* eslint-disable no-console */
      console.error(`Failed to change state: [${fromState}] to [${toState}].`);

      if (process.env.NODE_ENV !== 'production') {
        console.error(`${error.message || error.toString()}`);
      }

      /* eslint-enable no-console */
      delete state.transitioningTo;
    });

};

