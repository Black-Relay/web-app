import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import "../../css/map.css";

export function Map(){
  return(
    <MapContainer center={[35.28, -79.64]} zoom={8} scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="http://localhost:8080/tile/{z}/{x}/{y}.png"
        // url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    </MapContainer>
  )
}