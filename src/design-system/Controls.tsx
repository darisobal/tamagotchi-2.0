import React, { forwardRef, useId, useState } from 'react';
import { Platform, Pressable, PressableProps, StyleSheet, Text, TextInput, TextInputProps, View, useWindowDimensions } from 'react-native';
import { DesignType, Geometry, Palette, Size } from './tokens';

export type ButtonState = 'default' | 'hover' | 'pressed' | 'focus' | 'disabled' | 'loading';
type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string; loadingLabel?: string; appearance?: 'primary' | 'secondary'; state?: ButtonState;
  compact?: boolean; style?: PressableProps['style'];
};
export function Button({ label, loadingLabel = 'Saving…', appearance = 'primary', state = 'default', compact = false, disabled, style, ...props }: ButtonProps) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const blocked = disabled || state === 'disabled' || state === 'loading';
  const activeState = (pressed: boolean): ButtonState => blocked ? (state === 'loading' ? 'loading' : 'disabled') : pressed ? 'pressed' : focused ? 'focus' : hovered ? 'hover' : state;
  return <Pressable {...props} accessibilityRole={props.accessibilityRole ?? 'button'}
    disabled={blocked} aria-selected={props.accessibilityRole === 'tab' ? props.accessibilityState?.selected : undefined} aria-checked={props.accessibilityRole === 'radio' ? props.accessibilityState?.checked : undefined} accessibilityState={{ ...props.accessibilityState, disabled: Boolean(blocked), busy: state === 'loading' }}
    onFocus={e => { setFocused(true); props.onFocus?.(e); }} onBlur={e => { setFocused(false); props.onBlur?.(e); }}
    onHoverIn={e => { setHovered(true); props.onHoverIn?.(e); }} onHoverOut={e => { setHovered(false); props.onHoverOut?.(e); }}
    style={press => {
      const current = activeState(press.pressed);
      return [styles.button, compact && styles.compact, { backgroundColor: buttonColor(appearance, current), borderWidth: current === 'focus' ? Geometry.focus : Geometry.border }, typeof style === 'function' ? style(press) : style];
    }}>
    {({ pressed }) => {
      const inverse = appearance === 'primary' && ['default', 'focus', 'loading'].includes(activeState(pressed));
      return <Text style={[compact ? DesignType.label : DesignType.button, styles.buttonText, { color: inverse ? Palette.white : Palette.black }]}>{state === 'loading' ? loadingLabel : label}</Text>;
    }}
  </Pressable>;
}
function buttonColor(appearance: string, state: ButtonState) {
  if (state === 'disabled') return Palette['gray-disabled'];
  if (state === 'pressed') return Palette.coral;
  if (state === 'hover') return Palette.lavender;
  return appearance === 'primary' ? Palette['action-black'] : Palette.white;
}

export interface TextFieldProps extends TextInputProps { label: string; message?: string; error?: string; state?: 'empty' | 'filled' | 'focus' | 'error' | 'disabled'; }
export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField({ label, message, error, state, style, onContentSizeChange, onFocus, onBlur, multiline = true, ...props }, ref) {
  const [focused, setFocused] = useState(false);
  const [height, setHeight] = useState(Size.control);
  const id = useId();
  const errorMessage = error || (state === 'error' ? message : undefined);
  return <View style={styles.field}>
    <Text nativeID={`${id}-label`} style={DesignType.label}>{label}</Text>
    <TextInput {...props} ref={ref} accessibilityLabel={props.accessibilityLabel ?? label}
      aria-labelledby={`${id}-label`} aria-describedby={message || errorMessage ? `${id}-message` : undefined}
      aria-invalid={Boolean(errorMessage)} aria-disabled={state === 'disabled' || props.editable === false} accessibilityState={{ ...props.accessibilityState, disabled: state === 'disabled' || props.editable === false }} editable={state === 'disabled' ? false : props.editable}
      multiline={multiline} scrollEnabled={!multiline} autoCapitalize={props.autoCapitalize ?? 'sentences'} placeholderTextColor={Palette['gray-text']}
      submitBehavior={props.submitBehavior ?? (props.onSubmitEditing ? 'blurAndSubmit' : undefined)}
      blurOnSubmit={props.blurOnSubmit ?? (props.onSubmitEditing ? true : undefined)}
      onFocus={e => { setFocused(true); onFocus?.(e); }} onBlur={e => { setFocused(false); onBlur?.(e); }}
      onContentSizeChange={e => { setHeight(Math.max(Size.control, e.nativeEvent.contentSize.height)); onContentSizeChange?.(e); }}
      style={[styles.input, multiline && { minHeight: height }, (focused || state === 'focus') && styles.focus, (props.editable === false || state === 'disabled') && styles.disabled, style]} />
    {errorMessage || message ? <Text nativeID={`${id}-message`} accessibilityRole={errorMessage ? 'alert' : undefined} style={DesignType.calendar}>{errorMessage || message}</Text> : null}
  </View>;
});

export function ScreenHeader({ title, size }: { title: string; size?: 'regular' | 'compact' }) {
  const { width } = useWindowDimensions();
  return <Text accessibilityRole="header" style={[size === 'compact' || (!size && width < 390) ? DesignType.compactTitle : DesignType.title, styles.wrap]}>{title}</Text>;
}
export function Feedback({ title, goal, showGoal = true, surface = 'plain' }: { title: string; goal?: string; showGoal?: boolean; surface?: 'plain' | 'card' }) {
  return <View style={[styles.feedback, surface === 'card' && styles.card]}>
    <Text style={[DesignType.feedback, styles.wrap]}>{title}</Text>
    {showGoal && goal ? <Text style={[DesignType.supporting, styles.wrap]}>{goal}</Text> : null}
  </View>;
}
export function CheckInActions({ onNegative, onPositive, state = 'ready', negative = 'No', positive = 'Yes' }: { onNegative: () => void; onPositive: () => void; state?: 'ready' | 'submitting'; negative?: string; positive?: string }) {
  return <View style={styles.actions}>
    <Button label={negative} appearance="secondary" disabled={state === 'submitting'} onPress={onNegative} style={styles.action} />
    <Button label={positive} state={state === 'submitting' ? 'loading' : 'default'} onPress={onPositive} style={styles.action} />
  </View>;
}
export function MonthChip({ label, selected = false, ...props }: Omit<ButtonProps, 'appearance' | 'compact'> & { selected?: boolean }) {
  return <Button {...props} label={label} compact appearance={selected ? 'primary' : 'secondary'} aria-pressed={!props.accessibilityRole || props.accessibilityRole === 'button' ? selected : undefined} accessibilityState={{ ...props.accessibilityState, selected }} />;
}
export function SelectionTile({ label = 'None', selected, onPress, disabled }: { label?: string; selected: boolean; onPress?: () => void; disabled?: boolean }) {
  const [focused, setFocused] = useState(false);
  return <Pressable accessibilityRole="radio" accessibilityLabel={label} aria-checked={selected} accessibilityState={{ checked: selected, disabled }}
    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} disabled={disabled} onPress={onPress}
    style={[styles.button, styles.tile, { backgroundColor: disabled ? Palette['gray-disabled'] : selected ? Palette.lavender : Palette.white, borderWidth: focused ? Geometry.focus : Geometry.border }]}>
    <Text style={DesignType.calendar}>{label}</Text>
  </Pressable>;
}

const styles = StyleSheet.create({
  button: { minHeight: Size.control, minWidth: 0, borderWidth: Geometry.border, borderColor: Palette.black, borderRadius: Geometry.radius, paddingHorizontal: 24, paddingVertical: 9, alignItems: 'center', justifyContent: 'center', ...(Platform.OS === 'web' ? { outlineStyle: 'none' } as object : {}) },
  compact: { minHeight: Size.compactControl, paddingVertical: 13 },
  buttonText: { textAlign: 'center', flexShrink: 1, width: '100%' },
  field: { gap: 8, width: '100%' },
  input: { ...DesignType.body, color: Palette.black, borderWidth: Geometry.border, borderColor: Palette.black, borderRadius: Geometry.radius, backgroundColor: Palette.white, minHeight: Size.control, paddingHorizontal: 24, paddingVertical: 11, ...(Platform.OS === 'web' ? { fieldSizing: 'content', overflowWrap: 'anywhere', outlineStyle: 'none' } as object : {}) },
  focus: { borderWidth: Geometry.focus }, disabled: { backgroundColor: Palette['gray-disabled'] },
  wrap: { color: Palette.black, flexShrink: 1, ...(Platform.OS === 'web' ? { overflowWrap: 'anywhere' } as object : {}) },
  feedback: { gap: 16 }, card: { padding: 24, backgroundColor: Palette.white, borderRadius: Geometry.radius, borderWidth: Geometry.border },
  actions: { flexDirection: 'row', gap: 12, alignItems: 'stretch' }, action: { flex: 1, paddingHorizontal: 12 },
  tile: { width: Size.option, minHeight: Size.option, paddingHorizontal: 8 },
});
