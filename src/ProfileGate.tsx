import React, { useState } from 'react';
import { Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Type, Slab, FontSize, Border, Radius } from './theme';

export default function ProfileGate({ error, hasChoice, onAccount, onGuest, onRetry, offlineConflict, onLocal }: {
  error: string | null; hasChoice: boolean; offlineConflict: boolean; onLocal: () => Promise<void>;
  onAccount: () => Promise<void>; onGuest: () => Promise<void>; onRetry: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const run = async (action: () => Promise<void>) => { setBusy(true); try { await action(); } finally { setBusy(false); } };
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}>
    <Text style={Type.screenTitle}>{hasChoice ? 'two plans. your choice.' : 'progress is safe.'}</Text>
    <Text style={Type.screenDescription}>{error ?? (offlineConflict ? 'this device has changes that have not reached your account. choose which progress to keep.' : 'this account already has progress. your guest plan will stay separately on this device.')}</Text>
    {hasChoice && !error && <>
      <Text style={styles.body}>{offlineConflict ? 'using this device’s account progress will replace the cloud snapshot. using the cloud keeps a local backup of the device snapshot.' : 'use the account’s saved plan, or log out to keep using your guest plan. we won’t combine habits or replace the account with your guest progress.'}</Text>
      <Pressable accessibilityRole="button" disabled={busy} style={styles.button} onPress={() => void run(onAccount)}><Text style={styles.primary}>use account progress</Text></Pressable>
    </>}
    {offlineConflict && <Pressable accessibilityRole="button" disabled={busy} style={styles.button} onPress={() => void run(onLocal)}><Text style={styles.primary}>use device progress and replace cloud</Text></Pressable>}
    {error && <Pressable accessibilityRole="button" style={styles.button} onPress={onRetry}><Text style={styles.primary}>try again</Text></Pressable>}
    <Pressable accessibilityRole="button" disabled={busy} style={styles.button} onPress={() => void run(onGuest)}><Text style={styles.primary}>back to sign in</Text></Pressable>
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.lg, gap: Spacing.lg, width: '100%', maxWidth: 680, alignSelf: 'center' },
  body: { fontFamily: Slab.regular, fontSize: FontSize.md },
  button: { padding: Spacing.md, minHeight: 56, backgroundColor: Colors.ink, borderRadius: Radius.md, borderWidth: Border.thick },
  primary: { color: Colors.white, fontFamily: Slab.bold, fontSize: FontSize.lg, textAlign: 'center' },
});
