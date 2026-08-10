import { Redirect, useLocalSearchParams } from 'expo-router';
import { useAppState } from '../src/context';
import { useAuth } from '../src/authContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '../src/theme';

function pickDemoParams(params: Record<string, string | string[] | undefined>) {
  const out: { demo?: string; ball?: string } = {};
  const demo = Array.isArray(params.demo) ? params.demo[0] : params.demo;
  const ball = Array.isArray(params.ball) ? params.ball[0] : params.ball;
  if (demo) out.demo = demo;
  if (ball) out.ball = ball;
  return out;
}

export default function Index() {
  const { user, loading: authLoading, passwordRecoveryPending } = useAuth();
  const { loading: appLoading } = useAppState();
  const params = useLocalSearchParams();
  const demoParams = pickDemoParams(params);

  if (authLoading || (user && appLoading && !passwordRecoveryPending)) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/auth" />;
  }

  if (passwordRecoveryPending) {
    return <Redirect href="/reset-password" />;
  }

  return (
    <Redirect
      href={{
        pathname: '/(tabs)',
        params: demoParams,
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bg,
  },
});
