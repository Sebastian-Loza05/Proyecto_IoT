import React from 'react';
import { Stack } from 'expo-router';
import { SessionProvider, useSession } from '@/context/AuthContext';
import { SplashScreenController } from '@/components/splash';

function RootNavigator() {
  const { session, isLoading } = useSession();

  // Mientras carga el token desde SecureStore dejamos que el Splash lo maneje
  if (isLoading) {
    return null;
  }

  const isAuthenticated = !!session;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        // Si hay sesión, solo mostramos la app
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      ) : (
        // Si NO hay sesión, solo mostramos auth (login/register)
        <Stack.Screen name="auth" options={{ headerShown: false }} />
      )}
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
