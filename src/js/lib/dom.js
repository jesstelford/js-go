module.exports = {
  domFromString: string => {
    const containerEl = document.createElement('div');
    containerEl.innerHTML = string;
    return containerEl.children[0];
  },
};
