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

export default function AuthScreen() {
  const {
    user,
    loading,
    continueWithPassword,
    resendConfirmationEmail,
    isConfigured,
    isLocalOnly,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [resendNotice, setResendNotice] = useState<string | null>(null);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color={Colors.ink} />
        </View>
      </SafeAreaView>
    );
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  const handleContinue = async () => {
    setError(null);
    setResendNotice(null);
    setConfirmationSent(false);
    setBusy(true);

    const result = await continueWithPassword(email.trim(), password);
    setBusy(false);

    if (result.outcome === 'error') {
      setError(result.message);
      return;
    }
    if (result.outcome === 'confirm_email') {
      setConfirmationSent(true);
      return;
    }
    router.replace('/(tabs)');
  };

  const handleResendConfirmation = async () => {
    setError(null);
    setResendNotice(null);
    if (!email.trim()) {
      setError('enter your email first.');
      return;
    }
    setBusy(true);
    const err = await resendConfirmationEmail(email.trim());
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    setResendNotice('confirmation email sent again. check your inbox.');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <Text style={styles.title}>welcome</Text>
          <Text style={styles.subtitle}>your habit has a heartbeat</Text>

          {isLocalOnly ? (
            <Text style={styles.hint}>
              local mode: data stays on this device until you add Supabase keys.
            </Text>
          ) : null}

          <Text style={styles.label}>email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
          />

          <Text style={styles.label}>password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="at least 6 characters"
            placeholderTextColor={Colors.textMuted}
            secureTextEntry
            autoCapitalize="none"
            textContentType="password"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {confirmationSent ? (
            <Text style={styles.success}>
              check your email to confirm your account, then open the link to continue.
            </Text>
          ) : null}
          {resendNotice ? <Text style={styles.success}>{resendNotice}</Text> : null}

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleContinue}
            disabled={busy}
            activeOpacity={0.85}
          >
            {busy ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryBtnText}>go</Text>
            )}
          </TouchableOpacity>

          {confirmationSent && isConfigured ? (
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={handleResendConfirmation}
              disabled={busy}
              activeOpacity={0.85}
            >
              <Text style={styles.secondaryBtnText}>resend confirmation email</Text>
            </TouchableOpacity>
          ) : null}
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
  hint: {
    fontSize: FontSize.sm,
    fontFamily: Slab.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
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
  success: {
    marginTop: Spacing.md,
    fontSize: FontSize.sm,
    fontFamily: Slab.bold,
    color: Colors.ink,
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
  secondaryBtn: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: Border.base,
    borderColor: Colors.ink,
    borderRadius: Radius.md,
  },
  secondaryBtnText: {
    color: Colors.ink,
    fontSize: FontSize.md,
    fontFamily: Slab.bold,
  },
});
