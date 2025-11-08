import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import "../../css/map.css";
import { mockEvents } from '@/mockdata/mock-events';
import type { Event } from '@/providers/EventProvider';

function Pin({event}:{event:Event}){
  const {category, topic, createdAt, data} = event;
  let latitude = data?.latitude as number || 35.28;
  let longitude = data?.longitude as number || -79.64;

  return (
    <Marker position={[latitude, longitude]}>
      <Popup>
        <span className={category.toLowerCase()}>{category}</span> - <span className='sentence'>{topic}</span> <br />
        {createdAt} <br />
        Coords: {latitude},  {longitude} <br />
        [data]
      </Popup>
    </Marker>
  )
}

export function Map(){
  return(
    <MapContainer center={[35.28, -79.64]} zoom={8} scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="http://localhost:8080/tile/{z}/{x}/{y}.png"
      />
      {mockEvents.map((e, i) => <Pin key={`${e.topic}-${e.createdAt}-${i}`} event={e} />)}
    </MapContainer>
  )
}