/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

const DEMO_USER = {
  name: 'Avery Stone',
  email: 'admin@inventohub.com',
  role: 'Operations Admin',
  company: 'InventoHub',
};

const DEMO_PASSWORD = 'Admin@123';

function createDemoToken(email) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: email,
      name: DEMO_USER.name,
      role: DEMO_USER.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
    }),
  );
  return `${header}.${payload}.demo-signature`;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('inventohub_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('inventohub_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async ({ email, password, remember = true }) => {
    if (email !== DEMO_USER.email || password !== DEMO_PASSWORD) {
      throw new Error('Use the demo credentials to access this preview workspace.');
    }

    const nextToken = createDemoToken(email);
    setToken(nextToken);
    setUser(DEMO_USER);

    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('inventohub_token', nextToken);
    storage.setItem('inventohub_user', JSON.stringify(DEMO_USER));
    if (!remember) {
      localStorage.removeItem('inventohub_token');
      localStorage.removeItem('inventohub_user');
    }

    return DEMO_USER;
  };

  const register = async ({ name, email, password }) => {
    if (!name || !email || !password) {
      throw new Error('Complete every field to create a workspace.');
    }
    const nextUser = { ...DEMO_USER, name, email, role: 'Workspace Owner' };
    const nextToken = createDemoToken(email);
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem('inventohub_token', nextToken);
    localStorage.setItem('inventohub_user', JSON.stringify(nextUser));
    return nextUser;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('inventohub_token');
    localStorage.removeItem('inventohub_user');
    sessionStorage.removeItem('inventohub_token');
    sessionStorage.removeItem('inventohub_user');
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
      demo: { email: DEMO_USER.email, password: DEMO_PASSWORD },
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
