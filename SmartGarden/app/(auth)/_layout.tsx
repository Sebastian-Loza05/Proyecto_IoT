import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'white' },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="login" options={{ title: "Ingresar" }} />
      <Stack.Screen name="register" options={{ title: "Crear cuenta" }} />
    </Stack>
  );
}
