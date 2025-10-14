import { MissionClock } from "@/components/mission-clock"

export function Events(){
  return <div className="layout-main-content no-footer">
    <header>
      <div>create event</div>
      <div>pin bar</div>
    </header>
    <MissionClock />
    <main>
      <div>Toggle table</div>
      <div>Main sortable table</div>
      <div>pagination functions</div>
    </main>
    <aside>
      <div>Details Header</div>
      <div>Meta Data</div>
      <div>Notes Section</div>
      <div>UI Components</div>
    </aside>
  </div>
}