import React, { forwardRef, useId } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, ScrollViewProps, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { Palette, Size } from './tokens';

export function PageBackground() {
  const id = useId().replace(/:/g, '');
  return <View pointerEvents="none" aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={StyleSheet.absoluteFill}><Svg width="100%" height="100%">
    <Defs><LinearGradient id={id} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={Palette['green-start']} /><Stop offset="1" stopColor={Palette['green-end']} /></LinearGradient></Defs>
    <Rect width="100%" height="100%" fill={`url(#${id})`} />
  </Svg></View>;
}
export const Page = forwardRef<ScrollView, ScrollViewProps & { bottomPadding?: number }>(function Page({ children, contentContainerStyle, bottomPadding = 24, ...props }, ref) {
  return <View style={styles.root}>
    <PageBackground />
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView {...props} ref={ref} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
          <PageBackground />
          <View style={[styles.content, { paddingBottom: bottomPadding }, contentContainerStyle]}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  </View>;
});
const styles = StyleSheet.create({ root: { flex: 1 }, scrollContent: { flexGrow: 1 }, content: { width: '100%', maxWidth: Size.page, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 40, gap: 24, flexGrow: 1 } });
