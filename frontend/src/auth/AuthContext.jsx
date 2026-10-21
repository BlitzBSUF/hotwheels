import { createContext, useContext, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => localStorage.getItem('username'));

  const login = async (username, password) => {
    const { data } = await api.post('/login/', { username, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);
    setUser(data.username);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);