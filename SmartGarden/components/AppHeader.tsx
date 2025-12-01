import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = {
  background: '#eff6ff',
  card: '#ffffff',
  title: '#1e3a8a',
  primary: '#2563eb',
  textSecondary: '#4b5563',
  border: '#dbeafe',
  buttonStart: '#60a5fa',
  buttonEnd: '#3b82f6',
  white: '#ffffff',
};

interface Props {
  subtitle?: string;
}

export default function AppHeader({ subtitle = 'Invernadero Inteligente' }: Props) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <View>
          <Text style={styles.title}>SmartGarden</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <LinearGradient
          colors={[COLORS.buttonStart, COLORS.buttonEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconContainer}
        >
          <FontAwesome6 name="feather-pointed" size={20} color={COLORS.white} />
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: 0,
    marginBottom: 0,
    backgroundColor: COLORS.card,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 0,  
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
    // esto hace que ocupe TODO el ancho disponible:
    alignSelf: 'stretch',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.title,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
