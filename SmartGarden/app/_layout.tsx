import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SessionProvider, useSession } from '@/context/AuthContext';
import { SplashScreenController } from '@/components/splash';
import { Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';

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
  useEffect(() => {
    if (Platform.OS === 'android') {
      // Oculta la barra inferior (botones atrás, home, apps)
      NavigationBar.setVisibilityAsync("hidden");
      
      // Define qué pasa si el usuario desliza el dedo desde abajo:
      // 'overlay-swipe': La barra aparece flotando un momento y luego se vuelve a ocultar.
      NavigationBar.setBehaviorAsync("overlay-swipe");
      
      // Opcional: Hacer la barra totalmente transparente si llega a aparecer
      NavigationBar.setBackgroundColorAsync("#00000000"); 
    }
  }, []);
  return (
    <SessionProvider>
      <SplashScreenController />
      <RootNavigator />
    </SessionProvider>
  );
}
