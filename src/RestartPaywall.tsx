import { ResponsiveText as Text } from './design-system/ResponsiveText';
import React, { useEffect, useState } from 'react';
import { View, Modal, ActivityIndicator } from 'react-native';
import { Page } from './design-system/Page';
import { Button, ScreenHeader, TextField } from './design-system/Controls';
import { DesignType, Palette } from './design-system/tokens';
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
      setError(result.error ?? 'Store unavailable — use the test card below');
      return;
    }
    setError(result.error ?? 'Purchase failed');
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
    setError(result.error ?? 'Payment failed');
  };

  return <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
    <Page>
      <View style={{ alignItems: 'flex-end' }}><CloseButton onPress={onClose} accessibilityLabel="Close" /></View>
      <ScreenHeader title="Restart?" size="compact" />
      <Text style={DesignType.supporting}>Restart with every part restored.</Text>
      {loading ? <ActivityIndicator accessibilityLabel="Loading price" color={Palette.black} /> : <>
        {useMock && <>
          <Text style={DesignType.calendar}>Test mode — use card {MOCK_TEST_CARD.number}. No charge.</Text>
          <TextField label="Card number" value={cardNumber} onChangeText={setCardNumber} keyboardType="number-pad" editable={!busy} placeholder={MOCK_TEST_CARD.number} />
          <TextField label="Expiry" value={expiry} onChangeText={setExpiry} keyboardType="numbers-and-punctuation" multiline={false} editable={!busy} placeholder={MOCK_TEST_CARD.expiry} />
          <TextField label="CVC" value={cvc} onChangeText={setCvc} keyboardType="number-pad" multiline={false} editable={!busy} placeholder={MOCK_TEST_CARD.cvc} secureTextEntry />
        </>}
        <Button label={`Pay ${displayPrice}`} state={busy ? 'loading' : 'default'} loadingLabel={useMock ? 'Processing…' : 'Waiting for store…'} onPress={useMock ? handleMockPay : handleStorePay} />
      </>}
      {error ? <Text accessibilityRole="alert" style={DesignType.supporting}>{error}</Text> : null}
    </Page>
  </Modal>;
}
