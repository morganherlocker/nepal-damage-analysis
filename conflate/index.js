var TileReduce = require('tile-reduce');
var turf = require('turf');

var bbox = [
  81.73828125,
  25.562265014427492,
  87.64892578125,
  30.751277776257812
  ];


var opts = {
  zoom: 15,
  tileLayers: [
      {
        name: 'streets',
        url: 'https://b.tiles.mapbox.com/v4/mapbox.mapbox-streets-v6/{z}/{x}/{y}.vector.pbf?access_token=pk.eyJ1IjoibW9yZ2FuaGVybG9ja2VyIiwiYSI6Ii1zLU4xOWMifQ.FubD68OEerk74AYCLduMZQ',
        layers: ['building', 'road', 'bridge', 'tunnel']
      }
    ],
  map: __dirname+'/trace.js'
};

var tilereduce = TileReduce(bbox, opts);

var layers = {
  buildings: turf.featurecollection([]),
  roads: turf.featurecollection([])
};

tilereduce.on('start', function(tiles){
  console.log('processing ' + tiles.length + ' tiles')
});

tilereduce.on('reduce', function(result){
  layers.buildings.features = layers.buildings.features.concat(result.buildings.features);
  layers.roads.features = layers.roads.features.concat(result.roads.features);
});

tilereduce.on('end', function(error){
  console.log(JSON.stringify(missing));
});

tilereduce.run();