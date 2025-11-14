import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import "../../css/map.css";
import { useEventContext, type Event } from '@/providers/EventProvider';

function Pin({event}:{event:Event}){
  const {category, topic, createdAt, data} = event;
  let latitude = data?.LAT as number || 35.7796;
  let longitude = data?.LON as number || -78.6382;

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
  const { events } = useEventContext();
  return(
    <MapContainer center={[35.28, -79.64]} zoom={8} scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="http://localhost:8080/tile/{z}/{x}/{y}.png"
      />
      {events.map((e, i) => <Pin key={`${e.topic}-${e.createdAt}-${i}`} event={e} />)}
    </MapContainer>
  )
}