function getVideoBySource(videoSource) {
  const constraints = {
    video: {
      deviceId: videoSource && videoSource.deviceId ? {exact: videoSource.deviceId} : undefined,
    },
  };

  return navigator.mediaDevices.getUserMedia(constraints);
}

function askPermission() {
  return getVideoBySource();
}

function getDevices() {
  return navigator.mediaDevices.enumerateDevices();
}

function getRearFacingVideoSource() {

  return getDevices().then(sources => {

    const videoSources = sources.filter(source => source.kind === 'videoinput');

    if (!videoSources.length) {
      throw new Error('Could not find any video sources');
    }

    let rearVideoSource;

    videoSources.some(function(sourceInfo) {
      const labelLower = sourceInfo.label.toLowerCase();
      if (
        labelLower.indexOf('back') !== -1
        || labelLower.indexOf('environment') !== -1
        || labelLower.indexOf('rear') !== -1
      ) {
        rearVideoSource = sourceInfo;
        return true;
      }
      return false;
    });

    return rearVideoSource || videoSources[0];

  });

}

function getVideoStream(source) {
  return getVideoBySource(source);
}

function handleError(error) {
  // eslint-disable-next-line no-console
  console.error('navigator.getUserMedia error: ', error);
}

export default function start() {
  return askPermission()
    .then(getRearFacingVideoSource)
    .then(getVideoStream)
    .catch(handleError);
}
