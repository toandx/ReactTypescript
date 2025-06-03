import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AuthContextType {
  username: string;
  password: string;
  updateUser: () => void;
  setUser: (username: string, password : string) => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
const useAuth = () => {
  return useContext(AuthContext);
}
interface AuthProviderProps {
  children? : ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [username, setUsername] = useState<string>('admin');
  const [password, setPassword] = useState<string>('admin');

  const updateUser = () => {
    setUsername(username+'a');
    setPassword('123');
  };
  const setUser = (username: string, password: string) => {
    setUsername(username);
    setPassword(password);
  }

  return (
    <AuthContext.Provider value={{ username, password, updateUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export {useAuth, AuthProvider};