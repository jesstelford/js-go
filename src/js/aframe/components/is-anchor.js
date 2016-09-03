import aframe from 'aframe';
import deepEqual from 'deep-equal';

function listenToComponentChanged(onChange, event) {

  const {newData, oldData} = event.detail;

  // Event seems to fire even when the data hasn't changed
  if (deepEqual(newData, oldData)) {
    return;
  }

  onChange(event);

}

function addElementToHeirarchy(element, heirarchy, onChange) {

  const listener = listenToComponentChanged.bind(null, onChange);

  heirarchy.push(element);

  // TODO: Listen to:
  // `child-attached` - the heirarchy has changed, have to regenerate it
  // What's the equivalent for 'removed'?
  element.addEventListener('componentchanged', listener);

  return _ => element.removeEventListener('componentchanged', listener);

}

function sumKeys(keys, first, second) {
  return keys.reduce((compVals, key) => (
    Object.assign({}, compVals, {[key]: first[key] + second[key]})
  ), {});
}

function sumComponentChildren(componentKeyMap, aggregate, components, newAggregate, component) {
  return Object.assign(
    {},
    newAggregate,
    {
      [component]: sumKeys(
        componentKeyMap[component],
        aggregate[component],
        components[component].data
      ),
    }
  );
}

function sumComponents(aggregate, element) {

  const componentKeyMap = {
    position: ['x', 'y', 'z'],
    rotation: ['x', 'y', 'z'],
  };

  const components = element.components;

  return Object.keys(components)
    .filter(component => Object.keys(componentKeyMap).indexOf(component) !== -1)
    .reduce(sumComponentChildren.bind(null, componentKeyMap, aggregate, components), {});
}

function calculateAggregate(heirarchy) {

  return heirarchy.reduce(
    sumComponents,
    {
      position: {x: 0, y: 0, z: 0},
      rotation: {x: 0, y: 0, z: 0},
    }
  );

}

aframe.registerComponent('is-anchor', {

  schema: {
    active: {
      type: 'boolean',
      default: true,
    },
    relativeTo: {
      type: 'selector',
      default: null,
    },
  },

  init() {

    this._heirarchy = [];
    this._unlisteners = [];

    let element = this.el;

    do {

      const unlisten = addElementToHeirarchy(element, this._heirarchy, _ => {
        if (this.data.active) {
          this.el.emit('anchorupdated', {components: calculateAggregate(this._heirarchy)});
        }
      });

      this._unlisteners.push(unlisten);

      element = element.parentEl;
    } while (
      element
      && element !== this.data.relativeTo
      && element.nodeName.toLowerCase() !== 'a-scene'
    );

    if (process.env.NODE_ENV !== 'production') {
      // Warn if `relative` selector not found in parent tree
      if (this.data.relativeTo && element !== this.data.relativeTo) {
        // eslint-disable-next-line no-console
        console.warn('Unable to find relative component for anchor');
      }
    }
  },

  remove() {
    // Clean up listeners
    this._unlisteners.forEach(unlisten => unlisten());
  },

  update() {
    if (this.data.active) {
      this.el.emit('anchorupdated', {components: calculateAggregate(this._heirarchy)});
    }
  },
});

aframe.registerComponent('track-anchor', {

  schema: {
    active: {
      type: 'boolean',
      default: true,
    },
    anchor: {
      type: 'selector',
      default: null,
    },
    components: {
      type: 'string',
      default: 'position rotation',
      parse(value) {
        return value.split(' ');
      },
    },
  },

  init() {

    const listener = ({detail: {components}}) => {
      Object.keys(components)
        .filter(component => this.data.components.indexOf(component) !== -1)
        .forEach(component => {
          // Update component with the given values
          this.el.setAttribute(component, components[component]);
        });
    }

    if (process.env.NODE_ENV !== 'production') {
      if (!this.data.anchor) {
        // eslint-disable-next-line no-console
        console.warn('Unable to track anchor');
        return;
      }
    }

    this._removeListener = _ => this.data.anchor.removeEventListener('anchorupdated', listener);

    this.data.anchor.addEventListener('anchorupdated', listener);

  },

  remove() {
    // Clean up listeners
    this._removeListener();
  },


});
