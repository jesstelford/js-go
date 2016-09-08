import aframe from 'aframe';
import deepEqual from 'deep-equal';

let timeStart;

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

function getWorldValues(element) {

  return {
    position: element.object3D.getWorldPosition(),
    rotation: element.object3D.getWorldRotation(),
  };

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

      const unlisten = addElementToHeirarchy(element, this._heirarchy, ({detail: {newData}}) => {
        if (this.data.active) {
          if (!timeStart) {
            timeStart = performance.now();
          }
          const worldValues = getWorldValues(this.el);
          worldValues.positoin = Object.assign({}, newData);
          const {x, y, z} = worldValues.position;
          //console.log({x, y, z}, {x: newData.x, y: newData.y, z: newData.z - 2});
          this.el.emit('anchorupdated', {components: worldValues});
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
      timeStart = performance.now();
      this.el.emit('anchorupdated', {components: getWorldValues(this.el)});
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

      //console.log('time taken:', performance.now() - timeStart);
      timeStart = 0;
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
