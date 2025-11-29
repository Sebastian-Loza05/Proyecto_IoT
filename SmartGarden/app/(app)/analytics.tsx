import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '@/components/AppHeader';

const COLORS = {
  background: '#eff6ff',
  card: '#ffffff',
  title: '#1e3a8a',
  primary: '#2563eb',
  textSecondary: '#4b5563',
  border: '#dbeafe',
  danger: '#ef4444',
  success: '#16a34a',
};

const tempPoints = [18, 14, 19, 22, 23, 22, 20];
const humPoints = [65, 70, 68, 62, 64, 66, 68];
const lightPoints = [5, 10, 35, 80, 60, 30, 15];

function MiniChart({ points }: { points: number[] }) {
  // Esqueleto simple de línea: puntos alineados en X con distintas alturas
  return (
    <View style={styles.chartArea}>
      <View style={styles.chartBaseline} />
      <View style={styles.chartPointsRow}>
        {points.map((v, idx) => (
          <View key={idx} style={styles.chartPointColumn}>
            <View style={[styles.chartPoint, { marginBottom: v }]} />
          </View>
        ))}
      </View>
    </View>
  );
}

export default function AnalyticsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppHeader />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* EVOLUCIÓN DE PARÁMETROS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Evolución de Parámetros</Text>

            {/* Temperatura */}
            <View style={styles.graphCard}>
              <Text style={styles.graphTitle}>Temperatura (°C)</Text>
              <View style={styles.graphHeaderRow}>
                <Text style={styles.graphMainValue}>23°C</Text>
                <Text style={styles.graphDeltaDown}>↓ 8%</Text>
              </View>
              <MiniChart points={tempPoints} />
            </View>

            {/* Humedad */}
            <View style={styles.graphCard}>
              <Text style={styles.graphTitle}>Humedad (%)</Text>
              <View style={styles.graphHeaderRow}>
                <Text style={styles.graphMainValue}>68%</Text>
                <Text style={styles.graphDeltaUp}>↑ 4.6%</Text>
              </View>
              <MiniChart points={humPoints} />
            </View>

            {/* Luz */}
            <View style={styles.graphCard}>
              <Text style={styles.graphTitle}>Nivel de Luz (%)</Text>
              <View style={styles.graphHeaderRow}>
                <Text style={styles.graphMainValue}>10%</Text>
                <Text style={styles.graphDeltaDown}>↓ 83.3%</Text>
              </View>
              <MiniChart points={lightPoints} />
            </View>
          </View>

          {/* ESTADÍSTICAS DE HOY */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Estadísticas de Hoy</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statTitle}>Temp. Promedio</Text>
                <Text style={styles.statValue}>24.3°C</Text>
                <Text style={styles.statDeltaUp}>↑ 1.2°C vs ayer</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statTitle}>Humedad Media</Text>
                <Text style={styles.statValue}>67%</Text>
                <Text style={styles.statDeltaNeutral}>• Sin cambios</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statTitle}>Horas de Luz</Text>
                <Text style={styles.statValue}>8.5h</Text>
                <Text style={styles.statDeltaDown}>↓ 0.3h vs ayer</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statTitle}>Agua Usada</Text>
                <Text style={styles.statValue}>42.5L</Text>
                <Text style={styles.statDeltaUp}>↑ 5.2L vs ayer</Text>
              </View>
            </View>
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

  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.title,
    marginBottom: 12,
  },

  // Cards de gráficas
  graphCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  graphTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.title,
    marginBottom: 4,
  },
  graphHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  graphMainValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.title,
  },
  graphDeltaUp: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.success,
  },
  graphDeltaDown: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.danger,
  },

  chartArea: {
    marginTop: 4,
    height: 110,
    borderRadius: 12,
    backgroundColor: '#e5f0ff',
    paddingHorizontal: 12,
    paddingBottom: 12,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  chartBaseline: {
    position: 'absolute',
    left: 24,
    right: 8,
    bottom: 24,
    borderTopWidth: 1,
    borderColor: '#bfdbfe',
  },
  chartPointsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
    paddingTop: 16,
  },
  chartPointColumn: {
    flex: 1,
    alignItems: 'center',
  },
  chartPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },

  // Estadísticas de hoy
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    flexBasis: '48%',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statTitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.title,
    marginBottom: 4,
  },
  statDeltaUp: {
    fontSize: 11,
    color: COLORS.success,
  },
  statDeltaDown: {
    fontSize: 11,
    color: COLORS.danger,
  },
  statDeltaNeutral: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
});
