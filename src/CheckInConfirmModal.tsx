import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Colors, Spacing, FontSize, Slab, Radius, Border, Type } from './theme';
import CloseButton from './CloseButton';
import ConfirmationFace from './ConfirmationFace';
import { CheckInConfirmCopy } from './checkInConfirmCopy';

/** Scaled down from `Type.screenTitle` so the longest question, face, and CTAs fit without scrolling. */
const CONFIRM_MESSAGE_FONT = 34;
const CONFIRM_FACE_WIDTH = 100;

type Props = {
  visible: boolean;
  copy: CheckInConfirmCopy | null;
  /** Mood-matched app background (same as home). */
  backgroundColor: string;
  /** Pet accent — matches the home character stroke. */
  faceColor?: string;
  /** Existing successful habit-completion path (unchanged). */
  onConfirm: () => void;
  /** Cancel / dismiss without recording a completion. */
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
  backgroundColor,
  faceColor,
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
      <SafeAreaView style={[styles.safe, { backgroundColor }]}>
        <View style={styles.container}>
          <View style={styles.top}>
            <View style={styles.header}>
              <CloseButton onPress={onCancel} accessibilityLabel="close" />
            </View>

            <Text style={styles.message}>{message}</Text>

            <View style={styles.faceWrap}>
              <ConfirmationFace color={faceColor} width={CONFIRM_FACE_WIDTH} />
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={onCancel}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={negativeLabel || 'cancel'}
            >
              <Text style={styles.secondaryBtnText}>{negativeLabel}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={onConfirm}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={positiveLabel || 'confirm'}
            >
              <Text style={styles.primaryBtnText}>{positiveLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  top: {
    flexShrink: 1,
    minHeight: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: Spacing.sm,
  },
  message: {
    ...Type.screenTitle,
    fontSize: CONFIRM_MESSAGE_FONT,
    lineHeight: CONFIRM_MESSAGE_FONT + 4,
    color: Colors.ink,
  },
  faceWrap: {
    marginTop: Spacing.md,
    alignSelf: 'flex-start',
  },
  footer: {
    flexShrink: 0,
    paddingTop: Spacing.lg,
  },
  primaryBtn: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    backgroundColor: Colors.ink,
    borderWidth: Border.thick,
    borderColor: Colors.ink,
    borderRadius: Radius.md,
    marginTop: Spacing.sm,
  },
  primaryBtnText: {
    color: Colors.white,
    fontSize: FontSize.xl,
    fontFamily: Slab.black,
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: Border.thick,
    borderColor: Colors.ink,
    borderRadius: Radius.md,
  },
  secondaryBtnText: {
    fontSize: FontSize.xl,
    fontFamily: Slab.black,
    color: Colors.ink,
    letterSpacing: 0.5,
  },
});
