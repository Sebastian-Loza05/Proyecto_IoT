import React from 'react';
import { Tabs } from 'expo-router';
import MainTabBar from '@/components/MainTabBar';

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // sin header nativo, usamos el nuestro
      }}
      tabBar={(props) => <MainTabBar {...props} />}
    >
      {/* TAB 1: Inicio */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
        }}
      />

      {/* TAB 2: Analíticas */}
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analíticas',
        }}
      />

      {/* TAB 3: Control */}
      <Tabs.Screen
        name="control"
        options={{
          title: 'Control',
        }}
      />
    </Tabs>
  );
}
