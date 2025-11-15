import { useState } from "react"
import { MissionClock } from "@/components/mission-clock"
import { SensorList } from "@/components/SensorList"
import { SensorDetail } from "@/components/sensor-detail"
import "@/css/sensor-detail.css"

export function Sensors(){
  const [selectedSensorId, setSelectedSensorId] = useState<string>("Edge_1")

  return <div className="layout-main-content no-footer">
    <header>
      <h1>Sensors</h1>
    </header>
    <MissionClock />
    <main>
      <SensorDetail sensorId={selectedSensorId} />
    </main>
    <aside>
      <SensorList onSensorSelect={setSelectedSensorId} />
    </aside>
  </div>
}