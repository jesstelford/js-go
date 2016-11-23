## Code

- Add "scope" to the manifest to avoid accidentally landing on splash pages,
  etc. https://developer.mozilla.org/en-US/docs/Web/Manifest#scope
- Open graph / twitter meta: 
```
            <meta property=og:title content="Air Horn">
            <meta property=og:type content=website>
            <meta property=og:image content=https://airhorner.com/images/touch/Airhorner_192.png>
            <meta property=og:url content="https://airhorner.com/">
            <meta property=og:description content="The best and easiest Air Horn web app there is. No install just use it right away in your browser!">
            <meta name=twitter:card content=summary>
            <meta name=twitter:url content="https://airhorner.com/">
            <meta name=twitter:title content="Air Horn">
            <meta name=twitter:description content="The best and easiest Air Horn web app there is. No install just use it right away in your browser!">
            <meta name=twitter:image content=https://airhorner.com/images/touch/Airhorner_192.png>
            <meta name=twitter:creator content=@paul_kinlan>
```

### Map

- Local Tile Server with [`tileserver-gl-light` from the TileServer GL project](https://github.com/klokantech/tileserver-gl)

## Time

All numbers are hours

### Available

Week 1
- ~~2.0 - Sa 2016-11-12~~
- ~~4.0 - Su 2016-11-13~~

Week 2
- ~~2.5 - Mo 2016-11-14~~
- ~~1.0 - Tu 2016-11-15~~
- ~~2.5 - We 2016-11-16~~
- ~~2.5 - Th 2016-11-17~~
- ~~2.5 - Fr 2016-11-18~~
- ~~2.0 - Sa 2016-11-19~~
- ~~0.0 - Su 2016-11-20~~

Week 3
- ~~2.5 - Mo 2016-11-21~~
- ~~1.0 - Tu 2016-11-22~~
- ~~2.5~~ 1 - We 2016-11-23
- 2.5 - Th 2016-11-24
- 2.5 - Fr 2016-11-25
- 3.5 - Sa 2016-11-26
- 1.5 - Su 2016-11-27

Week 4
- 2.5 - Mo 2016-11-28

**31.5 hr - Total**

### Usage

#### Presentation

- 10 - Slides prep
- 3 - Rehersal

#### Code

- ~~2 - Catching a monster state / screen~~
- ~~1 - State management / transitions~~
- ~~2 - Save to homescreen~~
- ~~1 - Offline~~
- ~~1 - Pokestops - Believable number~~
- ~~1 - Pokestops - look-at squashed cylinder~~
- ~~2 - Pokemon - Actually show them on the map / touchable~~
- 2 - Aspect ratio / AR positioning correction
- 2 - Node site
  - 1 - Foursquare API requests
  - 1 - Deployed to now.sh
- 2 - MongoDB with Foursquare cache in GeoJSON format
  - 1 - Setup MongoDB
  - 1 - Cache Foursquare data & search via Geospatial "near"
- 1 - Google Analytics
- 1 - Trace monitoring: https://trace.risingstack.com/
- ~~4~~ 2 - AR UX

**Optional**

- 1 - Pokestops
  - Get items (using a spring to "fling" them at the camera)
- 1 - Pokestops - State for new items
- 3 - Better looking 3D models
  - 1 - Pokestops
  - 1 - Main Character
  - 1 - Monsters
- 1 - Offline -> Online Reconciliation
- 2 - BSP for caching / searching

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

* Public locations data from Foursquare
* Store it all locally

### Gyms

* Same as pokestops
* But has current state (owner)

### Shared world

* Node.js
* MongoDB - with GeoSpatial indexes: https://docs.mongodb.com/v3.2/applications/geospatial-indexes/
* Scalable servers (now.sh)
* Store Pokestops & Gyms in the cloud

### Offline

* Service Workers
* Reconciliation
* Get started with PWAs: https://addyosmani.com/blog/getting-started-with-progressive-web-apps/
  * Manifest generator: https://brucelawson.github.io/manifest/
  * favicon generator: http://realfavicongenerator.net/

### Catching Pokemon revisited (VR)

* aframe gives it to us fo free
* Rethink UX
  * Single touch in Cardboard
  * multiple controllers in Vive

### PvP trainer battles

* WebRTC (is hard)
* WebTorrent (is easier)

## The Talk

- Use Vysor App to mirror the phone's screen on my laptop.
  Be sure to enable fullscreen mode, and hide the Vysor Toolbars
