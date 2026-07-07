import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  HeptaSlab_100Thin,
  HeptaSlab_200ExtraLight,
  HeptaSlab_300Light,
  HeptaSlab_400Regular,
  HeptaSlab_500Medium,
  HeptaSlab_600SemiBold,
  HeptaSlab_700Bold,
  HeptaSlab_800ExtraBold,
  HeptaSlab_900Black,
} from '@expo-google-fonts/hepta-slab';
import { AppProvider } from '../src/context';
import { AuthProvider } from '../src/authContext';
import { Colors } from '../src/theme';

SplashScreen.preventAutoHideAsync();

const heptaSlabFontMap = {
  HeptaSlab_100Thin,
  HeptaSlab_200ExtraLight,
  HeptaSlab_300Light,
  HeptaSlab_400Regular,
  HeptaSlab_500Medium,
  HeptaSlab_600SemiBold,
  HeptaSlab_700Bold,
  HeptaSlab_800ExtraBold,
  HeptaSlab_900Black,
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts(heptaSlabFontMap);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <AppProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.stateTodoBg },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="auth" />
          <Stack.Screen
            name="checkin"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="(tabs)"
            options={{ contentStyle: { backgroundColor: 'transparent' } }}
          />
        </Stack>
      </AppProvider>
    </AuthProvider>
  );
}
