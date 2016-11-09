## Talk Structure

### Sections

1. Intro
1. As a web page
1. Catching Pokemon
1. Location aware maps
1. Save to homescreen
1. Pokestops
1. Gyms
1. Shared world
1. Offline
1. Catching Pokemon revisited (AR)
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

### Pokestops

* Public locations data (Foursquare? Google Locations? Yahoo Locations?)

### Gyms

* Same as pokestops
* But has current state (owner)

### Shared world

* Node.js
* MongoDB(?)
* Scalable servers (now.sh)

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
  - Use it to enable / disable the `<a-scene>`
  - Structure code to support multiple different scenes
  - Start on map scene

### Map

- Local Tile Server with [`tileserver-gl-light` from the TileServer GL project](https://github.com/klokantech/tileserver-gl)
