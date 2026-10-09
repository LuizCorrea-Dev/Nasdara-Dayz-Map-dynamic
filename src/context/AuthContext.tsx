import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';

export interface DbUser {
  id: number;
  uid: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: DbUser | null;
  token: string | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
  refreshProfile: () => Promise<void>;
}

const CACHE_KEY = 'nasdara_cached_user_session';

function mapFirebaseUserToDbUser(fbUser: FirebaseUser): DbUser {
  let numericId = 1;
  try {
    let hash = 0;
    for (let i = 0; i < fbUser.uid.length; i++) {
      hash = (hash << 5) - hash + fbUser.uid.charCodeAt(i);
      hash |= 0;
    }
    numericId = Math.abs(hash) || 1;
  } catch {
    numericId = 1;
  }

  return {
    id: numericId,
    uid: fbUser.uid,
    name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Sobrevivente',
    email: fbUser.email || '',
    avatarUrl: fbUser.photoURL || undefined,
    createdAt: fbUser.metadata?.creationTime || new Date().toISOString(),
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(() => auth.currentUser);
  const [user, setUser] = useState<DbUser | null>(() => {
    try {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          return JSON.parse(cached);
        }
      }
    } catch {
      // ignore
    }
    return auth.currentUser ? mapFirebaseUserToDbUser(auth.currentUser) : null;
  });
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const getIdToken = useCallback(async (): Promise<string | null> => {
    if (!auth.currentUser) return null;
    try {
      const freshToken = await auth.currentUser.getIdToken(false);
      setToken(freshToken);
      return freshToken;
    } catch (err) {
      console.warn('Falha ao obter token:', err);
      return null;
    }
  }, []);

  const syncBackendUser = useCallback(async (authToken: string) => {
    try {
      const res = await fetch('/api/me', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const dbUserData: DbUser = await res.json();
        if (dbUserData && dbUserData.uid) {
          setUser(dbUserData);
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(dbUserData));
          } catch {
            // ignore
          }
        }
      } else {
        // Backend SQL route not available or static hosting (e.g., Vercel)
        // User remains securely authenticated via Firebase
      }
    } catch {
      // Safe fallback - keep Firebase profile
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    const currentToken = await getIdToken();
    if (currentToken) {
      await syncBackendUser(currentToken);
    }
  }, [getIdToken, syncBackendUser]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // Establish immediate user session from Firebase
        const profile = mapFirebaseUserToDbUser(fbUser);
        setUser(prev => prev || profile);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(profile));
        } catch {
          // ignore
        }

        try {
          const idToken = await fbUser.getIdToken();
          setToken(idToken);
          // Sync with database in background
          syncBackendUser(idToken);
        } catch (err) {
          console.warn('Erro ao obter token do Firebase:', err);
        }
      } else {
        setToken(null);
        setUser(null);
        try {
          localStorage.removeItem(CACHE_KEY);
        } catch {
          // ignore
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [syncBackendUser]);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const cred = await signInWithPopup(auth, googleAuthProvider);
      if (cred.user) {
        setFirebaseUser(cred.user);
        const profile = mapFirebaseUserToDbUser(cred.user);
        setUser(profile);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(profile));
        } catch {
          // ignore
        }

        try {
          const idToken = await cred.user.getIdToken();
          setToken(idToken);
          syncBackendUser(idToken);
        } catch (tokErr) {
          console.warn('Erro ao obter token pós login:', tokErr);
        }
      }
    } catch (err: any) {
      console.error('Falha no login com Google:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
      setFirebaseUser(null);
      setUser(null);
      setToken(null);
      try {
        localStorage.removeItem(CACHE_KEY);
      } catch {
        // ignore
      }
    } catch (err) {
      console.error('Falha ao encerrar sessão:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        user,
        token,
        loading,
        signInWithGoogle,
        signOut,
        getIdToken,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};

