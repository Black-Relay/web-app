import { MissionClock } from "@/components/mission-clock"
import { EventsAside } from "@/components/events-aside";
import { Switch } from "@/components/ui/switch"

export function Dashboard() {
  return (<div className="layout-main-content">
    <header>
      <h1>Welcome to the dashboard</h1>
    </header>
    <main>
      <div>Page Specific Main Content i.e. maps/tables</div>
    </main>
    <MissionClock/>
    <aside>
      <Switch />
      <EventsAside />
    </aside>
    <footer>
      <div>Page Specific Footer data</div>
    </footer>
  </div>)
}
