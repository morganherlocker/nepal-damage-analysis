var turf = require('turf');
var cover = require('tile-cover');
var tilebelt = require('tilebelt');
var normalize = require('geojson-normalize');
var flatten = require('geojson-flatten');
var fs = require('fs');

module.exports = function conflate(tileLayers, tile, done){
  // get tile damage data
  var tiles = JSON.parse(fs.readFileSync(__dirname+'/../data/tiles.json'));

  // clean vector tile data
  var roads = normalize(flatten(tileLayers.streets.road));
  roads.features = roads.features.concat(normalize(flatten(tileLayers.streets.bridge)).features);
  roads.features = roads.features.concat(normalize(flatten(tileLayers.streets.tunnel)).features);
  var buildings = normalize(flatten(tileLayers.streets.building));
  roads = clip(roads, tile);
  roads = normalize(flatten(roads));
  roads = cleanLines(roads);
  buildings = cleanPolys(buildings);

  // attach data    
  roads.features.forEach(function(road){
    road.properties = interpolate(tile, tiles, turf.centroid(road));
  });
  buildings.features.forEach(function(building){
    building.properties = interpolate(tile, tiles, turf.centroid(building));
  });

  var layers = {
    roads: roads,
    buildings: buildings
  };

  done(null, layers);
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

function cleanPolys (polys) {
  polys.features.filter(function(poly){
    if(poly.geometry.type === 'Polygon' || poly.geometry.type === 'MultiPolygon') return true;
  });
  return polys;
}

function interpolate(t, tiles, pt) {
  var z = t[2];
  var kernels = turf.featurecollection([]);
  var top = [t[0],t[1]-1,z];
  var bottom = [t[0],t[1]+1,z];
  var left = [t[0]-1,t[1],z];
  var right = [t[0]+1,t[1],z];
  var topLeft = [t[0]-1,t[1]-1,z];
  var topRight = [t[0]-1,t[1]-1,z];
  var bottomLeft = [t[0]-1,t[1]+1,z];
  var bottomRight = [t[0]-1,t[1]+1,z];

  kernels.features.push(kernelToPoint(t, tiles));
  kernels.features.push(kernelToPoint(top, tiles));
  kernels.features.push(kernelToPoint(bottom, tiles));
  kernels.features.push(kernelToPoint(left, tiles));
  kernels.features.push(kernelToPoint(right, tiles));
  kernels.features.push(kernelToPoint(topLeft, tiles));
  kernels.features.push(kernelToPoint(topRight, tiles));
  kernels.features.push(kernelToPoint(bottomLeft, tiles));
  kernels.features.push(kernelToPoint(bottomRight, tiles));
  
  var pgaTin = turf.tin(kernels, 'pga');
  var pgvTin = turf.tin(kernels, 'pgv');

  pgaTin.features.forEach(function(tri){
    if(turf.inside(pt, tri)){
      pt.properties.pga = turf.planepoint(pt, tri);
    }
  });
  pgvTin.features.forEach(function(tri){
    if(turf.inside(pt, tri)){
      pt.properties.pgv = turf.planepoint(pt, tri);
    }
  });
  return pt.properties;
}

function kernelToPoint(tile, tiles){
  var data = tiles[tile.join('/')];
  var pt = turf.centroid(turf.bboxPolygon(tilebelt.tileToBBOX(tile)));
  pt.properties = data;
  return pt;
}