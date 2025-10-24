import type React from "react";
import "../../css/lamp.css";

type LampState = ""|"active"|"unack"|"ack";

export function Lamp({state = ""}:{state?: LampState}){
  return <div className={`lamp ${state}`}></div>
}

export function LampLabel({label, children}:{label:string, children:React.ReactNode}){
  return (
    <div className="lamp-wrapper">
      <p>{label}</p>
      {children}
    </div>
  )
}

export function VerticalLamps({children}:{children:React.ReactNode}){
  return <div className="vertical-lamps">{children}</div>
}

export function HorizontalLamps({children}:{children:React.ReactNode}){
  return <div className="horizontal-lamps">{children}</div>
}