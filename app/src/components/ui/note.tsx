import "../../css/note.css";

export type NoteData = {
  author: string;
  timestamp: string;
  message: string;
}

export interface NoteList {
  eventID: string;
  notes: NoteData[];
}

export function Note({note}:{note:NoteData}){
  const {author, timestamp, message} = note;
  return (<div className="note">
    <p>{timestamp} -- {author}</p>
    <p>{message}</p>
  </div>)
}

export function NoteList({notesList}:{notesList: NoteList}){
  const { eventID, notes } = notesList;
  return (<div className="note-list">
    {notes.map((note, index) => <Note key={`${eventID}_${index}`} note={note} />)}
  </div>)
}