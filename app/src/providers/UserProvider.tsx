import React, { useContext, createContext, useState } from "react";

type User = {
  username: string;
  firstName?: string;
  lastName?: string;
  groups?: [string];
  user_id?: string;
  role: string;
};

interface UserContextType {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
};

const UserContext = createContext<UserContextType|null>(null)

function useUserContext():UserContextType{
  const value:UserContextType|null = useContext(UserContext);
  if (!value) throw new Error('useUserContext hook used without UserContext');
  return value;
};

export default function UserProvider({children}:{children: React.ReactNode}){
  const [user, setUser] = useState({username: "", role: ""});
  const value = {
    user: user,
    setUser: setUser
  };

  return(
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, useUserContext };
export type { User, UserContextType };