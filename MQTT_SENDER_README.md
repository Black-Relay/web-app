# MQTT Sensor Data Publisher

A Python script for sending randomized environment sensor data to an MQTT broker for Black Relay testing.

## Installation

Install the required Python dependency:

```bash
pip install paho-mqtt
```

Or using pip3:

```bash
pip3 install paho-mqtt
```

## Usage

Basic usage:

```bash
python3 send_sensor_data.py --broker mqtt://localhost:1883 --topic environment_sensor
```

Short form:

```bash
python3 send_sensor_data.py -b mqtt://localhost:1883 -t sensor/edge_1
```

With pretty-printed output:

```bash
python3 send_sensor_data.py -b mqtt://localhost:1883 -t environment_sensor --pretty
```

## Arguments

- `-b, --broker` (required): MQTT broker URL
  - Format: `mqtt://host:port` or `mqtts://host:port` (for TLS)
  - Example: `mqtt://localhost:1883`
  - Example: `mqtt://mosquitto:1883` (for Docker internal network)

- `-t, --topic` (required): MQTT topic to publish to
  - Example: `environment_sensor`
  - Example: `sensor/edge_1/data`

- `--pretty` (optional): Pretty-print the JSON payload before sending

## Data Format

The script sends data in this JSON format:

```json
{
  "Sensor_ID": "Edge_1",
  "Sensor-type": "Environment",
  "LAT": 35.778922,
  "LON": -78.636932,
  "Fix": 0,
  "Sats": 0,
  "Temp Fahrenheit": 92.075,
  "Air Quality": 30578
}
```

### Randomized Fields

Each time the script runs, these values are randomized:

- **LAT**: 35.7 to 35.85 (Raleigh, NC area)
- **LON**: -78.7 to -78.6 (Raleigh, NC area)
- **Fix**: 0 or 1 (GPS fix status)
- **Sats**: 0 to 12 (number of satellites)
- **Temp Fahrenheit**: 60.0 to 100.0 (temperature in °F)
- **Air Quality**: 10000 to 50000 (air quality index)

## Examples

### Local Development

Send to local MQTT broker:

```bash
python3 send_sensor_data.py -b mqtt://localhost:1883 -t environment_sensor
```

### Docker Environment

Send to Mosquitto container in Black Relay:

```bash
# From host machine (if port is exposed)
python3 send_sensor_data.py -b mqtt://localhost:1883 -t environment_sensor

# From inside Docker network
docker exec -it br-api python3 /path/to/send_sensor_data.py -b mqtt://br-mqtt:1883 -t environment_sensor
```

### Production Environment

Send to production broker:

```bash
python3 send_sensor_data.py -b mqtt://blackrelay.l8s.dev:1883 -t environment_sensor
```

### Send Multiple Messages

Use a loop to send multiple messages:

```bash
# Send 10 messages with 2 second delay
for i in {1..10}; do
  python3 send_sensor_data.py -b mqtt://localhost:1883 -t environment_sensor
  sleep 2
done
```

### Watch Data Flow

In another terminal, subscribe to the topic to see messages:

```bash
# Using mosquitto_sub
mosquitto_sub -h localhost -p 1883 -t environment_sensor -v

# Or with Docker
docker exec -it mosquitto mosquitto_sub -h localhost -t environment_sensor -v
```

## Troubleshooting

### Connection Refused

If you get "Connection refused":

1. Check if the MQTT broker is running:
   ```bash
   docker ps | grep mosquitto
   ```

2. Verify the broker port is exposed:
   ```bash
   docker port mosquitto
   ```

3. Test broker connectivity:
   ```bash
   mosquitto_pub -h localhost -p 1883 -t test -m "hello"
   ```

### Module Not Found

If you get `ModuleNotFoundError: No module named 'paho'`:

```bash
pip3 install paho-mqtt
```

### Permission Denied

If you get permission denied:

```bash
chmod +x send_sensor_data.py
```

## Integration with Black Relay

To have Black Relay process these messages:

1. Ensure MQTT broker is running (br-mqtt container)
2. Subscribe to the topic via Black Relay API:
   ```bash
   curl -X POST http://localhost:3001/topic/environment_sensor/subscribe \
     -H "Content-Type: application/json" \
     -b cookies.txt
   ```
3. Run the script to send data
4. Check events in Black Relay:
   ```bash
   curl http://localhost:3001/event -b cookies.txt
   ```

The data will be stored as events in MongoDB and visible in the Black Relay dashboard.
