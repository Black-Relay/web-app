## Prerequisites

Ensure you have the following installed locally:
- NPM
- Node
- Docker

## Usage
### 1. Clone this repo and cd into the ```docker-compose/dev``` directory:

```
git clone https://github.com/Black-Relay/web-app && cd web-app/docker-compose/dev
```

### 2. Run the docker compose:

```
docker compose up -d
```

### 3. Verify all containers were built and are running:

![](/docs/img/dev-containers.png)

### 4. Log in as default admin
Visit ```http://localhost:5173``` in your browser and log in with credentials ```admin/admin```.

Seeded user credentials will appear in the file ```seedcreds.txt``` located *inside of the ```br-api``` container*. You can view them with the command:

```
docker exec -it br-api cat seedcreds.txt
```

## Using the API

### 1. Before calling any other endpoints, you must call the ```/auth/login``` endpoint to receive a session cookie. A default admin user is provided with the seed data. This will be a ```POST``` request with the following message body:

```JSON
{
  "username": "admin",
  "password": "admin"
}
```

### 2. Subscribe to the a topic by using the ```/topic/{topic-name}/subscribe``` endpoint. Where *topic-name* is the topic you are subscribing to. You should receive the following JSON response:

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


## Verifying that data is being populated in MongoDB

#### 1. Exec into the MongoDB shell

```
npm run enter-mongo
```

#### 2. Connect to the database

```mongosh
test> use black-relay
```

#### 3. Check for data in the *events* collection

```mongosh
black-relay> db.events.find()
```

You should see something similar to the following output:

```JSON
[
  {
    _id: ObjectId('68eb7f829cb55736a3d9edae'),
    category: 'DETECT',
    topic: 'gas',
    data: {
      timestamp: 1760264066232,
      sensorId: 'f8b10280-34f6-4389-a38d-adb00dea1b54',
      co2: 1692,
      voc: 211
    },
    acknowledged: false,
    createdAt: ISODate('2025-10-12T10:14:26.233Z'),
    updatedAt: ISODate('2025-10-12T10:14:26.233Z'),
    __v: 0
  }
]
```

## Cleanup

Ensure you are in the ```api``` directory and run:

```
npm run docker-down
```

This will stop and remove all three containers and remove the locally built express image from your system.