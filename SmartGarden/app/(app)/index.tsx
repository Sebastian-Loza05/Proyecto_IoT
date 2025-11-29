import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '@/components/AppHeader';
import { useSession } from '@/context/AuthContext';
import { Href, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSensorSocket } from '@/utils/useSensorSockets';

const COLORS = {
  background: '#eff6ff',
  card: '#ffffff',
  title: '#1e3a8a',
  primary: '#2563eb',
  textSecondary: '#4b5563',
  border: '#dbeafe',
  danger: '#ef4444',
  warning: '#f97316',
  info: '#0ea5e9',
  chipBgRed: '#fee2e2',
  chipBgOrange: '#ffedd5',
  chipBgBlue: '#e0f2fe',
};

export default function HomeScreen() {
  const { signOut } = useSession();
  const router = useRouter();
  const { data, isConnected } = useSensorSocket();

  const handleLogout = () => {
    signOut();
    router.replace('/auth/login' as Href);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppHeader />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ACTIVIDAD RECIENTE */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Actividad Reciente</Text>
            </View>

            <View style={styles.activityCard}>
              <View style={styles.row}>
                <View style={styles.iconCircleBlue}>
                  <Feather name="droplet" size={18} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.activityTitle}>
                    Bomba de Agua activado
                  </Text>
                  <Text style={styles.activitySubtitle}>hace 2 min</Text>
                </View>
              </View>
            </View>
          </View>

          {/* ESTADO DE LAS ZONAS */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Estado de las Zonas</Text>
            </View>

            <View style={styles.zoneCard}>
              <View style={styles.zoneHeaderRow}>
                <View>
                  <Text style={styles.zoneTitle}>Zona A - Tomates</Text>
                  <View style={styles.zoneStatusRow}>
                    <Feather
                      name="check-circle"
                      size={14}
                      color={COLORS.primary}
                    />
                    <Text style={styles.zoneStatusText}>Óptimo</Text>
                  </View>
                </View>
              </View>

              <View style={styles.metricsRow}>
                <View style={styles.metricCard}>
                  <View style={styles.metricIconCircle}>
                    <Feather
                      name="thermometer"
                      size={18}
                      color={COLORS.primary}
                    />
                  </View>
                  <Text style={styles.metricLabel}>Temp.</Text>
                  <Text style={styles.metricValue}>
                    {data?.temperatura !== undefined ? data.temperatura : '--'}°C
                  </Text>
                </View>

                <View style={styles.metricCard}>
                  <View style={styles.metricIconCircle}>
                    <Feather
                      name="droplet"
                      size={18}
                      color={COLORS.primary}
                    />
                  </View>
                  <Text style={styles.metricLabel}>Humedad</Text>
                  <Text style={styles.metricValue}>
                    {data?.humedad !== undefined ? data.humedad : '--'}%
                  </Text>
                </View>

                <View style={styles.metricCard}>
                  <View style={styles.metricIconCircle}>
                    <Feather name="sun" size={18} color={COLORS.primary} />
                  </View>
                  <Text style={styles.metricLabel}>Luz</Text>
                  <Text style={styles.metricValue}>
                    {data?.luz !== undefined ? data.luz : '--'}%
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* RECOMENDACIONES INTELIGENTES */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Feather
                name="trending-up"
                size={16}
                color={COLORS.primary}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.sectionTitle}>Recomendaciones Inteligentes</Text>
            </View>

            {/* Card 1 - Prioridad Alta */}
            <View style={[styles.recoCard, styles.recoCardRed]}>
              <View style={styles.recoLeftIcon}>
                <View style={styles.iconCircleBlueSoft}>
                  <Feather
                    name="droplet"
                    size={18}
                    color={COLORS.primary}
                  />
                </View>
              </View>

              <View style={{ flex: 1 }}>
                <View style={styles.recoChipRow}>
                  <View style={[styles.chip, styles.chipRed]}>
                    <Text style={styles.chipRedText}>Prioridad Alta</Text>
                  </View>
                </View>

                <Text style={styles.recoTitle}>
                  Se recomienda regar Zona B mañana a las 07:00
                </Text>
                <Text style={styles.recoSubtitle}>
                  • Predicción de humedad baja basada en tendencia
                </Text>
              </View>
            </View>

            {/* Card 2 - Prioridad Media */}
            <View style={[styles.recoCard, styles.recoCardOrange]}>
              <View style={styles.recoLeftIcon}>
                <View style={styles.iconCircleBlueSoft}>
                  <Feather
                    name="cloud"
                    size={18}
                    color={COLORS.primary}
                  />
                </View>
              </View>

              <View style={{ flex: 1 }}>
                <View style={styles.recoChipRow}>
                  <View style={[styles.chip, styles.chipOrange]}>
                    <Text style={styles.chipOrangeText}>Prioridad Media</Text>
                  </View>
                </View>

                <Text style={styles.recoTitle}>
                  Probable exceso de humedad en Zona B en 2 días
                </Text>
                <Text style={styles.recoSubtitle}>
                  • Análisis de patrones climáticos
                </Text>
              </View>
            </View>

            {/* Card 3 - Información */}
            <View style={[styles.recoCard, styles.recoCardBlue]}>
              <View style={styles.recoLeftIcon}>
                <View style={styles.iconCircleBlueSoft}>
                  <Feather
                    name="thermometer"
                    size={18}
                    color={COLORS.primary}
                  />
                </View>
              </View>

              <View style={{ flex: 1 }}>
                <View style={styles.recoChipRow}>
                  <View style={[styles.chip, styles.chipBlue]}>
                    <Text style={styles.chipBlueText}>Información</Text>
                  </View>
                </View>

                <Text style={styles.recoTitle}>
                  Temperatura óptima mantenida en todas las zonas
                </Text>
                <Text style={styles.recoSubtitle}>
                  • Condiciones estables últimas 48h
                </Text>
              </View>
            </View>
          </View>

          {/* BOTÓN CERRAR SESIÓN - AL FINAL */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>

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

  // Secciones
  section: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.title,
  },

  // Actividad reciente
  activityCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircleBlue: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.chipBgBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.title,
  },
  activitySubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  // Estado de las zonas
  zoneCard: {
    backgroundColor: '#e5f0ff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  zoneHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  zoneTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.title,
  },
  zoneStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  zoneStatusText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metricIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.chipBgBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  metricValue: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.title,
  },

  // Recomendaciones
  recoCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  recoCardRed: {
    backgroundColor: COLORS.chipBgRed,
  },
  recoCardOrange: {
    backgroundColor: COLORS.chipBgOrange,
  },
  recoCardBlue: {
    backgroundColor: '#e0f7ff',
  },
  recoLeftIcon: {
    marginRight: 10,
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  iconCircleBlueSoft: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.chipBgBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recoChipRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  chipRed: {
    backgroundColor: COLORS.chipBgRed,
  },
  chipOrange: {
    backgroundColor: COLORS.chipBgOrange,
  },
  chipBlue: {
    backgroundColor: COLORS.chipBgBlue,
  },
  chipRedText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.danger,
  },
  chipOrangeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.warning,
  },
  chipBlueText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.info,
  },
  recoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.title,
    marginBottom: 2,
  },
  recoSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  // Cerrar sesión
  logoutButton: {
    marginTop: 12,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.card,
  },
  logoutText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
});
