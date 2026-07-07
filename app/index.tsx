import { Redirect } from 'expo-router';
import { useAppState } from '../src/context';
import { useAuth } from '../src/authContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '../src/theme';

export default function Index() {
  const { user, loading: authLoading } = useAuth();
  const { loading: appLoading } = useAppState();

  if (authLoading || (user && appLoading)) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/auth" />;
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bg,
  },
});
