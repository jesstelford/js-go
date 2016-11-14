const prefixes = ['webkit', 'moz', 'MS', 'o', ''];

module.exports = {

  domFromString: string => {
    const containerEl = document.createElement('div');
    containerEl.innerHTML = string;
    return containerEl.children[0];
  },

  addPrefixedEventListener(element, type, callback) {
    for (var p = 0; p < prefixes.length; p++) {
      if (!prefixes[p]) type = type.toLowerCase();
      element.addEventListener(prefixes[p]+type, callback, false);
    }
  },

};
