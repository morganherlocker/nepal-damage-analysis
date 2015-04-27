var TileReduce = require('tile-reduce');
var turf = require('turf');
var cover = require('tile-cover');
var queue = require('queue-async');
var fs = require('fs');

// delete old data
if(fs.existsSync(__dirname+'/../data/buildings.geojson')) fs.unlinkSync(__dirname+'/../data/buildings.geojson');
if(fs.existsSync(__dirname+'/../data/roads.geojson')) fs.unlinkSync(__dirname+'/../data/roads.geojson');
fs.appendFileSync(__dirname+'/../data/roads.geojson', '{"type": "FeatureCollection","features": [');
fs.appendFileSync(__dirname+'/../data/buildings.geojson', '{"type": "FeatureCollection","features": [');

var bbox = [
    81.925048828125,
    25.681137335685307,
    87.593994140625,
    30.704058230919504
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
  map: __dirname+'/conflate.js'
};

var jobZoom = 12;
var jobs = cover.tiles(turf.bboxPolygon(bbox).geometry, {min_zoom: jobZoom, max_zoom: jobZoom});
var jobCount = 0;

console.log(jobs.length+' jobs to process\n==============');
var q = queue(1);
jobs.forEach(function(job){
  q.defer(processJob, job);
});

q.awaitAll(function(err, res){
  console.log('COMPLETE')
  console.log('processed '+jobs.length*256+' tiles in '+ jobs.length +' jobs');
  fs.appendFileSync(__dirname+'/../data/roads.geojson', ']}');
  fs.appendFileSync(__dirname+'/../data/buildings.geojson', ']}');
});

function processJob(job, done) {
  jobCount++;
  var tilereduce = TileReduce(job, opts);

  tilereduce.on('start', function(tiles){
    console.log('job '+job.join('/'));
    console.log(jobCount+' / '+jobs.length+' complete')
    console.log('processing ' + tiles.length + ' tiles\n-------------');
  });

  tilereduce.on('reduce', function(layers){
    //if(layers.roads.features.length) console.log(layers.roads.features.length + ' roads');
    //if(layers.buildings.features.length) console.log(layers.buildings.features.length + ' buildings');
    layers.roads.features.forEach(function(road){
      fs.appendFileSync(__dirname+'/../data/roads.geojson', JSON.stringify(road)+',');
    });
    layers.buildings.features.forEach(function(building){
      fs.appendFileSync(__dirname+'/../data/buildings.geojson', JSON.stringify(building)+',');
    });
  });

  tilereduce.on('end', function(error){
    done();
  });

  tilereduce.run();
}