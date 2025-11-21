import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { SessionProvider, useSession } from '../context/AuthContext';
import { SplashScreenController } from '@/components/splash';
import { Href } from 'expo-router';

function RootNavigator() {
  const { session, isLoading } = useSession();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = (segments[0] as string) === '(auth)';

    if (!session && !inAuthGroup) {
      // Redirigir a login
      router.replace('/(auth)/login' as Href);
    } else if (session && inAuthGroup) {
      // Redirigir a dashboard
      router.replace('/(app)/' as Href);
    }
  }, [session, isLoading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
      {/* <Stack.Screen name="+not-found" /> */}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SessionProvider>
      <SplashScreenController />
      <RootNavigator />
    </SessionProvider>
  );
}
