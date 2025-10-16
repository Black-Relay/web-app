import type { Event } from "@/providers/EventProvider";
import { HorizontalLamps, LampLabel, Lamp } from "./ui/lamp";
import "../css/event-message.css";
import { useState } from "react";
import { NoteList, type NoteData } from "./ui/note";
import { Notebook, Pin, Search } from "lucide-react"

import { mockNotes } from "@/mockdata/mock-notes";
import { IconButton } from "./ui/icon-button";

interface EventNotes {
  eventID: string;
  notes: NoteData[];
}

function EventMetaSection({event}:{event:Event}) {
  const {_id, category, topic, createdAt, acknowledged, active, __v} = event;

  return (
    <div className="section">
      <p><span className="bold">ID:</span>&nbsp;&nbsp;{_id}</p>
      <p><span className="bold">Time:</span>&nbsp;&nbsp;{createdAt}</p>
      <p><span className="bold">Type:</span>&nbsp;&nbsp;<span className={category.toLowerCase()}>{category}</span></p>
      <p><span className="bold">Topic:</span>&nbsp;&nbsp;{topic}</p>
      <p><span className="bold">Status:</span>&nbsp;&nbsp;
        <HorizontalLamps>
          <LampLabel label="Ack'd">
            <Lamp state={acknowledged ? "ack" : "unack"} />
          </LampLabel>
          <LampLabel label="Active">
            <Lamp state={active ? "active" : ""} />
          </LampLabel>
        </HorizontalLamps>
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

function EventUISection(){
  return (
    <div className="section">
      <IconButton Icon={Search} label="View Event Data" method={()=>{}} />
      <IconButton Icon={Notebook} label="Add Note" method={()=>{}} />
      <IconButton Icon={Pin} label="Pin Event" method={()=>{}} />
    </div>
  )
}

function EventDetailDialog(){
  return <></>
}

export function EventDetailsPane({event}:{event:Event}){
  const [dialogOpen, setDialogOpen] = useState(false);
  return (<div className="main-subcontent event-detail-wrapper">
    <h2>Event Details</h2>
    <EventMetaSection event={event} />
    <EventNoteSection eventNotes={mockNotes[0]}/>
    <EventUISection />
    {dialogOpen ? <EventDetailDialog /> : <></>}
  </div>)
}