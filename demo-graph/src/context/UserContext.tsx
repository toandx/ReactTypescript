import { createContext } from "react";

type UserContextType = { // Context API save all user info
  user: string;
  setUser: React.Dispatch<React.SetStateAction<string>>;
};

export const UserContext = createContext<UserContextType | null>(null);