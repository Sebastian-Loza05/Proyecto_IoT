import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '@/components/AppHeader';
import { IP } from '@/utils/types';

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

const API_BASE = `http://${IP}:8000/system/data-sensors/1`;

type DeviceSensor = {
  device_sensor_id: number;
  device_id: number;
  sensor_id: number;
  value: number;
  event_date: string;
  event_time: string;
};

type SensorRawResponse = {
  device_sensors: DeviceSensor[];
};

type SensorParsed = {
  points: number[];
  current: number;
  delta: number;
};

function MiniChart({ points }: { points: number[] }) {
  if (!points || points.length === 0) {
    return (
      <View style={styles.chartArea}>
        <View style={styles.chartBaseline} />
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 11, color: COLORS.textSecondary }}>
            Sin datos
          </Text>
        </View>
      </View>
    );
  }

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

function useSensorData(sensorId: number) {
  const [data, setData] = useState<SensorParsed | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchSensor() {
      try {
        setLoading(true);
        setError(null);

        const url = `${API_BASE}?sensor_id=${sensorId}`;
        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const json: SensorRawResponse = await res.json();

        const list = json.device_sensors ?? [];
        const points = list.map((d) => Number(d.value)).filter((v) => !isNaN(v));

        let current = 0;
        let delta = 0;

        if (points.length > 0) {
          current = points[points.length - 1];
          const first = points[0];

          if (first !== 0) {
            delta = ((current - first) / first) * 100;
          } else {
            delta = 0;
          }
        }

        if (isMounted) {
          setData({ points, current, delta });
        }
      } catch (e: any) {
        console.error('Error fetching sensor', sensorId, e);
        if (isMounted) {
          setError(e?.message ?? 'Error desconocido');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchSensor();

    return () => {
      isMounted = false;
    };
  }, [sensorId]);

  return { data, loading, error };
}

export default function AnalyticsScreen() {
  // 1 = temperatura, 2 = humedad, 3 = luz
  const {
    data: tempData,
    loading: tempLoading,
    error: tempError,
  } = useSensorData(1);

  const {
    data: humData,
    loading: humLoading,
    error: humError,
  } = useSensorData(2);

  const {
    data: lightData,
    loading: lightLoading,
    error: lightError,
  } = useSensorData(3);

  const anyLoading = tempLoading || humLoading || lightLoading;

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

            {anyLoading && (
              <View style={{ marginBottom: 12, alignItems: 'center' }}>
                <ActivityIndicator />
                <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>
                  Cargando datos de sensores...
                </Text>
              </View>
            )}

            {/* Temperatura */}
            <View style={styles.graphCard}>
              <Text style={styles.graphTitle}>Temperatura (°C)</Text>
              <View style={styles.graphHeaderRow}>
                <Text style={styles.graphMainValue}>
                  {tempData ? `${tempData.current.toFixed(1)}°C` : '--'}
                </Text>

                {tempData ? (
                  <Text
                    style={
                      tempData.delta >= 0
                        ? styles.graphDeltaUp
                        : styles.graphDeltaDown
                    }
                  >
                    {tempData.delta >= 0 ? '↑' : '↓'}{' '}
                    {Math.abs(tempData.delta).toFixed(1)}%
                  </Text>
                ) : tempError ? (
                  <Text style={styles.graphDeltaDown}>Error</Text>
                ) : (
                  <Text style={styles.graphDeltaDown}>...</Text>
                )}
              </View>
              <MiniChart points={tempData?.points ?? []} />
            </View>

            {/* Humedad */}
            <View style={styles.graphCard}>
              <Text style={styles.graphTitle}>Humedad (%)</Text>
              <View style={styles.graphHeaderRow}>
                <Text style={styles.graphMainValue}>
                  {humData ? `${humData.current.toFixed(1)}%` : '--'}
                </Text>

                {humData ? (
                  <Text
                    style={
                      humData.delta >= 0
                        ? styles.graphDeltaUp
                        : styles.graphDeltaDown
                    }
                  >
                    {humData.delta >= 0 ? '↑' : '↓'}{' '}
                    {Math.abs(humData.delta).toFixed(1)}%
                  </Text>
                ) : humError ? (
                  <Text style={styles.graphDeltaDown}>Error</Text>
                ) : (
                  <Text style={styles.graphDeltaDown}>...</Text>
                )}
              </View>
              <MiniChart points={humData?.points ?? []} />
            </View>

            {/* Luz */}
            <View style={styles.graphCard}>
              <Text style={styles.graphTitle}>Nivel de Luz (%)</Text>
              <View style={styles.graphHeaderRow}>
                <Text style={styles.graphMainValue}>
                  {lightData ? `${lightData.current.toFixed(1)}%` : '--'}
                </Text>

                {lightData ? (
                  <Text
                    style={
                      lightData.delta >= 0
                        ? styles.graphDeltaUp
                        : styles.graphDeltaDown
                    }
                  >
                    {lightData.delta >= 0 ? '↑' : '↓'}{' '}
                    {Math.abs(lightData.delta).toFixed(1)}%
                  </Text>
                ) : lightError ? (
                  <Text style={styles.graphDeltaDown}>Error</Text>
                ) : (
                  <Text style={styles.graphDeltaDown}>...</Text>
                )}
              </View>
              <MiniChart points={lightData?.points ?? []} />
            </View>
          </View>

          {/* ESTADÍSTICAS DE HOY (por ahora estático; puedes conectar luego a otro endpoint) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Estadísticas de Hoy</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statTitle}>Temp. Promedio</Text>
                <Text style={styles.statValue}>
                  {tempData
                    ? `${(
                        tempData.points.reduce((a, b) => a + b, 0) /
                        tempData.points.length
                      ).toFixed(1)}°C`
                    : '24.3°C'}
                </Text>
                <Text style={styles.statDeltaUp}>↑ 1.2°C vs ayer</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statTitle}>Humedad Media</Text>
                <Text style={styles.statValue}>
                  {humData
                    ? `${(
                        humData.points.reduce((a, b) => a + b, 0) /
                        humData.points.length
                      ).toFixed(1)}%`
                    : '67%'}
                </Text>
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
