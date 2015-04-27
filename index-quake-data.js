var cover = require('tile-cover');
var tilebelt = require('tilebelt');
var turf = require('turf');
var fs = require('fs');

//data
var pga = JSON.parse(fs.readFileSync(__dirname+'/data/pga.geojson'));
var pgv = JSON.parse(fs.readFileSync(__dirname+'/data/pgv.geojson'));

var coveropts = {min_zoom: 15, max_zoom: 15};
var tiles = {};

//peak ground acceleration
pga.features.forEach(function(contour){
  var contourTiles = cover.tiles(contour.geometry, coveropts);
  contourTiles.forEach(function(tile){
    if(!tiles[id(tile)]){
      tiles[id(tile)] = {
        pga: 0,
        pgv: 0
      };
    }
    if(tiles[id(tile)].pga < contour.properties.PARAMVALUE) {
      tiles[id(tile)].pga = contour.properties.PARAMVALUE;
    }
  });
});

//peak ground velocity
pgv.features.forEach(function(contour){
  var contourTiles = cover.tiles(contour.geometry, coveropts);
  contourTiles.forEach(function(tile){
    if(!tiles[id(tile)]){
      tiles[id(tile)] = {
        pga: 0,
        pgv: 0
      };
    }
    if(tiles[id(tile)].pgv < contour.properties.PARAMVALUE) {
      tiles[id(tile)].pgv = contour.properties.PARAMVALUE;
    }
  });
});

var fc = turf.featurecollection([]);
Object.keys(tiles).forEach(function(tile){
  var poly = turf.polygon(tilebelt.tileToGeoJSON(tile.split('/').map(parseFloat)).coordinates);
  poly.properties = tiles[tile];
  fc.features.push(poly);
});

fs.writeFileSync(__dirname+'/data/tiles.geojson', JSON.stringify(fc));
fs.writeFileSync(__dirname+'/data/tiles.json', JSON.stringify(tiles));
console.log(Object.keys(tiles).length)
function id (tile){
  return tile[0] + '/' + tile[1] + '/' + tile[2];
}