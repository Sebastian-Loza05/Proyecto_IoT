// app/(app)/control.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '@/components/AppHeader';
import { Feather } from '@expo/vector-icons';

const COLORS = {
  background: '#eff6ff',
  card: '#ffffff',
  title: '#1e3a8a',
  primary: '#2563eb',
  textSecondary: '#4b5563',
  border: '#dbeafe',
  chipBgBlue: '#e0f2fe',
  chipBgGray: '#e5e7eb',
  chipTextGray: '#6b7280',
};

type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

interface ActuatorCardProps {
  name: string;
  status: 'Activo' | 'Inactivo';
  iconName: FeatherIconName;
  iconBg: string;
  duration: string;
  schedule: string;
  defaultMode: 'auto' | 'manual';
}

/**
 * Card de un actuador (bomba, ventilador, etc)
 */
function ActuatorCard(props: ActuatorCardProps) {
  const { name, status, iconName, iconBg, duration, schedule, defaultMode } =
    props;

  const [isEnabled, setIsEnabled] = useState(status === 'Activo');
  const [mode, setMode] = useState<'auto' | 'manual'>(defaultMode);

  const isActive = isEnabled;

  return (
    <View style={styles.actuatorCard}>
      {/* Header de la card */}
      <View style={styles.actuatorHeaderRow}>
        <View style={styles.actuatorLeft}>
          <View style={[styles.actuatorIconCircle, { backgroundColor: iconBg }]}>
            <Feather name={iconName} size={18} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.actuatorName}>{name}</Text>
            <Text
              style={[
                styles.actuatorStatus,
                isActive ? styles.actuatorStatusActive : styles.actuatorStatusInactive,
              ]}
            >
              {isActive ? 'Activo' : 'Inactivo'}
            </Text>
          </View>
        </View>

        <View style={styles.actuatorRight}>
          <TouchableOpacity style={styles.gearButton} activeOpacity={0.7}>
            <Feather name="settings" size={16} color={COLORS.chipTextGray} />
          </TouchableOpacity>

          <Switch
            value={isEnabled}
            onValueChange={setIsEnabled}
            thumbColor={isEnabled ? '#ffffff' : '#ffffff'}
            trackColor={{ false: '#e5e7eb', true: COLORS.primary }}
          />
        </View>
      </View>

      {/* Configuración */}
      <View style={styles.configCard}>
        <View>
          <Text style={styles.configTitle}>Configuración</Text>
          <Text style={styles.configLine}>• Duración: {duration}</Text>
          <Text style={styles.configLine}>• Horarios: {schedule}</Text>
        </View>

        <View style={styles.configChip}>
          <Text style={styles.configChipText}>Por defecto</Text>
        </View>
      </View>

      {/* Botones automático / manual */}
      <View style={styles.modeRow}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            mode === 'auto' && styles.modeButtonActive,
          ]}
          onPress={() => setMode('auto')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.modeButtonText,
              mode === 'auto' && styles.modeButtonTextActive,
            ]}
          >
            Automático
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeButton,
            mode === 'manual' && styles.modeButtonActive,
          ]}
          onPress={() => setMode('manual')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.modeButtonText,
              mode === 'manual' && styles.modeButtonTextActive,
            ]}
          >
            Manual
          </Text>
        </TouchableOpacity>
      </View>

      {/* Mensaje inferior */}
      <View style={styles.footerNote}>
        <Text style={styles.footerNoteText}>
          Control automático activo según sensores
        </Text>
      </View>
    </View>
  );
}

export default function ControlScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppHeader />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Título sección */}
          <View style={styles.sectionHeaderRow}>
            <Feather
              name="settings"
              size={16}
              color={COLORS.primary}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.sectionTitle}>Control de Actuadores</Text>
          </View>

          {/* Cards de actuadores */}
          <ActuatorCard
            name="Bomba de Agua"
            status="Activo"
            iconName="droplet"
            iconBg={COLORS.chipBgBlue}
            duration="2 min"
            schedule="07:00, 19:00"
            defaultMode="auto"
          />

          <ActuatorCard
            name="Ventilador"
            status="Inactivo"
            iconName="wind"
            iconBg="#cffafe"
            duration="5 min"
            schedule="12:00, 18:00"
            defaultMode="manual"
          />

          <ActuatorCard
            name="Trampilla de Luz"
            status="Activo"
            iconName="sun"
            iconBg="#fee9c3"
            duration="3 min"
            schedule="06:00"
            defaultMode="auto"
          />

          {/* Modo automático - info */}
          <View style={styles.autoInfoCard}>
            <Text style={styles.autoInfoTitle}>Modo Automático</Text>
            <Text style={styles.autoInfoText}>
              Los actuadores en modo automático se ajustan según los sensores y
              algoritmos de IA para mantener condiciones óptimas en el
              invernadero.
            </Text>
          </View>

          <View style={{ height: 16 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 16,
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.title,
  },

  // Card actuador
  actuatorCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  actuatorHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actuatorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actuatorIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  actuatorName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.title,
  },
  actuatorStatus: {
    fontSize: 12,
    marginTop: 2,
  },
  actuatorStatusActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  actuatorStatusInactive: {
    color: COLORS.textSecondary,
  },
  actuatorRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gearButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.chipBgGray,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Configuración
  configCard: {
    marginTop: 10,
    backgroundColor: '#e5f0ff',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  configTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.title,
    marginBottom: 2,
  },
  configLine: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  configChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: COLORS.chipBgGray,
  },
  configChipText: {
    fontSize: 11,
    color: COLORS.chipTextGray,
    fontWeight: '600',
  },

  // Botones modo
  modeRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
  },
  modeButton: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
  },
  modeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  modeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  modeButtonTextActive: {
    color: '#ffffff',
  },

  // Nota inferior
  footerNote: {
    marginTop: 8,
    borderRadius: 10,
    backgroundColor: '#eef2ff',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  footerNoteText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },

  // Card modo automático
  autoInfoCard: {
    marginTop: 4,
    backgroundColor: '#e5f0ff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  autoInfoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.title,
    marginBottom: 6,
  },
  autoInfoText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});
