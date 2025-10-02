import { useState } from "react";
import "../../css/switch.css";

export function Switch({labels, cb}:{labels: Array<string>, cb: Function}){
  const [focus, setFocus] = useState(labels[0]);

  return (<div className="switch">
    {labels.map((label, index)=>{
      return <div
        className={"label" + (focus == label ? " focused" : "")}
        key={index}
        onClick={()=>{setFocus(label); cb(label);}}>
          {label}
      </div>
    })}
  </div>)
}