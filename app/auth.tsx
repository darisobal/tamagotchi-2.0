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
  ScrollView,
} from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/authContext';
import { Colors, Spacing, FontSize, Slab, Radius, Border } from '../src/theme';

export default function AuthScreen() {
  const {
    user,
    loading,
    signInWithMagicLink,
    isConfigured,
    isLocalOnly,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

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

  const handleResendLink = async () => {
    setError(null);
    setBusy(true);
    const err = await signInWithMagicLink(email.trim());
    setBusy(false);
    if (err) {
      setError(err);
    }
  };

  const handleBack = () => {
    setMagicLinkSent(false);
    setError(null);
  };

  if (magicLinkSent) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.container, styles.centered]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.checkmarkContainer}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
          
          <Text style={styles.successTitle}>check your email</Text>
          <Text style={styles.successMessage}>
            we sent a sign-in link to{'\n'}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleResendLink}
            disabled={busy}
            activeOpacity={0.85}
          >
            {busy ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryBtnText}>send me one more link</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={handleBack}
            disabled={busy}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryBtnText}>← back to change email</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.title}>welcome back</Text>
          <Text style={styles.subtitle}>
            log in to keep your pet and check-ins.
          </Text>

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
            returnKeyType="go"
            onSubmitEditing={handleMagicLink}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleMagicLink}
            disabled={busy}
            activeOpacity={0.85}
          >
            {busy ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryBtnText}>email me a link</Text>
            )}
          </TouchableOpacity>
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
  checkmarkContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  checkmark: {
    fontSize: 72,
    color: '#FFFFFF',
    fontFamily: Slab.black,
  },
  successTitle: {
    fontSize: FontSize.display,
    fontFamily: Slab.black,
    color: Colors.ink,
    letterSpacing: -1,
    lineHeight: FontSize.display + 4,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: FontSize.lg,
    fontFamily: Slab.bold,
    color: Colors.ink,
    marginBottom: Spacing.xl,
    textAlign: 'center',
    lineHeight: FontSize.lg + 8,
  },
  emailHighlight: {
    color: Colors.ink,
    fontFamily: Slab.black,
  },
  secondaryBtn: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: Border.thick,
    borderColor: Colors.ink,
    borderRadius: Radius.md,
    minHeight: 56,
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: Colors.ink,
    fontSize: FontSize.lg,
    fontFamily: Slab.bold,
  },
});
