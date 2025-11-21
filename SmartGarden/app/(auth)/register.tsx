import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator,
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons'; 
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useSession } from '@/context/AuthContext';
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

export default function Register() {
  const router = useRouter();
  // const { signIn } = useSession(); 
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    deviceId: '',
    devicePassword: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDevicePassword, setShowDevicePassword] = useState(false);

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleRegister = async () => {
    if (!formData.email || !formData.password || !formData.deviceId) {
      Alert.alert("Error", "Por favor completa los campos requeridos");
      return;
    }

    setIsSubmitting(true);
    
    // Simulación de registro
    setTimeout(() => {
      console.log("Registrando usuario:", formData);
      setIsSubmitting(false);
      // Aquí redirigimos al login tras el registro exitoso
      router.replace('/login'); 
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={styles.backButton}
            >
              <Feather name="arrow-left" size={24} color={COLORS.title} />
            </TouchableOpacity>
            
            <View>
              <Text style={styles.appName}>Crear Cuenta</Text>
              <Text style={styles.subtitle}>Únete a SmartGarden</Text>
            </View>
          </View>

          <View style={styles.form}>
            
            <Text style={styles.sectionTitle}>Datos Personales</Text>
            
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Nombre</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Juan"
                    placeholderTextColor="#9ca3af"
                    value={formData.firstName}
                    onChangeText={(t) => handleChange('firstName', t)}
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Apellido</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Pérez"
                    placeholderTextColor="#9ca3af"
                    value={formData.lastName}
                    onChangeText={(t) => handleChange('lastName', t)}
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo Electrónico</Text>
              <View style={styles.inputContainer}>
                <Feather name="mail" size={20} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="ejemplo@smartgarden.com"
                  placeholderTextColor="#9ca3af"
                  value={formData.email}
                  onChangeText={(t) => handleChange('email', t)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Teléfono</Text>
              <View style={styles.inputContainer}>
                <Feather name="smartphone" size={20} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="+51 999 999 999"
                  placeholderTextColor="#9ca3af"
                  value={formData.phone}
                  onChangeText={(t) => handleChange('phone', t)}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.inputContainer}>
                <Feather name="lock" size={20} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Mínimo 8 caracteres"
                  placeholderTextColor="#9ca3af"
                  value={formData.password}
                  onChangeText={(t) => handleChange('password', t)}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Feather name={showPassword ? "eye" : "eye-off"} size={20} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Vinculación de Kit IoT</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>ID del Dispositivo (Serial)</Text>
              <View style={styles.inputContainer}>
                <Feather name="cpu" size={20} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="ej. RAK-3201-XYZ"
                  placeholderTextColor="#9ca3af"
                  value={formData.deviceId}
                  onChangeText={(t) => handleChange('deviceId', t)}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Clave de Acceso del Kit</Text>
              <View style={styles.inputContainer}>
                <Feather name="key" size={20} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Clave provista en la caja"
                  placeholderTextColor="#9ca3af"
                  value={formData.devicePassword}
                  onChangeText={(t) => handleChange('devicePassword', t)}
                  secureTextEntry={!showDevicePassword}
                />
                <TouchableOpacity onPress={() => setShowDevicePassword(!showDevicePassword)}>
                  <Feather name={showDevicePassword ? "eye" : "eye-off"} size={20} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              onPress={handleRegister}
              disabled={isSubmitting}
              activeOpacity={0.8}
              style={styles.buttonShadow}
            >
              <LinearGradient
                colors={[COLORS.buttonStart, COLORS.buttonEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.buttonText}>Completar Registro</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.linkText}>Inicia Sesión</Text>
              </TouchableOpacity>
            </View>
            
            <View style={{ height: 40 }} /> 
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 24,
    paddingTop: 20,
    width: '100%',
    maxWidth: 450,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.title,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 12,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  form: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52, 
    borderWidth: 1.5,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  buttonShadow: {
    marginTop: 20,
    borderRadius: 16,
    shadowColor: COLORS.buttonEnd,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  linkText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 4,
  },
});
