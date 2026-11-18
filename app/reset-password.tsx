import { Page } from '../src/design-system/Page';
import { Button, ScreenHeader, TextField } from '../src/design-system/Controls';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { router, Redirect } from 'expo-router';
import { useAuth } from '../src/authContext';
import { Colors, Spacing, Type } from '../src/theme';
import { DesignType } from '../src/design-system/tokens';

export default function ResetPasswordScreen() {
  const {
    user,
    loading,
    updatePassword,
    passwordRecoveryPending,
    clearPasswordRecovery,
  } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color={Colors.ink} />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return <Redirect href="/auth" />;
  }

  if (!passwordRecoveryPending) {
    return <Redirect href="/(tabs)" />;
  }

  const handleSave = async () => {
    setError(null);
    if (password.length < 6) {
      setError('use at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('passwords do not match.');
      return;
    }

    setBusy(true);
    const err = await updatePassword(password);
    setBusy(false);

    if (err) {
      setError(err);
      return;
    }

    clearPasswordRecovery();
    router.replace('/(tabs)');
  };

  return (
    <Page bottomPadding={48}>
          <ScreenHeader title="new password" />
          <Text style={styles.subtitle}>choose a new password for your account</Text>

          <TextField label="password" multiline={false} editable={!busy}
            value={password}
            onChangeText={setPassword}
            placeholder="at least 6 characters"
            placeholderTextColor={Colors.textMuted}
            secureTextEntry
            autoCapitalize="none"
            textContentType="newPassword"
          />

          <TextField label="confirm password" multiline={false} editable={!busy}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="type it again"
            placeholderTextColor={Colors.textMuted}
            secureTextEntry
            autoCapitalize="none"
            textContentType="newPassword"
          />

          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

          <Button label="save password" state={busy ? 'loading' : 'default'} onPress={handleSave} />
    </Page>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.stateTodoBg },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    ...Type.screenDescription,
  },
  error: {
    marginTop: Spacing.md,
    ...DesignType.calendar,
    color: '#B00020',
  },
});
