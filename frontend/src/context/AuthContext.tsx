import { createContext, useContext, useState, ReactNode } from 'react';

const AuthContext = createContext({ isAuthed: false, setIsAuthed: (_: boolean) => {} });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthed, setIsAuthed] = useState(false);
  return <AuthContext.Provider value={{ isAuthed, setIsAuthed }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);