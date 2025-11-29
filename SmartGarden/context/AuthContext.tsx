// context/AuthContext.tsx
import {
  useContext,
  createContext,
  type PropsWithChildren,
  useState,
  useEffect,
} from 'react';
import * as SecureStore from 'expo-secure-store';

interface AuthContextType {
  signIn: (token: string) => void;
  signOut: () => void;
  session: string | null;
  isLoading: boolean;
}

// OJO: SIN valor por defecto con funciones vacías
const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  const signIn = (token: string) => {
    setSession(token);
    SecureStore.setItemAsync('user-token', token);
  };

  const signOut = () => {
    console.log('signOut called'); // para comprobar en la consola
    setSession(null);
    SecureStore.deleteItemAsync('user-token');
  };

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
        session,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}