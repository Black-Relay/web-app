import { useState } from "react";
import "../../css/switch.css";

export function Switch({labels, setSwitch}:{labels: Array<string>, setSwitch: Function}){
  const [focus, setFocus] = useState(labels[0]);

  return (<div className="switch">
    {labels.map((label, index)=>{
      return <div
        className={"label" + (focus == label ? " focused" : "")}
        key={index}
        onClick={()=>{setFocus(label); setSwitch(label);}}>
          {label}
      </div>
    })}
  </div>)
}