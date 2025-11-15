import { MissionClock } from "@/components/mission-clock"
import { SensorList } from "@/components/SensorList"

export function Sensors(){
  return <div className="layout-main-content no-footer">
    <header>
      <h1>Sensors</h1>
    </header>
    <MissionClock />
    <main>
    </main>
    <aside>
      <SensorList />
    </aside>
  </div>
}