import React, { memo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Artwork, PetArtwork, PetPose, petBounds } from './Artwork';
import { DesignType, Geometry, Palette } from './tokens';

export type PetStageState = PetPose | 'setup';
export const PetStage = memo(function PetStage({ state = 'idle', name, showName = false, color = Palette.coral, width: explicitWidth, compact = false }: {
  state?: PetStageState; name?: string; showName?: boolean; color?: string; width?: number; compact?: boolean;
}) {
  const [measuredWidth, setWidth] = useState(382);
  const width = explicitWidth ?? measuredWidth;
  const scale = Math.min(1, width / 382);
  const pose = state === 'setup' ? 'idle' : state;
  const bounded = !['setup', 'idle'].includes(state);
  const top = ({ setup: 62, idle: 62, success: 82, missed: 62, 'double-success': 143 })[state];
  // On narrow screens, scale artwork uniformly and keep the full panel; calendar miniatures scale the whole scene.
  const height = compact ? 438 * scale : 438;
  return <View onLayout={e => setWidth(e.nativeEvent.layout.width)} accessible={!compact} accessibilityRole={compact ? undefined : 'image'} accessibilityLabel={compact ? undefined : `${name || 'your pet'}, ${state.replace('-', ' ')}`}
    style={[styles.stage, { width: explicitWidth ?? '100%', height: showName ? undefined : height, minHeight: height, backgroundColor: state === 'success' ? Palette.white : state === 'missed' ? Palette.coral : state === 'double-success' ? Palette.lavender : 'transparent', borderWidth: bounded ? Geometry.border * (compact ? scale : 1) : 0, borderRadius: Geometry.radius * (compact ? scale : 1) }]}>
    <View style={{ position: 'absolute', left: -(bounded ? Geometry.border * (compact ? scale : 1) : 0), top: -(bounded ? Geometry.border * (compact ? scale : 1) : 0), width, height }}>
      {bounded && <Artwork asset={state === 'success' ? '0c112' : state === 'missed' ? '7a3e3' : 'd0ef1'} width={width} height={height} />}
      {state === 'idle' && <>
        <Artwork asset="f3a85" left={16 * scale} top={330.892} width={350.073 * scale} />
        <Artwork asset="8517d" left={width - 120 * scale - 1.5 * scale} top={-.426 * scale} width={104.952 * scale} height={90.364 * scale} />
      </>}
      <View style={{ position: 'absolute', left: (width - petBounds[pose].width * scale) / 2, top: compact ? top * scale : top, transformOrigin: 'top left', transform: [{ scale }] }}><PetArtwork state={pose} color={color} /></View>
    </View>
    {showName && name ? <><View style={{ height: 382 }} /><Text style={[DesignType.label, styles.name]}>{name}</Text></> : null}
  </View>;
});
const styles = StyleSheet.create({ stage: { overflow: 'hidden', borderColor: Palette.black, flexShrink: 0 }, name: { marginHorizontal: 24, paddingBottom: 28, textAlign: 'center' } });
