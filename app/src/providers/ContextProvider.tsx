import type React from "react";
import UserProvider from "./UserProvider";
import EventProvider from "./EventProvider";
import ThemeProvider from "./ThemeProvider";

export default function ContextProvider({children}:{children: React.ReactNode}){
  return(
    <ThemeProvider defaultTheme="dark">
      <UserProvider>
        <EventProvider>
          {children}
        </EventProvider>
      </UserProvider>
    </ThemeProvider>
  )
}