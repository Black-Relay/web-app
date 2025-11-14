import type React from "react";
import UserProvider from "./UserProvider";
import EventProvider from "./EventProvider";
import SensorProvider from "./SensorProvider";
import ThemeProvider from "./ThemeProvider";
import { ToastProvider } from './ToastProvider';

export default function ContextProvider({children}:{children: React.ReactNode}){
  return(
    <ThemeProvider defaultTheme="dark">
      <ToastProvider>
        <UserProvider>
          <EventProvider>
            <SensorProvider>
              {children}
            </SensorProvider>
          </EventProvider>
        </UserProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}