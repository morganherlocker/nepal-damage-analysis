var turf = require('turf');
var cover = require('tile-cover');
var tilebelt = require('tilebelt');
var normalize = require('geojson-normalize');
var flatten = require('geojson-flatten');

module.exports = function conflate(tileLayers, tile){
  var streets = normalize(flatten(tileLayers.streets.road));
  streets.features = streets.features.concat(normalize(flatten(tileLayers.streets.bridge)).features);
  streets.features = streets.features.concat(normalize(flatten(tileLayers.streets.tunnel)).features);
  var building = normalize(flatten(tileLayers.streets.building));

  streets = clip(streets, tile);
  runkeeper = clip(runkeeper, tile);
  streets = normalize(flatten(streets));
  runkeeper = normalize(flatten(runkeeper));
  streets = cleanLines(streets);
  runkeeper = cleanLines(runkeeper);

  var layers = {
    roads: streets,
    buildings: buildings
  }
  return diffFc;
}

function clip(lines, tile) {
  lines.features = lines.features.map(function(line){
      try {
        var clipped = turf.intersect(line, turf.polygon(tilebelt.tileToGeoJSON(tile).coordinates));
        return clipped;
      } catch(e){
        return;
      }
    });
    lines.features = lines.features.filter(function(line){
      if(line) return true;
    });
    return lines;
}

function cleanLines (lines) {
  lines.features.filter(function(line){
    if(line.geometry.type === 'LineString' || line.geometry.type === 'MultiLineString') return true;
  });
  return lines;
}