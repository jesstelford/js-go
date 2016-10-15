Map:

http://gis.stackexchange.com/a/94017
https://github.com/OSMBuildings/OSMBuildings
http://blog.webkid.io/3d-map-library-roundup/

## Talk Structure

### Sections

1. Intro
1. As a web page
1. Catching Pokemon
1. Location aware maps
1. Save to homescreen
1. Shared world
1. Pokestops
1. Gyms
1. Offline
1. Catching Pokemon revisited (VR)
1. PvP trainer battles

### Catching Pokemon

* WebGL (is hard)
* Aframe
* Physics (also hard)
  * Cannon.js

### Location aware maps

* Getting user location
* Map data (GIS)

### Save to homescreen

* Manifests
* ??

### Shared world

* Node.js
* MongoDB(?)
* Scalable servers (now.sh)

### Pokestops

* Public locations data (Foursquare? Google Locations? Yahoo Locations?)

### Gyms

* Same as pokestops
* But has current state (owner)

### Offline

* Service Workers

### Catching Pokemon revisited (VR)

* aframe gives it to us fo free
* Rethink UX
  * Single touch in Cardboard
  * multiple controllers in Vive

### PvP trainer battles

* WebRTC (is hard)
* WebTorrent (is easier)

## Code

- Use `aframe-react` to handle scene.
  - Needs modifying to support any `onX` events
    (`Object.keys(this.props).filter(key => key.indexOf('on') === 0).map(convertToSnakeCaseAndAttachEventListener)`)
  - Use it to enable / disable the `<a-scene>`
  - Structure code to support multiple different scenes
  - Start on map scene
- Fix the fullscreen black-background issue: https://aframevr.slack.com/archives/projects/p1475909091000860
