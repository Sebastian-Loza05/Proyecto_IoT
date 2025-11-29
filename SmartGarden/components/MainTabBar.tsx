import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';

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
  return (
    <View style={styles.outer}>
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
              <Text
                style={[
                  styles.label,
                  isFocused && styles.labelActive,
                ]}
              >
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
    paddingBottom: 0,
    backgroundColor: 'transparent',
  },
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 0,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
    // <-- esto hace que el nav ocupe TODO el ancho
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
