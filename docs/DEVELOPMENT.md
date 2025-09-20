## Prerequisites

Ensure you have the following installed locally:
- NPM
- Node
- Docker

## Usage
1. Clone this repo and cd into the root directory:

```
git clone https://github.com/Black-Relay/web-app-backend && cd web-app-backend
```

2. Install dependencies:

```
npm install
```

3. Run the 'dev' docker compose:

```
cd docker-compose/staging && docker compose up -d
```

3. You can verify that the API server is running by visiting ```http://localhost:3001``` in your browser.


4. Subscribe to the a topic by using the ```/subscribe/{topic-name}``` endpoint. Where *topic-name* is the topic you are subscribing to. You should receive the following JSON response:

```JSON
{
  "status": "success",
  "message": "Successfully subscribed to topic topic-name"
}
```
The following topics are seeded with dummy data and can be subscribed to:

| Topic Name        | Description                                               |
|-------------------|----------------------------------------------------------|
| digital_temp      | Timestamped temperature data                             |
| motion            | Motion events                                            |
| accelerometer     | Acceleration data                                        |
| air_quality       | Air quality data measured in PPM                         |
| gas               | Gas detection events                                     |
| optical_distance  | Distance measured from an object corresponding with motion|
| proximity_light   | Timestamped light data                                   |
| kismet            | Packet capture data from kismet devices                  |


## Verifying that MongoDB Collections are being populated

1. Exec into the MongoDB shell

```
docker exec -it mongodb mongosh -u admin -p password
```

2. Connect to the database

```mongosh
test> use black-relay
```

3. Check that the collection was created. (It will be the topic name + an 's' since MongoDB attempts to pluralize collection names)

```mongosh
mqtt-to-mongodb> show collections
temps
motions
accelerometers
air-qualitys
gass
optical-distances
lights
kismets
```

4. Check that data is being pushed into the collection:

```
db.temps.find()
```

You should see the following output:

```mongosh
// TODO - replace with example data
```

## Cleanup

Ensure you are in the ```docker-compose/staging``` directory and run:

```
docker compose down --rmi local
```

This will stop and remove all three containers and remove the locally built express image from your system.