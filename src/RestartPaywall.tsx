import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Colors, Spacing, FontSize, Slab, Radius, Border, Type } from './theme';
import CloseButton from './CloseButton';
import {
  MOCK_TEST_CARD,
  RESTART_PRICE_LABEL,
  getRestartStoreAvailability,
  grantPendingPaidRestart,
  purchaseRestartViaMock,
  purchaseRestartViaStore,
} from './purchases';

type Props = {
  visible: boolean;
  onClose: () => void;
  /** Called after entitlement is granted — revive and return to home. */
  onUnlocked: () => void | Promise<void>;
};

/**
 * Full-screen paywall shown when the pet is dead.
 * Production iOS/Android: App Store / Play Billing sheet for the consumable restart.
 * Web / Expo Go: mock card form (test card only) so the flow can be exercised.
 */
export default function RestartPaywall({ visible, onClose, onUnlocked }: Props) {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayPrice, setDisplayPrice] = useState(RESTART_PRICE_LABEL);
  const [useMock, setUseMock] = useState(true);
  const [cardNumber, setCardNumber] = useState<string>(MOCK_TEST_CARD.number);
  const [expiry, setExpiry] = useState<string>(MOCK_TEST_CARD.expiry);
  const [cvc, setCvc] = useState<string>(MOCK_TEST_CARD.cvc);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    setError(null);
    setBusy(false);
    setLoading(true);

    (async () => {
      const avail = await getRestartStoreAvailability();
      if (cancelled) return;
      setDisplayPrice(avail.displayPrice);
      setUseMock(avail.useMockCheckout);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [visible]);

  const finishUnlock = async () => {
    await grantPendingPaidRestart();
    await onUnlocked();
  };

  const handleStorePay = async () => {
    setBusy(true);
    setError(null);
    const result = await purchaseRestartViaStore();
    setBusy(false);

    if (result.ok) {
      await finishUnlock();
      return;
    }
    if (result.cancelled) return;
    if (result.needsMock) {
      setUseMock(true);
      setError(result.error ?? 'store unavailable — use the test card below');
      return;
    }
    setError(result.error ?? 'purchase failed');
  };

  const handleMockPay = async () => {
    setBusy(true);
    setError(null);
    const result = await purchaseRestartViaMock({ cardNumber, expiry, cvc });
    setBusy(false);

    if (result.ok) {
      await finishUnlock();
      return;
    }
    setError(result.error ?? 'payment failed');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.header}>
            <Text style={styles.title}>restart?</Text>
            <CloseButton onPress={onClose} accessibilityLabel="close" />
          </View>

          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.body}>
              motivation grows when you invest in your goals. pay to continue with
              ❤️❤️❤️.
            </Text>

            {loading ? (
              <ActivityIndicator color={Colors.ink} style={{ marginVertical: Spacing.lg }} />
            ) : useMock ? (
              <View style={styles.form}>
                <Text style={styles.label}>card number</Text>
                <TextInput
                  style={styles.input}
                  value={cardNumber}
                  onChangeText={setCardNumber}
                  keyboardType="number-pad"
                  autoComplete="cc-number"
                  placeholder={MOCK_TEST_CARD.number}
                  placeholderTextColor={Colors.textMuted}
                />
                <View style={styles.row}>
                  <View style={styles.half}>
                    <Text style={styles.label}>expiry</Text>
                    <TextInput
                      style={styles.input}
                      value={expiry}
                      onChangeText={setExpiry}
                      keyboardType="numbers-and-punctuation"
                      placeholder={MOCK_TEST_CARD.expiry}
                      placeholderTextColor={Colors.textMuted}
                    />
                  </View>
                  <View style={styles.half}>
                    <Text style={styles.label}>cvc</Text>
                    <TextInput
                      style={styles.input}
                      value={cvc}
                      onChangeText={setCvc}
                      keyboardType="number-pad"
                      placeholder={MOCK_TEST_CARD.cvc}
                      placeholderTextColor={Colors.textMuted}
                      secureTextEntry
                    />
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.payBtn, busy && styles.payBtnDisabled]}
                  onPress={handleMockPay}
                  disabled={busy}
                  activeOpacity={0.85}
                >
                  <Text style={styles.payBtnText}>
                    {busy ? 'processing...' : `pay ${displayPrice}`}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.payBtn, busy && styles.payBtnDisabled]}
                onPress={handleStorePay}
                disabled={busy}
                activeOpacity={0.85}
              >
                <Text style={styles.payBtnText}>
                  {busy ? 'waiting for store...' : `pay ${displayPrice}`}
                </Text>
              </TouchableOpacity>
            )}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            {!loading && useMock ? (
              <Text style={styles.mockHint}>
                test mode — use card {MOCK_TEST_CARD.number}
              </Text>
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.stateTodoBg,
  },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    flexGrow: 1,
  },
  title: {
    ...Type.screenTitle,
    flex: 1,
    color: Colors.ink,
  },
  body: {
    fontFamily: Slab.regular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: FontSize.md + 6,
    marginBottom: Spacing.lg,
  },
  form: {
    gap: Spacing.xs,
  },
  mockHint: {
    fontFamily: Slab.semiBold,
    fontSize: FontSize.sm,
    color: Colors.pet,
    marginTop: 'auto',
    paddingTop: Spacing.xl,
  },
  label: {
    fontFamily: Slab.black,
    fontSize: FontSize.sm,
    color: Colors.ink,
    marginBottom: 4,
    marginTop: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.card,
    borderWidth: Border.base,
    borderColor: Colors.ink,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontFamily: Slab.regular,
    fontSize: FontSize.md,
    color: Colors.ink,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  half: { flex: 1 },
  payBtn: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.ink,
    borderRadius: Radius.md,
    borderWidth: Border.base,
    borderColor: Colors.ink,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  payBtnDisabled: { opacity: 0.6 },
  payBtnText: {
    fontFamily: Slab.semiBold,
    fontSize: FontSize.cta,
    color: Colors.white,
  },
  error: {
    marginTop: Spacing.md,
    fontFamily: Slab.regular,
    fontSize: FontSize.sm,
    color: '#8B0000',
  },
});
