import type React from "react";
import UserProvider from "./UserProvider";
import EventProvider from "./EventProvider";

export default function ContextProvider({children}:{children: React.ReactNode}){
  return(
    <UserProvider>
      <EventProvider>
        {children}
      </EventProvider>
    </UserProvider>
  )
}