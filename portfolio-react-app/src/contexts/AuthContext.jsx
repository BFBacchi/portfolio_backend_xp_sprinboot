import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { apiFetch, getStoredToken, setStoredToken } from '../api/client';

const AuthContext = createContext(null);

const GUEST_SESSION_KEY = 'portfolio_xp_guest_session';

function readGuestFlag() {
  try {
    return sessionStorage.getItem(GUEST_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [guestSession, setGuestSession] = useState(() => readGuestFlag());

  const login = useCallback(async (username, password) => {
    const data = await apiFetch('/api/v1/auth/login', {
      method: 'POST',
      omitAuth: true,
      body: JSON.stringify({ username, password }),
    });
    const t = data?.accessToken;
    if (!t) throw new Error('Respuesta de login inválida');
    try {
      sessionStorage.removeItem(GUEST_SESSION_KEY);
    } catch {
      /* ignore */
    }
    setGuestSession(false);
    setStoredToken(t);
    setToken(t);
    return data;
  }, []);

  const enterGuestSession = useCallback(() => {
    setStoredToken(null);
    setToken(null);
    try {
      sessionStorage.setItem(GUEST_SESSION_KEY, '1');
    } catch {
      /* ignore */
    }
    setGuestSession(true);
  }, []);

  const logout = useCallback(() => {
    setStoredToken(null);
    setToken(null);
    try {
      sessionStorage.removeItem(GUEST_SESSION_KEY);
    } catch {
      /* ignore */
    }
    setGuestSession(false);
  }, []);

  const isAuthenticated = Boolean(token);
  const isGuest = Boolean(guestSession) && !token;

  const value = useMemo(
    () => ({
      token,
      isAuthenticated,
      isGuest,
      login,
      logout,
      enterGuestSession,
    }),
    [token, isAuthenticated, isGuest, login, logout, enterGuestSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook emparejado con el provider
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
