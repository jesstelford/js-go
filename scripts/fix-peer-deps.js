const fs = require('fs');

[
  'aframe-click-drag-component',
  'aframe-extras',
  'aframe-frustum-lock-component',
  'aframe-map',
  'aframe-physics-system',
  'aframe-video-billboard',
].forEach(module => {
  const packageJsonPath = `${process.cwd()}/node_modules/${module}/package.json`;
  const packageJson = require(packageJsonPath); // eslint-disable-line global-require
  const aframePeerDep = packageJson.peerDependencies.aframe;

  if (aframePeerDep.indexOf('0.4.') !== -1) {
    return;
  }

  packageJson.peerDependencies.aframe = `${aframePeerDep} || ^0.4.0`;

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
});
