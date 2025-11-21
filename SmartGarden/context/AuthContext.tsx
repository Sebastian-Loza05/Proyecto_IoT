import { useContext, createContext, type PropsWithChildren, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

interface AuthContextType {
  signIn: (token: string) => void;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  signIn: () => {},
  signOut: () => {},
  session: null,
  isLoading: true,
});

export function useSession() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useSession must be wrapped in a <SessionProvider />');
  }

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Al iniciar, verificamos si ya hay un token guardado
    SecureStore.getItemAsync('user-token').then((token) => {
      if (token) {
        setSession(token);
      }
      setIsLoading(false);
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        signIn: (token) => {
          setSession(token);
          SecureStore.setItemAsync('user-token', token);
        },
        signOut: () => {
          setSession(null);
          SecureStore.deleteItemAsync('user-token');
        },
        session,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
