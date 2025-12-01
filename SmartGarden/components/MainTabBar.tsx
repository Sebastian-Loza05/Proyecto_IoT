import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
  background: '#eff6ff',
  card: '#ffffff',
  title: '#1e3a8a',
  primary: '#2563eb',
  textSecondary: '#4b5563',
  textMuted: '#9ca3af',
  border: '#dbeafe',
  white: '#ffffff',
};

type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

const TAB_CONFIG: Record<string, { label: string; icon: FeatherIconName }> = {
  index: { label: 'Inicio', icon: 'home' },
  analytics: { label: 'Analíticas', icon: 'bar-chart-2' },
  control: { label: 'Control', icon: 'sliders' },
};

export default function MainTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.outer,
        {
          paddingBottom: insets.bottom, // evita solaparse con botones del sistema
        },
      ]}
    >
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          const config = TAB_CONFIG[route.name];
          if (!config) return null;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              activeOpacity={0.8}
              onPress={onPress}
              style={styles.tab}
            >
              <View
                style={[
                  styles.indicator,
                  isFocused && styles.indicatorActive,
                ]}
              />
              <Feather
                name={config.icon}
                size={20}
                color={isFocused ? COLORS.primary : COLORS.textMuted}
              />
              <Text style={[styles.label, isFocused && styles.labelActive]}>
                {config.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    backgroundColor: COLORS.white, // 👈 safe area inferior blanco
  },
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.card, // blanco del tab
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
    alignSelf: 'stretch',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  indicator: {
    height: 3,
    width: '60%',
    borderRadius: 999,
    backgroundColor: 'transparent',
    marginBottom: 4,
  },
  indicatorActive: {
    backgroundColor: COLORS.primary,
  },
  label: {
    fontSize: 12,
    marginTop: 2,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  labelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
