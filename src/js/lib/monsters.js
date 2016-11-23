import monsters from '../monsters.json';

export default function getMonsters(boundingBox) {
  const latDiff = boundingBox.ne.lat - boundingBox.sw.lat;
  const longDiff = boundingBox.ne.long - boundingBox.sw.long;

  const lat = boundingBox.sw.lat + (Math.random() * latDiff);
  const long = boundingBox.sw.long + (Math.random() * longDiff);

  return Promise.resolve([{
    lat,
    long,
    ...monsters[Math.floor(Math.random() * monsters.length)],
  }]);
}
