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
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../src/authContext';
import { Colors, Spacing, FontSize, Slab, Radius, Border, Type } from '../src/theme';

type AuthMode = 'sign_in' | 'forgot';

export default function AuthScreen() {
  const {
    user,
    loading,
    continueWithPassword,
    resendConfirmationEmail,
    requestPasswordReset,
    passwordRecoveryPending,
    isConfigured,
    isLocalOnly,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>('sign_in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [resendNotice, setResendNotice] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color={Colors.ink} />
        </View>
      </SafeAreaView>
    );
  }

  if (user && passwordRecoveryPending) {
    return <Redirect href="/reset-password" />;
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  const clearMessages = () => {
    setError(null);
    setResendNotice(null);
    setConfirmationSent(false);
    setResetSent(false);
  };

  const handleContinue = async () => {
    clearMessages();
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
    clearMessages();
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

  const handleForgotPassword = async () => {
    clearMessages();
    if (!email.trim()) {
      setError('enter your email.');
      return;
    }
    setBusy(true);
    const err = await requestPasswordReset(email.trim());
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    setResetSent(true);
  };

  const switchToForgot = () => {
    clearMessages();
    setMode('forgot');
  };

  const switchToSignIn = () => {
    clearMessages();
    setMode('sign_in');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          {mode === 'forgot' ? (
            <>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={switchToSignIn}
                disabled={busy}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="back to sign in"
                activeOpacity={0.7}
              >
                <Svg width={18} height={18} viewBox="0 0 18 18">
                  <Path
                    d="M11.5 3.5L5.5 9l6 5.5"
                    stroke={Colors.ink}
                    strokeWidth={2.25}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </Svg>
              </TouchableOpacity>
              <Text style={styles.title}>forgot password</Text>
              <Text style={styles.subtitle}>
                enter your email and we will send a reset link
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.title}>welcome</Text>
              <Text style={styles.subtitle}>your habit has a heartbeat</Text>
            </>
          )}

          {isLocalOnly ? (
            <Text style={styles.hint}>
              {mode === 'forgot'
                ? 'password reset needs supabase. add expo_public_supabase_* keys.'
                : 'local mode: data stays on this device until you add Supabase keys.'}
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

          {mode === 'sign_in' ? (
            <>
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

              {isConfigured ? (
                <TouchableOpacity
                  style={styles.linkBtn}
                  onPress={switchToForgot}
                  disabled={busy}
                  activeOpacity={0.85}
                >
                  <Text style={styles.linkBtnText}>forgot password?</Text>
                </TouchableOpacity>
              ) : null}
            </>
          ) : null}

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {confirmationSent ? (
            <Text style={styles.success}>
              check your email to confirm your account, then open the link to continue.
            </Text>
          ) : null}
          {resendNotice ? <Text style={styles.success}>{resendNotice}</Text> : null}
          {resetSent ? (
            <Text style={styles.success}>
              reset link sent. check your email and open the link to choose a new password.
            </Text>
          ) : null}

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={mode === 'forgot' ? handleForgotPassword : handleContinue}
            disabled={busy}
            activeOpacity={0.85}
          >
            {busy ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryBtnText}>
                {mode === 'forgot' ? 'send reset link' : 'go'}
              </Text>
            )}
          </TouchableOpacity>

          {mode === 'sign_in' && confirmationSent && isConfigured ? (
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
  backBtn: {
    width: 36,
    height: 36,
    marginBottom: Spacing.md,
    borderWidth: Border.base,
    borderColor: Colors.ink,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
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
  linkBtn: {
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  linkBtnText: {
    fontSize: FontSize.sm,
    fontFamily: Slab.bold,
    color: Colors.ink,
    textDecorationLine: 'underline',
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
