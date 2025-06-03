import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AuthContextType {
  username: string;
  password: string;
  updateUser: () => void;
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
    setUsername('toandx');
    setPassword('123');
  };

  return (
    <AuthContext.Provider value={{ username, password, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export {useAuth, AuthProvider};