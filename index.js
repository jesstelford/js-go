'use strict';

var videoElement = document.querySelector('video');

function getVideoBySource(videoSource) {
  var constraints = {
    video: {
      deviceId: videoSource && videoSource.deviceId ? {exact: videoSource.deviceId} : undefined
    }
  };

  return navigator.mediaDevices.getUserMedia(constraints)
}

function askPermission() {
  return getVideoBySource();
}

function getDevices() {
  return navigator.mediaDevices.enumerateDevices();
}

function getRearFacingVideoSource(sources) {

  return getDevices().then(function (sources) {

    var videoSources = sources.filter(source => source.kind === 'videoinput')

    if (!videoSources.length) {
      throw new Error('Could not find any video sources');
    }

    var rearVideoSource;

    videoSources.some(function(sourceInfo) {
      var labelLower = sourceInfo.label.toLowerCase();
      if (
        labelLower.indexOf('back') !== -1
        || labelLower.indexOf('environment') !== -1
        || labelLower.indexOf('rear') !== -1
      ) {
        rearVideoSource = sourceInfo;
        return true;
      }
      return false;
    })

    return rearVideoSource || videoSources[0];

  });

}

function getVideoStream(source) {
  return getVideoBySource(source);
}


function gotStream(stream) {
  window.stream = stream; // make stream available to console
  videoElement.srcObject = stream;
}

function start() {
  askPermission()
    .then(getRearFacingVideoSource)
    .then(getVideoStream)
    .then(gotStream)
    .catch(handleError);
}

start();

function handleError(error) {
  console.error('navigator.getUserMedia error: ', error);
}

