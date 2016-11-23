import {decimalFloor, decimalCeil, decimalRound} from './math';

const boundingPrecision = {
  '1000km': 1,
  '100km': 0,
  '10km': -1,
  '1km': -2,
  '100m': -3,
  '10m': -4,
  '1m': -5,
}['1km'];

const cache = {};

function getByBoundingArea(boundingBox) {

  // foursquare's free venues API
  return fetch(`https://api.foursquare.com/v2/venues/search?client_id=MWVIR52CTGVY0GZGFJB53UEUJRGJETB3SQI4KY1JWAEA1GIO&client_secret=TME3XHDYNTXQX0MMF3AME2TYW1F4KY5QUOI4RL5AP1P0GGXR&v=20161018&m=foursquare&ne=${boundingBox.ne.lat},${boundingBox.ne.long}&sw=${boundingBox.sw.lat},${boundingBox.sw.long}&intent=browse&limit=50`)
    .then(res => res.json())
    .then(res => res.response.venues);
}

function getResolveFunction(south, west, increment) {

  const cacheKey = `${south}x${west}`;

  if (cache[cacheKey]) {
    return _ => Promise.resolve(cache[cacheKey]);
  }

  return _ => (
    getByBoundingArea({
      ne: {
        lat: south + increment,
        long: west + increment,
      },
      sw: {
        lat: south,
        long: west,
      },
    }).then(result => {
      cache[cacheKey] = result;
      return result;
    })
  );

}

export default function getVenues(boundingBox) {
  // Positive latitude is above the equator (N), and negative latitude is
  // below the equator (S).
  // Positive longitude is east of the prime meridian, while negative
  // longitude is west of the prime meridian.

  const southInitial = decimalFloor(boundingBox.sw.lat, boundingPrecision);
  const westInitial = decimalFloor(boundingBox.sw.long, boundingPrecision);
  const north = decimalCeil(boundingBox.ne.lat, boundingPrecision);
  const east = decimalCeil(boundingBox.ne.long, boundingPrecision);

  const increment = Math.pow(10, boundingPrecision);

  const resolveFuncs = [];

  for (
    let south = southInitial;
    south < north;
    south = decimalRound(south + increment, boundingPrecision)
  ) {
    for (
      let west = westInitial;
      west < east;
      west = decimalRound(west + increment, boundingPrecision)
    ) {
      resolveFuncs.push(getResolveFunction(south, west, increment));
    }
  }

  // TODO: Replace with waterfall to avoid foursquare rate limits?
  return Promise.all(resolveFuncs.map(func => func())).then(results => (
    // flatten the results
    Array.prototype.concat.apply([], results)
  ));
}
