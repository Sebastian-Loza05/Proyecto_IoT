import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const APP_BACKGROUND = '#eff6ff';
const ACTIVE_COLOR = '#2563eb';
const INACTIVE_COLOR = '#64748b';

export default function AppLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopColor: '#e2e8f0',
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: insets.bottom + 8,
        },
        tabBarLabel: ({ focused }) => (
          <Text
            style={{
              fontSize: 12,
              color: focused ? ACTIVE_COLOR : INACTIVE_COLOR,
              fontWeight: focused ? '600' : '400',
              marginTop: 4,
            }}
          >
            {getTabLabel(route.name)}
          </Text>
        ),
        tabBarIcon: ({ size, focused }) => (
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: 40,
            }}
          >
            {focused && (
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  height: 4,
                  width: '100%',
                  backgroundColor: ACTIVE_COLOR,
                  zIndex: 10,
                }}
              />
            )}
            <Feather
              name={getTabIcon(route.name)}
              size={size}
              color={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
            />
          </View>
        ),
      })}
      sceneContainerStyle={{ backgroundColor: APP_BACKGROUND }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="analytics" />
      <Tabs.Screen name="control" />
    </Tabs>
  );
}

function getTabLabel(name: string) {
  switch (name) {
    case 'index':
      return 'Inicio';
    case 'analytics':
      return 'Analíticas';
    case 'control':
      return 'Control';
    default:
      return name;
  }
}

function getTabIcon(name: string) {
  switch (name) {
    case 'index':
      return 'home';
    case 'analytics':
      return 'bar-chart-2';
    case 'control':
      return 'sliders';
    default:
      return 'circle';
  }
}
