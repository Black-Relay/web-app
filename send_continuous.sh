#!/bin/bash
# Example wrapper script for continuous sensor data transmission
# Usage: ./send_continuous.sh mqtt://localhost:1883 environment_sensor 5

BROKER=${1:-mqtt://localhost:1883}
TOPIC=${2:-environment_sensor}
INTERVAL=${3:-5}

echo "Starting continuous sensor data transmission..."
echo "Broker: $BROKER"
echo "Topic: $TOPIC"
echo "Interval: ${INTERVAL}s"
echo "Press Ctrl+C to stop"
echo "----------------------------------------"

# Check if paho-mqtt is installed
if ! python3 -c "import paho.mqtt.client" 2>/dev/null; then
    echo "Error: paho-mqtt not installed"
    echo "Install with: pip3 install paho-mqtt"
    exit 1
fi

# Continuous loop
COUNT=0
while true; do
    COUNT=$((COUNT + 1))
    echo ""
    echo "=== Message #$COUNT ==="
    python3 send_sensor_data.py --broker "$BROKER" --topic "$TOPIC" --pretty
    
    if [ $? -ne 0 ]; then
        echo "Error sending message. Stopping."
        exit 1
    fi
    
    echo "Waiting ${INTERVAL}s before next message..."
    sleep "$INTERVAL"
done
