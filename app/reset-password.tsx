import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router, Redirect } from 'expo-router';
import { useAuth } from '../src/authContext';
import { Colors, Spacing, FontSize, Slab, Radius, Border, Type } from '../src/theme';

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
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <Text style={styles.title}>new password</Text>
          <Text style={styles.subtitle}>choose a new password for your account</Text>

          <Text style={styles.label}>password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="at least 6 characters"
            placeholderTextColor={Colors.textMuted}
            secureTextEntry
            autoCapitalize="none"
            textContentType="newPassword"
          />

          <Text style={styles.label}>confirm password</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="type it again"
            placeholderTextColor={Colors.textMuted}
            secureTextEntry
            autoCapitalize="none"
            textContentType="newPassword"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleSave}
            disabled={busy}
            activeOpacity={0.85}
          >
            {busy ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryBtnText}>save password</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.stateTodoBg },
  flex: { flex: 1 },
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
  title: {
    ...Type.screenTitle,
    color: Colors.ink,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.lg,
    fontFamily: Slab.bold,
    color: Colors.ink,
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSize.lg,
    fontFamily: Slab.black,
    color: Colors.ink,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.card,
    padding: Spacing.md,
    fontSize: FontSize.md,
    fontFamily: Slab.regular,
    color: Colors.ink,
    borderWidth: Border.thick,
    borderColor: Colors.ink,
    borderRadius: Radius.md,
  },
  error: {
    marginTop: Spacing.md,
    fontSize: FontSize.sm,
    fontFamily: Slab.bold,
    color: '#B00020',
  },
  primaryBtn: {
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md + 4,
    alignItems: 'center',
    backgroundColor: Colors.ink,
    borderWidth: Border.thick,
    borderColor: Colors.ink,
    borderRadius: Radius.md,
    minHeight: 56,
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: FontSize.xl,
    fontFamily: Slab.black,
  },
});
