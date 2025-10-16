import type { LucideIcon } from "lucide-react";
import "../../css/icon-button.css";

export function IconButton({Icon, label, method}:{Icon:LucideIcon; label:string; method:Function}){
  return (
    <button type="button" className="icon-button" onClick={()=>{method()}}>
      <Icon />
      <span>&nbsp;&nbsp;{label}</span>
    </button>
  )
}