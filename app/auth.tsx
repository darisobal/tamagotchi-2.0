import React, { useState, useRef } from 'react';
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
  ScrollView,
} from 'react-native';
import { router, Redirect } from 'expo-router';
import { useAuth, AuthMode, isEmailNotConfirmedError } from '../src/authContext';
import { Colors, Spacing, FontSize, Slab, Radius, Border } from '../src/theme';

export default function AuthScreen() {
  const {
    user,
    loading,
    signInWithPassword,
    signUpWithPassword,
    signInWithMagicLink,
    resendConfirmationEmail,
    isConfigured,
    isLocalOnly,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [resendNotice, setResendNotice] = useState<string | null>(null);
  
  const passwordInputRef = useRef<TextInput>(null);

  const isLogin = mode === 'login';

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

  const handleSubmit = async () => {
    setError(null);
    setResendNotice(null);
    setConfirmationSent(false);
    setBusy(true);

    if (isLogin) {
      const err = await signInWithPassword(email.trim(), password);
      setBusy(false);
      if (err) {
        if (isEmailNotConfirmedError(err)) {
          setConfirmationSent(true);
          setError('Confirm your email before logging in.');
          return;
        }
        setError(err);
        return;
      }
      router.replace('/(tabs)');
      return;
    }

    const result = await signUpWithPassword(email.trim(), password);
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
      setError('Enter your email first.');
      return;
    }
    setBusy(true);
    const err = await resendConfirmationEmail(email.trim());
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    setResendNotice('Confirmation email sent again. Check your inbox.');
  };

  const handleMagicLink = async () => {
    setError(null);
    setMagicLinkSent(false);
    if (!email.trim()) {
      setError('Enter your email first.');
      return;
    }
    setBusy(true);
    const err = await signInWithMagicLink(email.trim());
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    setMagicLinkSent(true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>{isLogin ? 'welcome back' : 'create account'}</Text>
          <Text style={styles.subtitle}>
            {isLogin
              ? 'log in to keep your pet and check-ins.'
              : 'sign up once — your habit data follows you.'}
          </Text>

          {isLocalOnly ? (
            <Text style={styles.hint}>
              local mode: data stays on this device until you add Supabase keys.
            </Text>
          ) : null}

          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[styles.modeBtn, isLogin && styles.modeBtnActive]}
              onPress={() => {
                setMode('login');
                setError(null);
                setMagicLinkSent(false);
                setConfirmationSent(false);
                setResendNotice(null);
              }}
            >
              <Text style={[styles.modeText, isLogin && styles.modeTextActive]}>log in</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeBtn, !isLogin && styles.modeBtnActive]}
              onPress={() => {
                setMode('signup');
                setError(null);
                setMagicLinkSent(false);
                setConfirmationSent(false);
                setResendNotice(null);
              }}
            >
              <Text style={[styles.modeText, !isLogin && styles.modeTextActive]}>sign up</Text>
            </TouchableOpacity>
          </View>

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
            returnKeyType="next"
            onSubmitEditing={() => passwordInputRef.current?.focus()}
            blurOnSubmit={false}
          />

          <Text style={styles.label}>password</Text>
          <TextInput
            ref={passwordInputRef}
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder={isLogin ? 'your password' : 'at least 6 characters'}
            placeholderTextColor={Colors.textMuted}
            secureTextEntry
            autoCapitalize="none"
            textContentType={isLogin ? 'password' : 'newPassword'}
            returnKeyType="go"
            onSubmitEditing={handleSubmit}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {confirmationSent ? (
            <Text style={styles.success}>
              check your email to confirm your account before logging in.
            </Text>
          ) : null}
          {resendNotice ? <Text style={styles.success}>{resendNotice}</Text> : null}
          {magicLinkSent ? (
            <Text style={styles.success}>check your email for a sign-in link.</Text>
          ) : null}

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleSubmit}
            disabled={busy}
            activeOpacity={0.85}
          >
            {busy ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryBtnText}>{isLogin ? 'log in' : 'sign up'}</Text>
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

          {isConfigured && !confirmationSent ? (
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={handleMagicLink}
              disabled={busy}
              activeOpacity={0.85}
            >
              <Text style={styles.secondaryBtnText}>email me a link instead</Text>
            </TouchableOpacity>
          ) : null}

          <Text style={styles.footerNote}>
            {isLogin ? "new here? switch to sign up." : 'already have an account? switch to log in.'}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.stateTodoBg },
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: FontSize.display,
    fontFamily: Slab.black,
    color: Colors.ink,
    letterSpacing: -1,
    lineHeight: FontSize.display + 4,
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
  modeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: Border.thick,
    borderColor: Colors.ink,
    borderRadius: Radius.md,
  },
  modeBtnActive: {
    backgroundColor: Colors.ink,
  },
  modeText: {
    fontSize: FontSize.md,
    fontFamily: Slab.black,
    color: Colors.ink,
    textTransform: 'lowercase',
  },
  modeTextActive: {
    color: '#FFFFFF',
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
  footerNote: {
    marginTop: Spacing.lg,
    fontSize: FontSize.sm,
    fontFamily: Slab.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
