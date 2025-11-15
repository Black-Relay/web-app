import type { Event } from "@/providers/EventProvider";
import "../css/event-message.css";
import React, { useState, useEffect, useRef } from "react";
import { NoteList, type NoteData } from "./ui/note";
import { Check, Notebook, Pin, Search, X, AlertTriangle, Undo2 } from "lucide-react"
import { IconButton, InlineIcon } from "./ui/icon-button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "./ui/sheet";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useUserContext } from "@/providers/UserProvider";
import { useToast } from "@/providers/ToastProvider";
import config from "../configs/config.json";
const {apiUrl} = {apiUrl: import.meta.env.VITE_API_URL || config.apiUrl}

interface EventNotes {
  eventID: string;
  notes: NoteData[];
}

function EventMetaSection({event, onEventUpdate}:{event:Event, onEventUpdate?: (updatedData: Partial<Event>) => void}) {
  const {_id, category, topic, createdAt, acknowledged, active, __v} = event;
  const [isAck, setIsAck] = useState(acknowledged);
  const [loading, setLoading] = useState(false);
  const {user} = useUserContext();
  const { addToast } = useToast();

  useEffect(() => {
    setIsAck(acknowledged);
  }, [acknowledged, _id]);

  const handleAcknowledge = async () => {
    if (!isAck) {
      setLoading(true);
      try {
        // Get existing notes and add acknowledgment note
        const existingNotes = Array.isArray(event.data?.notes) ? event.data.notes : [];
        const acknowledgeNote = {
          id: Date.now().toString(),
          text: "Event acknowledged",
          timestamp: new Date().toISOString(),
          author: user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}` 
            : user.username || "System"
        };
        
        const updatedNotes = [...existingNotes, acknowledgeNote];
        
        const res = await fetch(`${apiUrl}/event/id/${_id}`, {
          method: "PATCH",
          credentials: "include",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            acknowledged: true,
            data: {
              ...event.data,
              notes: updatedNotes
            }
          })
        });
        if (res.ok) {
          setIsAck(true);
          if (onEventUpdate) {
            onEventUpdate({
              acknowledged: true,
              data: {
                ...event.data,
                notes: updatedNotes as any
              }
            });
          }
        }
      } catch (err) {
        addToast(`Unable to acknowledge ${_id}`, 'error');
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
  const eventNotes = event.data?.notes;
  
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

function EventUISection({dialogControl, event, onEventUpdate}:{dialogControl:React.Dispatch<React.SetStateAction<boolean>>, event: Event, onEventUpdate?: (updatedData: Partial<Event>) => void}){
  const [addNoteModalOpen, setAddNoteModalOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingThreat, setIsUpdatingThreat] = useState(false);
  const {user} = useUserContext();
  const { addToast } = useToast();
  
  // Store original category in event data if not already stored
  const originalCategory = event.data.originalCategory || event.category;
  const isEscalatedToThreat = event.category === "THREAT" && originalCategory !== "THREAT";

  const handleAddNote = async () => {
    if (noteText.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        // Get existing notes from event data or initialize empty array
        const existingNotes = Array.isArray(event.data?.notes) ? event.data.notes : [];
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
          addToast("Note added successfully!", 'success');
          if (onEventUpdate) {
            onEventUpdate({
              data: {
                ...event.data,
                notes: updatedNotes as any
              }
            });
          }
        } else {
          throw new Error("Failed to add note");
        }
      } catch (err) {
        console.error("Error adding note:", err);
        addToast(`Unable to add note to event ${event._id}`, 'error');
      }
      setIsSubmitting(false);
    }
  };

  const handleEscalateToThreat = async () => {
    if (event.category === "THREAT" || isUpdatingThreat) return;
    
    setIsUpdatingThreat(true);
    try {
      // Get existing notes and add escalation note
      const existingNotes = Array.isArray(event.data?.notes) ? event.data.notes : [];
      const escalationNote = {
        id: Date.now().toString(),
        text: `Escalated to THREAT from ${originalCategory}`,
        timestamp: new Date().toISOString(),
        author: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.username || "System"
      };
      
      const updatedNotes = [...existingNotes, escalationNote];
      
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
            originalCategory: originalCategory,
            notes: updatedNotes
          }
        })
      });
      
      if (res.ok) {
        addToast("Event escalated to THREAT status", 'success');
        if (onEventUpdate) {
          onEventUpdate({
            category: "THREAT" as any,
            data: {
              ...event.data,
              originalCategory: originalCategory as any,
              notes: updatedNotes as any
            }
          });
        }
      } else {
        throw new Error("Failed to escalate event");
      }
    } catch (err) {
      console.error("Error escalating event:", err);
      addToast(`Unable to escalate event ${event._id}`, 'error');
    }
    setIsUpdatingThreat(false);
  };

  const handleRevertFromThreat = async () => {
    if (event.category !== "THREAT" || isUpdatingThreat) return;
    
    setIsUpdatingThreat(true);
    try {
      // Get existing notes and add revert note
      const existingNotes = Array.isArray(event.data?.notes) ? event.data.notes : [];
      const revertNote = {
        id: Date.now().toString(),
        text: `Reverted from THREAT back to ${originalCategory}`,
        timestamp: new Date().toISOString(),
        author: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.username || "System"
      };
      
      const updatedNotes = [...existingNotes, revertNote];
      
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
            originalCategory: undefined, // Remove the original category marker
            notes: updatedNotes
          }
        })
      });
      
      if (res.ok) {
        addToast(`Event reverted to ${originalCategory} status`, 'success');
        if (onEventUpdate) {
          const updatedData = { ...event.data, notes: updatedNotes as any };
          delete (updatedData as any).originalCategory;
          onEventUpdate({
            category: originalCategory as any,
            data: updatedData
          });
        }
      } else {
        throw new Error("Failed to revert event");
      }
    } catch (err) {
      console.error("Error reverting event:", err);
      addToast(`Unable to revert event ${event._id}`, 'error');
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
  const dialogRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(14); // Default font size in pixels

  useEffect(() => {
    const checkOverflow = () => {
      if (dialogRef.current) {
        const container = dialogRef.current;
        const hasHorizontalOverflow = container.scrollWidth > container.clientWidth;
        
        if (hasHorizontalOverflow && fontSize > 8) {
          // Reduce font size if overflowing and not at minimum
          setFontSize(prev => Math.max(8, prev - 1));
        } else if (!hasHorizontalOverflow && fontSize < 14) {
          // Increase font size if not overflowing and not at maximum
          setFontSize(prev => Math.min(14, prev + 1));
        }
      }
    };

    // Check overflow after render
    const timeoutId = setTimeout(checkOverflow, 0);
    
    // Also check on window resize
    window.addEventListener('resize', checkOverflow);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [fontSize, entries]);

  return (
    <div className="detail-dialog" ref={dialogRef} style={{ fontSize: `${fontSize}px` }}>
      <IconButton Icon={X} label="" method={()=>{dialogControl(false)}} />
      {
        entries.length === 0 ? <div className="bold centered">No Data Present</div> :
        entries.map(([label, value]) => {
        let normalizedValue:React.ReactNode;
        if ( typeof value === "object" ){
          try{
            normalizedValue = <pre className="detail-json" style={{ fontSize: 'inherit' }}>{JSON.stringify(value, null, 2)}</pre>;
          } catch {
            normalizedValue = String(value);
          }
        } else if ( label === "timestamp"){
          normalizedValue = new Date(value as number).toLocaleString();
        } else {
          normalizedValue = String(value);
        }

        return <div key={label} style={{ fontSize: 'inherit' }}><span className="bold">{label}</span> &nbsp;{normalizedValue}</div>
      })
      }
    </div>
  )
}

export function EventDetailsPane({event, onEventUpdate}:{event:Event, onEventUpdate?: (updatedData: Partial<Event>) => void}){
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(event);

  // Update local event when prop changes
  useEffect(() => {
    setCurrentEvent(event);
  }, [event]);

  const updateEventData = (updatedData: Partial<Event>) => {
    setCurrentEvent(prev => ({ ...prev, ...updatedData }));
    // Also call the parent's update function if provided
    if (onEventUpdate) {
      onEventUpdate(updatedData);
    }
  };

  return (<div className="main-subcontent event-detail-wrapper">
    <h2>Event Details</h2>
    <EventMetaSection event={currentEvent} onEventUpdate={updateEventData} />
    <EventNoteSection event={currentEvent}/>
    <EventUISection dialogControl={setDialogOpen} event={currentEvent} onEventUpdate={updateEventData}/>
    {dialogOpen ? <EventDetailDialog data={currentEvent.data} dialogControl={setDialogOpen} /> : <></>}
  </div>)
}