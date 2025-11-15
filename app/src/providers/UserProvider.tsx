import React, { useContext, createContext, useState, useEffect } from "react";
import { validateSession } from "@/utils/fetch-requests";

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
  isLoading: boolean;
  logout: () => void;
};

const UserContext = createContext<UserContextType|null>(null)

function useUserContext():UserContextType{
  const value:UserContextType|null = useContext(UserContext);
  if (!value) throw new Error('useUserContext hook used without UserContext');
  return value;
};

export default function UserProvider({children}:{children: React.ReactNode}){
  const [user, setUser] = useState<User>({username: "", role: ""});
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const sessionData = await validateSession();
      
      if (sessionData && sessionData.username) {
        // Session is valid, restore user state
        setUser({
          username: sessionData.username,
          firstName: sessionData.firstName,
          lastName: sessionData.lastName,
          groups: sessionData.groups,
          user_id: sessionData.user_id,
          role: "user" // Default to user role, could be determined from groups
        });
      }
      
      setIsLoading(false);
    };

    checkSession();
  }, []);

  const logout = () => {
    setUser({username: "", role: ""});
  };

  const value = {
    user: user,
    setUser: setUser,
    isLoading: isLoading,
    logout: logout
  };

  return(
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, useUserContext };
export type { User, UserContextType };
