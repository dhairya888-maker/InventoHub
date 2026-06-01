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

function createDemoToken(email, name = DEMO_USER.name, role = DEMO_USER.role) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: email,
      name: name,
      role: role,
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
    if (email === DEMO_USER.email) {
      if (password !== DEMO_PASSWORD) {
        throw new Error('Invalid email or password.');
      }

      const nextToken = createDemoToken(email, DEMO_USER.name, DEMO_USER.role);
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
    }

    const registeredUsers = JSON.parse(localStorage.getItem('inventohub_registered_users') || '[]');
    const matchedUser = registeredUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!matchedUser) {
      throw new Error('Use the demo credentials or a registered account to access this preview workspace.');
    }

    if (matchedUser.password !== password) {
      throw new Error('Invalid email or password.');
    }

    const activeUser = {
      name: matchedUser.name,
      email: matchedUser.email,
      role: matchedUser.role,
      company: matchedUser.company,
    };

    const nextToken = createDemoToken(email, activeUser.name, activeUser.role);
    setToken(nextToken);
    setUser(activeUser);

    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('inventohub_token', nextToken);
    storage.setItem('inventohub_user', JSON.stringify(activeUser));
    if (!remember) {
      localStorage.removeItem('inventohub_token');
      localStorage.removeItem('inventohub_user');
    }

    return activeUser;
  };

  const register = async ({ name, email, password }) => {
    if (!name || !email || !password) {
      throw new Error('Complete every field to create a workspace.');
    }

    if (email.toLowerCase() === DEMO_USER.email.toLowerCase()) {
      throw new Error('An account with this email already exists.');
    }

    const registeredUsers = JSON.parse(localStorage.getItem('inventohub_registered_users') || '[]');
    if (registeredUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }

    const nextUser = {
      name,
      email,
      password,
      role: 'Workspace Owner',
      company: 'InventoHub',
    };

    registeredUsers.push(nextUser);
    localStorage.setItem('inventohub_registered_users', JSON.stringify(registeredUsers));

    const activeUser = {
      name: nextUser.name,
      email: nextUser.email,
      role: nextUser.role,
      company: nextUser.company,
    };

    const nextToken = createDemoToken(email, activeUser.name, activeUser.role);
    setToken(nextToken);
    setUser(activeUser);

    localStorage.setItem('inventohub_token', nextToken);
    localStorage.setItem('inventohub_user', JSON.stringify(activeUser));

    return activeUser;
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
