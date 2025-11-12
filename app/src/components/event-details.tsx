import type { Event } from "@/providers/EventProvider";
import { HorizontalLamps, LampLabel, Lamp } from "./ui/lamp";
import "../css/event-message.css";
import React, { useState } from "react";
import { NoteList, type NoteData } from "./ui/note";
import { Check, Notebook, Pin, Search, X } from "lucide-react"

import { mockNotes } from "@/mockdata/mock-notes";
import { IconButton, InlineIcon } from "./ui/icon-button";

interface EventNotes {
  eventID: string;
  notes: NoteData[];
}

function EventMetaSection({event}:{event:Event}) {
  const {_id, category, topic, createdAt, acknowledged, active, __v} = event;

  return (
    <div className="section">
      <p><span className="bold">ID:</span> &nbsp;{_id}</p>
      <p><span className="bold">Time:</span> &nbsp;{createdAt}</p>
      <p><span className="bold">Type:</span> &nbsp;<span className={category.toLowerCase()}>{category}</span></p>
      <p><span className="bold">Topic:</span> &nbsp;{topic}</p>
      <p><span className="bold">Acknowledged:</span> {acknowledged ? <InlineIcon Icon={Check} color={"green"} /> : <InlineIcon Icon={X} color={"red"}/>}
        {/* <HorizontalLamps>
          <LampLabel label="Ack'd">
            <Lamp state={acknowledged ? "ack" : "unack"} />
          </LampLabel>
          <LampLabel label="Active">
            <Lamp state={active ? "active" : ""} />
          </LampLabel>
        </HorizontalLamps> */}
      </p>
    </div>
  )
}

function EventNoteSection({eventNotes}:{eventNotes:EventNotes}){
  return (
    <div className="section">
      <h3>Notes</h3>
      <NoteList notesList={eventNotes} />
    </div>
  )
}

function EventUISection({dialogControl}:{dialogControl:React.Dispatch<React.SetStateAction<boolean>>}){
  return (
    <div className="section">
      <IconButton Icon={Search} label="View Event Data" method={()=>{dialogControl(true)}} />
      <IconButton Icon={Notebook} label="Add Note" method={()=>{}} />
      <IconButton Icon={Pin} label="Pin Event" method={()=>{}} />
    </div>
  )
}

function EventDetailDialog({data, dialogControl}:{data: Record<string, unknown>,dialogControl:React.Dispatch<React.SetStateAction<boolean>>}){
  const entries = Object.entries(data);

  return (
    <div className="detail-dialog">
      <IconButton Icon={X} label="" method={()=>{dialogControl(false)}} />
      {
        entries.length === 0 ? <div className="bold centered">No Data Present</div> :
        entries.map(([label, value]) => {
        let normalizedValue:React.ReactNode;
        if ( typeof value === "object" ){
          try{
            normalizedValue = <pre className="detail-json">{JSON.stringify(value, null, 2)}</pre>;
          } catch {
            normalizedValue = String(value);
          }
        } else if ( label === "timestamp"){
          normalizedValue = new Date(value as number).toLocaleString();
        } else {
          normalizedValue = String(value);
        }

        return <div key={label}><span className="bold">{label}</span> &nbsp;{normalizedValue}</div>
      })
      }
    </div>
  )
}

export function EventDetailsPane({event}:{event:Event}){
  const [dialogOpen, setDialogOpen] = useState(false);
  return (<div className="main-subcontent event-detail-wrapper">
    <h2>Event Details</h2>
    <EventMetaSection event={event} />
    <EventNoteSection eventNotes={mockNotes[0]}/>
    <EventUISection dialogControl={setDialogOpen}/>
    {dialogOpen ? <EventDetailDialog data={event.data} dialogControl={setDialogOpen} /> : <></>}
  </div>)
}