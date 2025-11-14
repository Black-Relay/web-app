import type { Event } from "@/providers/EventProvider";
import "../css/event-message.css";
import React, { useState, useEffect } from "react";
import { NoteList, type NoteData } from "./ui/note";
import { Check, Notebook, Pin, Search, X, AlertTriangle, Undo2 } from "lucide-react"
import { IconButton, InlineIcon } from "./ui/icon-button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "./ui/sheet";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useUserContext } from "@/providers/UserProvider";
import config from "../configs/config.json";
const {apiUrl} = {apiUrl: import.meta.env.VITE_API_URL || config.apiUrl}

interface EventNotes {
  eventID: string;
  notes: NoteData[];
}

function EventMetaSection({event}:{event:Event}) {
  const {_id, category, topic, createdAt, acknowledged, active, __v} = event;
  const [isAck, setIsAck] = useState(acknowledged);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsAck(acknowledged);
  }, [acknowledged, _id]);

  const handleAcknowledge = async () => {
    if (!isAck) {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/event/id/${_id}`, {
          method: "PATCH",
          credentials: "include",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ acknowledged: true })
        });
        if (res.ok) setIsAck(true);
      } catch (err) {
        alert(`Unable to acknowledge ${_id}`);
      }
      setLoading(false);
    }
  };

  return (
    <div className="section">
      <p><span className="bold">ID:</span> &nbsp;{_id}</p>
      <p><span className="bold">Time:</span> &nbsp;{createdAt}</p>
      <p><span className="bold">Type:</span> &nbsp;<span className={category.toLowerCase()}>{category}</span></p>
      <p><span className="bold">Topic:</span> &nbsp;{topic}</p>
      <p><span className="bold">Acknowledged:</span>
        <button
          aria-label={isAck ? "Acknowledged" : "Acknowledge event"}
          onClick={handleAcknowledge}
          disabled={isAck}
        >
          <InlineIcon
            Icon={isAck ? Check : X}
            color={isAck ? "green" : "red"}
          />
        </button>
      </p>
    </div>
  )
}

function EventNoteSection({event}:{event: Event}){
  const eventNotes = event.data.notes;
  
  // Ensure eventNotes is an array and transform notes from event data format to NoteData format
  const transformedNotes: NoteData[] = Array.isArray(eventNotes) 
    ? eventNotes.map((note: any) => ({
        author: note.author,
        timestamp: new Date(note.timestamp).toLocaleString(),
        message: note.text
      }))
    : [];

  const notesList: EventNotes = {
    eventID: event._id,
    notes: transformedNotes
  };

  return (
    <div className="section">
      <h3>Notes</h3>
      {transformedNotes.length === 0 ? (
        <p className="text-muted-foreground">No notes yet</p>
      ) : (
        <NoteList notesList={notesList} />
      )}
    </div>
  )
}

function EventUISection({dialogControl, event}:{dialogControl:React.Dispatch<React.SetStateAction<boolean>>, event: Event}){
  const [addNoteModalOpen, setAddNoteModalOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingThreat, setIsUpdatingThreat] = useState(false);
  const {user} = useUserContext();
  
  // Store original category in event data if not already stored
  const originalCategory = event.data.originalCategory || event.category;
  const isEscalatedToThreat = event.category === "THREAT" && originalCategory !== "THREAT";

  const handleAddNote = async () => {
    if (noteText.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        // Get existing notes from event data or initialize empty array
        const existingNotes = Array.isArray(event.data.notes) ? event.data.notes : [];
        const newNote = {
          id: Date.now().toString(),
          text: noteText.trim(),
          timestamp: new Date().toISOString(),
          author: user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}` 
            : user.username || "Unknown User"
        };
        
        const updatedNotes = [...existingNotes, newNote];
        
        const res = await fetch(`${apiUrl}/event/id/${event._id}`, {
          method: "PATCH",
          credentials: "include",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            data: {
              ...event.data,
              notes: updatedNotes
            }
          })
        });
        
        if (res.ok) {
          setNoteText("");
          setAddNoteModalOpen(false);
          // TODO: Refresh event data in parent component
          alert("Note added successfully!");
        } else {
          throw new Error("Failed to add note");
        }
      } catch (err) {
        console.error("Error adding note:", err);
        alert(`Unable to add note to event ${event._id}`);
      }
      setIsSubmitting(false);
    }
  };

  const handleEscalateToThreat = async () => {
    if (event.category === "THREAT" || isUpdatingThreat) return;
    
    setIsUpdatingThreat(true);
    try {
      const res = await fetch(`${apiUrl}/event/id/${event._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          category: "THREAT",
          data: {
            ...event.data,
            originalCategory: originalCategory
          }
        })
      });
      
      if (res.ok) {
        alert("Event escalated to THREAT status");
        // TODO: Refresh event data in parent component
      } else {
        throw new Error("Failed to escalate event");
      }
    } catch (err) {
      console.error("Error escalating event:", err);
      alert(`Unable to escalate event ${event._id}`);
    }
    setIsUpdatingThreat(false);
  };

  const handleRevertFromThreat = async () => {
    if (event.category !== "THREAT" || isUpdatingThreat) return;
    
    setIsUpdatingThreat(true);
    try {
      const res = await fetch(`${apiUrl}/event/id/${event._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          category: originalCategory,
          data: {
            ...event.data,
            originalCategory: undefined // Remove the original category marker
          }
        })
      });
      
      if (res.ok) {
        alert(`Event reverted to ${originalCategory} status`);
        // TODO: Refresh event data in parent component
      } else {
        throw new Error("Failed to revert event");
      }
    } catch (err) {
      console.error("Error reverting event:", err);
      alert(`Unable to revert event ${event._id}`);
    }
    setIsUpdatingThreat(false);
  };

  const handleCancel = () => {
    setNoteText("");
    setAddNoteModalOpen(false);
  };

  return (
    <>
      <div className="section">
        <IconButton Icon={Search} label="View Event Data" method={()=>{dialogControl(true)}} />
        <IconButton Icon={Notebook} label="Add Note" method={()=>{setAddNoteModalOpen(true)}} />
        <IconButton Icon={Pin} label="Pin Event" method={()=>{}} />
        {!isEscalatedToThreat && event.category !== "THREAT" && (
          <IconButton 
            Icon={AlertTriangle} 
            label="Escalate to THREAT" 
            method={handleEscalateToThreat} 
          />
        )}
        {isEscalatedToThreat && (
          <IconButton 
            Icon={Undo2} 
            label={`Revert to ${originalCategory}`} 
            method={handleRevertFromThreat} 
          />
        )}
      </div>

      <Sheet open={addNoteModalOpen} onOpenChange={setAddNoteModalOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add Note</SheetTitle>
          </SheetHeader>
          
          <div className="flex flex-col gap-4 p-4">
            <label htmlFor="note-input" className="text-sm font-medium">
              Note Content
            </label>
            <Input
              id="note-input"
              placeholder="Enter your note here..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleAddNote} disabled={!noteText.trim() || isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Note"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
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
    <EventNoteSection event={event}/>
    <EventUISection dialogControl={setDialogOpen} event={event}/>
    {dialogOpen ? <EventDetailDialog data={event.data} dialogControl={setDialogOpen} /> : <></>}
  </div>)
}