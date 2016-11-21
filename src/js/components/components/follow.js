const COMPONENT_NAME = 'follow';

function attachFollowListener(element, followElement) {

  const listener = event => {
    if (event.detail.name === 'position') {
      element.setAttribute('position', event.detail.newData);
    }
  };

  followElement.addEventListener('componentchanged', listener);

  return _ => {
    followElement.removeEventListener('componentchanged', listener);
  };

}

function throwIfNotValidSelector(selector) {
  if (
    !selector
    || Object.prototype.toString.call(selector) !== '[object String]'
    || selector === ''
  ) {
    throw new Error('Must supply a selector to the `follow` component');
  }
}

/**
 * @param aframe {Object} The Aframe instance to register with
 * @param componentName {String} The component name to use. Default: 'follow'
 */
export default function aframeFollowComponent(aframe, componentName = COMPONENT_NAME) {

  aframe.registerComponent(componentName, {
    schema: {
      default: '',
    },

    /**
     * Called once when component is attached. Generally for initial setup.
     */
    init() {
      throwIfNotValidSelector(this.data);

      this._removeFollowListener = attachFollowListener(
        this.el,
        document.querySelector(this.data)
      );
    },

    /**
     * Called when component is attached and when component data changes.
     * Generally modifies the entity based on the data.
     *
     * @param oldData
     */
    update() {
      throwIfNotValidSelector(this.data);

      // eslint-disable-next-line no-unused-expressions
      this._removeFollowListener && this._removeFollowListener();

      this._removeFollowListener = attachFollowListener(
        this.el,
        document.querySelector(this.data)
      );
    },

    /**
     * Called when a component is removed (e.g., via removeAttribute).
     * Generally undoes all modifications to the entity.
     */
    remove() {
      // eslint-disable-next-line no-unused-expressions
      this._removeFollowListener && this._removeFollowListener();
    },

    /**
     * Called when entity pauses.
     * Use to stop or remove any dynamic or background behavior such as events.
     */
    pause() {
      // eslint-disable-next-line no-unused-expressions
      this._removeFollowListener && this._removeFollowListener();
    },

    /**
     * Called when entity resumes.
     * Use to continue or add any dynamic or background behavior such as events.
     */
    play() {
      this._removeFollowListener = attachFollowListener(
        this.el,
        document.querySelector(this.data)
      );
    },
  });
}
