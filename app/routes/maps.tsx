import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import { useState } from "react";
import { MapInteractionCSS } from "react-map-interaction";

export default function Maps() {
  const [selectedMap, setSelectedMap] = useState('official');

  function updateMap(type: string) {
    console.log(type);
    setSelectedMap(type);
    return null;
  }

  return (
    <main>
      <h1>Maps</h1>
      <div className={"ButtonGroup"} style={{marginBottom: '12px'}}>
        <button className={`Button ${selectedMap === 'official' ? 'isActive' : 'isInactive'}`} onClick={() => {updateMap('official')}}>Official map</button>
        <button className={`Button ${selectedMap === 'tube' ? 'isActive' : 'isInactive'}`} onClick={() => {updateMap('tube')}}>Tube map</button>
      </div>
      <div style={{border: '1px solid white', borderRadius: '5px'}}>
        <MapInteractionCSS>
          <img src={selectedMap === 'official' ? "images/Glastonbury-Webmap-2023_V1.5.png" : "images/glastonderground.jpeg"} />
        </MapInteractionCSS>
      </div>
    </main>
  );
}
