#!/usr/bin/env python3
"""
MQTT Sensor Data Publisher
Sends randomized sensor data to an MQTT broker for Black Relay testing.

Usage:
    python3 send_sensor_data.py --broker mqtt://localhost:1883 --topic environment_sensor
    python3 send_sensor_data.py -b mqtt://localhost:1883 -t environment_sensor
"""

import argparse
import json
import random
import sys
from urllib.parse import urlparse

try:
    import paho.mqtt.client as mqtt
except ImportError:
    print("Error: paho-mqtt library not found.")
    print("Install it with: pip install paho-mqtt")
    sys.exit(1)


def generate_sensor_data():
    """Generate randomized sensor data matching the required format."""
    return {
        "Sensor_ID": "Edge_1",
        "Sensor-type": "Environment",
        "LAT": round(random.uniform(35.7, 35.85), 6),  # Around Raleigh, NC area
        "LON": round(random.uniform(-78.7, -78.6), 6),
        "Fix": random.randint(0, 1),  # GPS fix status (0 or 1)
        "Sats": random.randint(0, 12),  # Number of satellites
        "Temp Fahrenheit": round(random.uniform(60.0, 100.0), 3),  # Temperature range
        "Air Quality": random.randint(10000, 50000)  # Air quality index
    }


def on_connect(client, userdata, flags, rc):
    """Callback for when the client connects to the broker."""
    if rc == 0:
        print(f"✓ Connected to MQTT broker")
    else:
        print(f"✗ Connection failed with code {rc}")
        sys.exit(1)


def on_publish(client, userdata, mid):
    """Callback for when message is published."""
    print(f"✓ Message published successfully (mid: {mid})")


def parse_mqtt_url(url):
    """Parse MQTT URL to extract host, port, and protocol."""
    parsed = urlparse(url)
    
    if parsed.scheme not in ['mqtt', 'mqtts']:
        raise ValueError(f"Invalid MQTT scheme: {parsed.scheme}. Use 'mqtt://' or 'mqtts://'")
    
    host = parsed.hostname or 'localhost'
    port = parsed.port or (8883 if parsed.scheme == 'mqtts' else 1883)
    use_tls = parsed.scheme == 'mqtts'
    
    return host, port, use_tls


def main():
    parser = argparse.ArgumentParser(
        description='Send randomized sensor data to MQTT broker',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s --broker mqtt://localhost:1883 --topic environment_sensor
  %(prog)s -b mqtt://mosquitto:1883 -t sensor/edge_1
  %(prog)s -b mqtts://secure-broker.com:8883 -t data/environment
        """
    )
    
    parser.add_argument(
        '-b', '--broker',
        required=True,
        help='MQTT broker URL (e.g., mqtt://localhost:1883)'
    )
    
    parser.add_argument(
        '-t', '--topic',
        required=True,
        help='MQTT topic to publish to'
    )
    
    parser.add_argument(
        '--pretty',
        action='store_true',
        help='Pretty-print the JSON payload before sending'
    )
    
    args = parser.parse_args()
    
    try:
        # Parse broker URL
        host, port, use_tls = parse_mqtt_url(args.broker)
        
        print(f"Connecting to {host}:{port} (TLS: {use_tls})")
        print(f"Topic: {args.topic}")
        print("-" * 50)
        
        # Generate sensor data
        sensor_data = generate_sensor_data()
        payload = json.dumps(sensor_data)
        
        # Display the payload
        if args.pretty:
            print("Payload:")
            print(json.dumps(sensor_data, indent=2))
        else:
            print(f"Payload: {payload}")
        print("-" * 50)
        
        # Create MQTT client
        client = mqtt.Client()
        client.on_connect = on_connect
        client.on_publish = on_publish
        
        # Configure TLS if needed
        if use_tls:
            client.tls_set()
        
        # Connect and publish
        client.connect(host, port, keepalive=60)
        client.loop_start()
        
        # Publish message
        result = client.publish(args.topic, payload, qos=1)
        
        # Wait for publish to complete
        result.wait_for_publish()
        
        # Disconnect
        client.loop_stop()
        client.disconnect()
        
        print("✓ Done!")
        
    except ValueError as e:
        print(f"✗ Error: {e}", file=sys.stderr)
        sys.exit(1)
    except ConnectionRefusedError:
        print(f"✗ Error: Connection refused to {host}:{port}", file=sys.stderr)
        print("  Make sure the MQTT broker is running and accessible", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"✗ Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
