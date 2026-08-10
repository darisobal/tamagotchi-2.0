import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Colors, Spacing, FontSize, Slab, Radius, Border } from './theme';
import { CheckInConfirmCopy } from './checkInConfirmCopy';

type Props = {
  visible: boolean;
  copy: CheckInConfirmCopy | null;
  /** Existing successful habit-completion path (unchanged). */
  onConfirm: () => void;
  /** Cancel / dismiss without recording a completion. */
  onCancel: () => void;
};

/**
 * Playful confirmation gate after “i did it”.
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
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onCancel}
          accessibilityLabel="dismiss"
        />
        <View style={styles.card} accessibilityViewIsModal>
          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={onConfirm}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={positiveLabel || 'confirm'}
          >
            <Text style={styles.primaryBtnText}>{positiveLabel}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={onCancel}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={negativeLabel || 'cancel'}
          >
            <Text style={styles.secondaryBtnText}>{negativeLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: Border.thick,
    borderColor: Colors.ink,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  message: {
    fontFamily: Slab.black,
    fontSize: FontSize.xl,
    lineHeight: FontSize.xl + 8,
    letterSpacing: -0.5,
    color: Colors.ink,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  primaryBtn: {
    backgroundColor: Colors.ink,
    borderWidth: Border.thick,
    borderColor: Colors.ink,
    borderRadius: Radius.md,
    minHeight: 56,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontFamily: Slab.semiBold,
    fontSize: FontSize.cta,
    color: Colors.white,
    letterSpacing: 0.2,
    textAlign: 'center',
    lineHeight: FontSize.cta + 3,
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    borderWidth: Border.thick,
    borderColor: Colors.ink,
    borderRadius: Radius.md,
    minHeight: 52,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontFamily: Slab.semiBold,
    fontSize: FontSize.cta,
    color: Colors.ink,
    letterSpacing: 0.2,
    textAlign: 'center',
    lineHeight: FontSize.cta + 3,
  },
});
