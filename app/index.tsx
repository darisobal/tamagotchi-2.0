import { Redirect } from 'expo-router';
import { useAppState } from '../src/context';
import { useAuth } from '../src/authContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { initialRoute } from '../src/onboarding';
import { Colors } from '../src/theme';

export default function Index() {
  const { user, loading: authLoading, passwordRecoveryPending } = useAuth();
  const { loading: appLoading, prefs } = useAppState();

  if (authLoading || (appLoading && !passwordRecoveryPending)) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return <Redirect href={initialRoute(prefs, passwordRecoveryPending)} />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bg,
  },
});
