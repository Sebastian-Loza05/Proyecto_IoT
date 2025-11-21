import { useEffect } from 'react';
import {SplashScreen} from 'expo-router';
import { useSession } from '@/context/AuthContext';

SplashScreen.preventAutoHideAsync();

export function SplashScreenController() {
  const { isLoading } = useSession();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return null;
}
