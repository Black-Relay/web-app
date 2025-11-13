# OSM Tile Server Setup

## Download map data

In a terminal navigate to the `maps` directory and download the map using whatever command your system requires. Below is an example.

```bash
wget https://download.geofabrik.de/north-america/us/north-carolina-latest.osm.pbf
```

## Create the osm-data volume

```bash
docker volume create osm-data
```

## Install and import map data

```bash
time \
    docker run \
    -v ./maps/north-carolina-latest.osm.pbf:/data/region.osm.pbf \
    -v osm-data:/data/database/ \
    overv/openstreetmap-tile-server import
```

## Start Tile Server

```bash
docker run \
    -p 8080:80 \
    -v osm-data:/data/database \
    -d overv/openstreetmap-tile-server \
    run
```

## Test Server

### World Rendering

Navigate to `http://[ip_or_domain]:[port]/tile/0/0/0.png`
You should see a map of the world

##### Test Zoom Functionality

Navigate to `http://[ip_or_domain]:[port]`
You should see a map of the world that allows you to zoom in and out

### Pulling Tiles

To pull tiles, fetch requests should use the following url:
`http://[ip_or_domain]:[port]/{z}/{x}/{y}.png`
**Note: the {z}, {x}, and {y} should be verbatim as written in order to allow for proper tile serving. While they can be replaced with `number` variables, this will lock some of the out of the box features from being available to the user**
