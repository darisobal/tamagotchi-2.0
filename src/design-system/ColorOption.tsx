import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { Artwork } from './Artwork';
import { Size } from './tokens';

export function ColorOption({ color, label, selected = false, disabled = false, onPress }: { color: string; label: string; selected?: boolean; disabled?: boolean; onPress?: () => void }) {
  const [focused, setFocused] = useState(false);
  return <Pressable accessibilityRole="radio" accessibilityLabel={`${label} pet colour`} accessibilityState={{ checked: selected, disabled }} aria-checked={selected}
    disabled={disabled} onPress={onPress} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={{ width: Size.option, height: Size.option }}>
    <Artwork asset={disabled ? '5ba24' : focused ? '9b0bb' : selected ? '6e23e' : '4b2ec'} color={color} />
  </Pressable>;
}
