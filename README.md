# nepal-damage-analysis

Use [Turf](http://turfjs.org/), [TileReduce](https://github.com/mapbox/tile-reduce), and [seisomological data from the USGS](http://earthquake.usgs.gov/earthquakes/shakemap/global/shake/20002926/) to calculate approximate impact levels for each building and road in OpenStreetMap.

To run analysis:

```sh
git clone https://github.com/morganherlocker/nepal-damage-analysis
cd nepal-damage-analysis
npm install
node conflate/index.js
```

This will create roads.geojson and buildings.geojson files in ./data. These large geojson files can be sent through [tippecanoe](https://github.com/mapbox/tippecanoe) for creating vector tile datasets. 

```sh
cd data
cat buildings.geojson | tippecanoe -o buildings.mbtiles
cat roads.geojson | tippecanoe -o roads.mbtiles
```

Processing the entire impact area will take several hours on a typical laptop, so a large multicore ec2 is recommended.
