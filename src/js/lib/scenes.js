export default function ensureSceneLoaded(callback, ref) {

  if (!ref) {
    callback();
    return;
  }

  const scene = ref.querySelector('a-scene');

  // Wait until it's finished loading before trying anymore more
  const run = _ => {
    scene.removeEventListener('loaded', run);
    callback(scene);
  };

  if (!scene.hasLoaded) {
    scene.addEventListener('loaded', run);
  } else {
    run();
  }

}
