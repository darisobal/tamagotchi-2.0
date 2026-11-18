import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Palette, Size } from './tokens';

export function ColorOption({ color, label, selected = false, disabled = false, onPress }: { color: string; label: string; selected?: boolean; disabled?: boolean; onPress?: () => void }) {
  const [focused, setFocused] = useState(false);
  return <Pressable accessibilityRole="radio" accessibilityLabel={`${label} pet colour`} accessibilityState={{ checked: selected, disabled }} aria-checked={selected}
    disabled={disabled} onPress={onPress} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={{ width: Size.option, height: Size.option, flexShrink: 0, borderRadius: Size.option / 2, backgroundColor: color, opacity: disabled ? 0.4 : 1, borderColor: Palette.black, borderWidth: focused ? 4 : selected ? 2 : 0, alignItems: 'center', justifyContent: 'center' }}>
    {selected && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: Palette.black }} />}
  </Pressable>;
}
