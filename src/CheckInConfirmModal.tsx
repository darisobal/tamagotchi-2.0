import React from 'react';
import { Modal, View } from 'react-native';
import CloseButton from './CloseButton';
import { CheckInConfirmCopy } from './checkInConfirmCopy';
import { Page } from './design-system/Page';
import { Button, ScreenHeader } from './design-system/Controls';

type Props = {
  visible: boolean;
  copy: CheckInConfirmCopy | null;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Full-screen playful confirmation after “i did it” — matches check-in sheet layout.
 * Copy is supplied by the parent when the interaction begins;
 * button actions/positions never swap.
 */
export default function CheckInConfirmModal({
  visible,
  copy,
  onConfirm,
  onCancel,
}: Props) {
  const message = copy?.message ?? '';
  const positiveLabel = copy?.positiveLabel ?? '';
  const negativeLabel = copy?.negativeLabel ?? '';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onCancel}
    >
      <Page bottomPadding={40}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}><CloseButton onPress={onCancel} accessibilityLabel="Close" /></View>
        <ScreenHeader title={message} size="compact" />
        <View style={{ flex: 1 }} />
        <Button label={negativeLabel || 'Cancel'} appearance="secondary" onPress={onCancel} />
        <Button label={positiveLabel || 'Confirm'} onPress={onConfirm} />
      </Page>
    </Modal>
  );
}
