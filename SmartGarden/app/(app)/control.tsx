import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '@/components/AppHeader';
import { Feather } from '@expo/vector-icons';
import { IP } from '@/utils/types';

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

const CONTROLLER_BASE =  `http://${IP}:8000/system/controllers/1`;

type FeatherIconName = React.ComponentProps<typeof Feather>['name'];
type ControllerKey = 'bomba' | 'motor' | 'servo';

interface DeviceConfiguration {
  device_configuration_id: number;
  device_id: number;
  actuador: ControllerKey;
  value: number;
}

interface DeviceConfigResponse {
  device_configurations: DeviceConfiguration[];
}

interface ActuatorCardProps {
  name: string;
  status: 'Activo' | 'Inactivo';
  iconName: FeatherIconName;
  iconBg: string;
  defaultMode: 'auto' | 'manual';

  controllerKey: ControllerKey;
  actionLabel: string;         // "Humedecer", "Ventilar", "Iluminar"/"Cerrar"
  actionProgressText: string;  // "Humedeciendo planta...", etc.
  canConfigureDuration?: boolean;
  initialSeconds?: number;     // 1–5 (para bomba / motor)
  afterCooldownMessage?: string; // Mensaje final después de los 15s
}

function ActuatorCard(props: ActuatorCardProps) {
  const {
    name,
    status,
    iconName,
    iconBg,
    defaultMode,
    controllerKey,
    actionLabel,
    actionProgressText,
    canConfigureDuration = false,
    initialSeconds = 2,
    afterCooldownMessage,
  } = props;

  const [mode, setMode] = useState<'auto' | 'manual'>(defaultMode);
  const [isActive] = useState(status === 'Activo');

  const [showConfig, setShowConfig] = useState(false);
  const [seconds, setSeconds] = useState(
    Math.min(5, Math.max(1, initialSeconds)),
  );
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configStatus, setConfigStatus] = useState<string | null>(null);

  const [isActionLocked, setIsActionLocked] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<number | null>(
    null,
  );
  const [cooldownTimeoutId, setCooldownTimeoutId] = useState<
    number | undefined
  >(undefined);
  const [cooldownIntervalId, setCooldownIntervalId] = useState<
    number | undefined
  >(undefined);

  useEffect(() => {
    return () => {
      if (cooldownTimeoutId !== undefined) clearTimeout(cooldownTimeoutId);
      if (cooldownIntervalId !== undefined) clearInterval(cooldownIntervalId);
    };
  }, [cooldownTimeoutId, cooldownIntervalId]);

  const handleToggleConfig = () => {
    if (!canConfigureDuration || isActionLocked) {
      return;
    }
    setShowConfig((prev) => !prev);
    setConfigStatus(null);
  };

  const handleChangeSeconds = (delta: number) => {
    if (!canConfigureDuration || isActionLocked) return;
    setSeconds((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > 5) return 5;
      return next;
    });
  };

  useEffect(() => {
    if (!configStatus) return;

    const id = setTimeout(() => {
      setConfigStatus(null);
    }, 3000); // 3 segundos

    return () => clearTimeout(id);
  }, [configStatus]);

  const handleSaveConfig = async () => {
    if (!canConfigureDuration || isActionLocked) return;
    try {
      setIsSavingConfig(true);
      setConfigStatus(null);

      await fetch(`${CONTROLLER_BASE}/${controllerKey}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          value: seconds,
        }),
      });

      setConfigStatus(`Configuración guardada correctamente (${seconds} s)`);

      setShowConfig(false);
    } catch (error) {
      console.error('Error guardando configuración', error);
      setConfigStatus('Error al actualizar configuración');
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleActionPress = useCallback(async () => {
    if (mode === 'auto' || isActionLocked) {
      return;
    }

    try {
      setIsActionLocked(true);
      setCooldownRemaining(15);
      setFeedback(
        `${actionProgressText} Espera 15s para volver a usar este actuador.`,
      );

      await fetch(CONTROLLER_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ target: controllerKey }),
      });

      const intervalId = setInterval(() => {
        setCooldownRemaining((prev) => {
          if (prev === null) return prev;
          const next = prev - 1;
          if (next <= 0) {
            return 0;
          }
          setFeedback(
            `${actionProgressText} Espera ${next}s para volver a usar este actuador.`,
          );
          return next;
        });
      }, 1000) as unknown as number;
      setCooldownIntervalId(intervalId);

      const timeoutId = setTimeout(() => {
        setIsActionLocked(false);
        setCooldownRemaining(null);
        clearInterval(intervalId);

        if (afterCooldownMessage) {
          setFeedback(afterCooldownMessage);
        } else {
          setFeedback(null);
        }
      }, 15000) as unknown as number;

      setCooldownTimeoutId(timeoutId);
    } catch (error) {
      console.error('Error enviando comando de acción', error);
      setIsActionLocked(false);
      setFeedback('Error al ejecutar acción');
      setCooldownRemaining(null);
    }
  }, [mode, isActionLocked, actionProgressText, controllerKey, afterCooldownMessage]);

  const isActionDisabled = mode === 'auto' || isActionLocked;
  const isConfigDisabled = !canConfigureDuration || isActionLocked;
  const areModeButtonsDisabled = isActionLocked;

  return (
    <View style={styles.actuatorCard}>
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
                isActive
                  ? styles.actuatorStatusActive
                  : styles.actuatorStatusInactive,
              ]}
            >
              {isActive ? 'Activo' : 'Inactivo'}
            </Text>
          </View>
        </View>

        <View style={styles.actuatorRight}>
          <TouchableOpacity
            style={[
              styles.gearButton,
              isConfigDisabled && styles.gearButtonDisabled,
            ]}
            activeOpacity={0.7}
            onPress={handleToggleConfig}
          >
            <Feather
              name="settings"
              size={16}
              color={COLORS.chipTextGray}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              isActionDisabled && styles.actionButtonDisabled,
            ]}
            activeOpacity={0.8}
            onPress={handleActionPress}
            disabled={isActionDisabled}
          >
            <View style={styles.actionButtonContent}>
              {isActionLocked && (
                <Feather
                  name="loader"
                  size={12}
                  color="#ffffff"
                  style={{ marginRight: 4 }}
                />
              )}
              <Text
                style={[
                  styles.actionButtonText,
                  isActionDisabled && styles.actionButtonTextDisabled,
                ]}
              >
                {isActionLocked
                  ? `${actionLabel}${
                      cooldownRemaining !== null ? ` (${cooldownRemaining}s)` : ''
                    }`
                  : actionLabel}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Configuración */}

      <View style={styles.configCard}>
        {/* Fila principal: texto izquierda + controles derecha */}
        <View style={styles.configRow}>
          {/* Columna izquierda */}
          <View>
            <Text style={styles.configTitle}>Configuración</Text>

            {canConfigureDuration ? (
              <>
                <Text style={styles.configLine}>
                  • Duración (1–5 s): {seconds} s
                </Text>
                <Text style={styles.configLine}>
                  • Control de tiempo desde la app
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.configLine}>• Duración fija desde sistema</Text>
                <Text style={styles.configLine}>
                  • Este actuador no es modificable
                </Text>
              </>
            )}
          </View>

          {/* Columna derecha */}
          <View style={styles.configRight}>
            {canConfigureDuration && showConfig && (
              <View style={styles.configControls}>
                <View style={styles.stepperContainer}>
                  <TouchableOpacity
                    style={[
                      styles.stepperButton,
                      isConfigDisabled && styles.stepperButtonDisabled,
                    ]}
                    onPress={() => handleChangeSeconds(-1)}
                    disabled={isConfigDisabled}
                  >
                    <Text style={styles.stepperButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepperValue}>{seconds}s</Text>
                  <TouchableOpacity
                    style={[
                      styles.stepperButton,
                      isConfigDisabled && styles.stepperButtonDisabled,
                    ]}
                    onPress={() => handleChangeSeconds(1)}
                    disabled={isConfigDisabled}
                  >
                    <Text style={styles.stepperButtonText}>+</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[
                    styles.saveConfigButton,
                    (isSavingConfig || isConfigDisabled) &&
                      styles.saveConfigButtonDisabled,
                  ]}
                  activeOpacity={0.8}
                  onPress={handleSaveConfig}
                  disabled={isSavingConfig || isConfigDisabled}
                >
                  <Text style={styles.saveConfigButtonText}>
                    {isSavingConfig ? 'Guardando...' : 'Guardar'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Chip cuando está cerrado */}
            {!showConfig && (
              <View style={styles.configChip}>
                <Text style={styles.configChipText}>
                  {canConfigureDuration ? 'Configurable' : 'Fijo'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Mensaje siempre visible, debajo y usando todo el ancho */}
        {configStatus && (
          <Text style={styles.configStatusText}>{configStatus}</Text>
        )}
      </View>
      {/* Botones automático / manual */}
      <View style={styles.modeRow}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            mode === 'auto' && styles.modeButtonActive,
            areModeButtonsDisabled && styles.modeButtonDisabled,
          ]}
          onPress={() => !areModeButtonsDisabled && setMode('auto')}
          activeOpacity={0.8}
          disabled={areModeButtonsDisabled}
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
            areModeButtonsDisabled && styles.modeButtonDisabled,
          ]}
          onPress={() => !areModeButtonsDisabled && setMode('manual')}
          activeOpacity={0.8}
          disabled={areModeButtonsDisabled}
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
        {mode === 'auto' ? (
          <Text style={styles.footerNoteText}>
            Control automático activo según sensores
          </Text>
        ) : feedback ? (
          <Text style={styles.footerNoteText}>{feedback}</Text>
        ) : (
          <Text style={styles.footerNoteText}>
            Modo manual listo para comandos directos
          </Text>
        )}
      </View>
    </View>
  );
}

export default function ControlScreen() {
  const [configs, setConfigs] = useState<Record<ControllerKey, number>>({
    bomba: 2,
    motor: 1,
    servo: 90,
  });

  // Carga inicial de /controllers/1/config
  useEffect(() => {
    const loadConfigs = async () => {
      try {
        const res = await fetch(`${CONTROLLER_BASE}/config`);
        const data: DeviceConfigResponse = await res.json();

        const map: Record<ControllerKey, number> = {
          bomba: 2,
          motor: 1,
          servo: 90,
        };

        data.device_configurations.forEach((cfg) => {
          map[cfg.actuador] = cfg.value;
        });

        setConfigs(map);
      } catch (error) {
        console.error('Error cargando configuraciones', error);
        // Si falla, nos quedamos con los defaults
      }
    };

    loadConfigs();
  }, []);

  // === Mapeo especial para iluminación (servo) ===
  // Si recibes 90 → mostrar "Iluminar"
  // Si recibes 180 → mostrar "Cerrar"
  const servoValue = configs.servo;
  const servoActionLabel =
    servoValue === 180 ? 'Cerrar' : 'Iluminar'; // 90 (o cualquier otro) → Iluminar
  const servoProgressText =
    servoValue === 180
      ? 'Cerrando trampilla de luz...'
      : 'Iluminando planta...';

  const servoAfterCooldownMessage =
    servoActionLabel === 'Cerrar'
      ? 'Trampilla cerrada. La próxima acción la abrirá.'
      : 'Trampilla abierta. La próxima acción la cerrará.';

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

          {/* Bomba de Agua -> "bomba" */}
          <ActuatorCard
            name="Bomba de Agua"
            status="Activo"
            iconName="droplet"
            iconBg={COLORS.chipBgBlue}
            defaultMode="auto"
            controllerKey="bomba"
            actionLabel="Humedecer"
            actionProgressText="Humedeciendo planta..."
            canConfigureDuration
            initialSeconds={configs.bomba ?? 2}
          />

          {/* Ventilador -> "motor" */}
          <ActuatorCard
            name="Ventilador"
            status="Inactivo"
            iconName="wind"
            iconBg="#cffafe"
            defaultMode="manual"
            controllerKey="motor"
            actionLabel="Ventilar"
            actionProgressText="Ventilando planta..."
            canConfigureDuration
            initialSeconds={configs.motor ?? 1}
          />

          {/* Trampilla de Luz -> "servo" (no modificable, texto depende de 90/180) */}
          <ActuatorCard
            name="Trampilla de Luz"
            status="Activo"
            iconName="sun"
            iconBg="#fee9c3"
            defaultMode="auto"
            controllerKey="servo"
            actionLabel={servoActionLabel}
            actionProgressText={servoProgressText}
            canConfigureDuration={false}
            initialSeconds={configs.servo ?? 90}
            afterCooldownMessage={servoAfterCooldownMessage}
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
  gearButtonDisabled: {
    opacity: 0.4,
  },

  actionButton: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: COLORS.primary,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },
  actionButtonTextDisabled: {
    color: '#e5e7eb',
  },

  // Configuración
  configCard: {
    marginTop: 10,
    backgroundColor: '#e5f0ff',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
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

  configControls: {
    alignItems: 'flex-end',
  },
  configStatusText: {
    marginTop: 4,
    fontSize: 10,
    color: '#16a34a',
    textAlign: 'right',
    alignSelf: 'stretch', // ocupa el ancho de la tarjeta
    flexShrink: 1,        // permite que el texto haga wrap
  },

  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepperButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.chipBgGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperButtonDisabled: {
    opacity: 0.4,
  },
  stepperButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  stepperValue: {
    marginHorizontal: 8,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.title,
  },
  saveConfigButton: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: COLORS.primary,
  },
  saveConfigButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  saveConfigButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
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
  modeButtonDisabled: {
    opacity: 0.5,
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
  configRight: {
    alignItems: 'flex-end',
    marginLeft: 8,
    flexShrink: 1, // se encoge en pantallas pequeñas
  },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
});
