import { ResponsiveText as Text } from './ResponsiveText';
import React, { memo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Artwork, PetArtwork, PetPose } from './Artwork';
import { DoubleSuccessDecor } from './DoubleSuccessMotion';
import { FailurePet } from './FailurePet';
import { IdleMotion } from './IdleMotion';
import { SuccessFlip, SuccessConfetti } from './SuccessMotion';
import { MissedRain, useSceneMotion } from './MissedMotion';
import { PetHair, PetClothes } from '../types';
import { DesignType, Geometry, Palette } from './tokens';

export type PetStageState = PetPose | 'setup';
export const PetStage = memo(function PetStage({ state = 'idle', name, showName = false, color = Palette.coral, width: explicitWidth, compact = false, calendar = false, hair, clothes, failures, timer }: {
  failures?: number; timer?: string; hair?: PetHair; clothes?: PetClothes; state?: PetStageState; name?: string; showName?: boolean; color?: string; width?: number; compact?: boolean; calendar?: boolean;
}) {
  const animate = useSceneMotion((state === 'missed' || state === 'success' || state === 'idle' || state === 'double-success') && !compact && !calendar);
  const [measuredWidth, setWidth] = useState(382);
  const [nameHeight, setNameHeight] = useState(0);
  const width = explicitWidth ?? measuredWidth;
  const scale = width / 382;
  const pose = state === 'setup' ? 'idle' : state;
  const bounded = state !== 'idle';
  const top = ({ setup: 106, idle: 62, success: 82, missed: 62, 'double-success': 143 })[state];
  const left = ({ setup: 114, idle: 116, success: 95, missed: 88.474, 'double-success': 122 })[state];
  const nameOffset = showName && name ? Math.max(0, 32 * scale + nameHeight + 16 * scale - top * scale) : 0;
  // Scale the entire authored 382 × 438 scene uniformly, including every decoration.
  const height = 438 * scale + nameOffset;
  return <View onLayout={e => setWidth(e.nativeEvent.layout.width)} accessible={!compact} accessibilityRole={compact ? undefined : 'image'} accessibilityLabel={compact ? undefined : `${name || 'Your pet'}, ${state.replace('-', ' ')}${failures ? `, ${failures} missing ${failures === 1 ? 'part' : 'parts'}` : ''}${timer ? `, ${timer}` : ''}`}
    style={[styles.stage, { overflow: state === 'idle' ? 'visible' : 'hidden', width: explicitWidth ?? '100%', height, minHeight: height, backgroundColor: calendar ? 'transparent' : state === 'success' || state === 'setup' ? Palette.white : state === 'missed' ? Palette.coral : state === 'double-success' ? Palette.lavender : 'transparent', borderWidth: bounded && !calendar ? Geometry.border * scale : 0, borderRadius: Geometry.radius * scale }]}>
    <View style={{ position: 'absolute', left: -(bounded ? Geometry.border * scale : 0), top: nameOffset - (bounded ? Geometry.border * scale : 0), width: 382, height: 438, transformOrigin: 'top left', transform: [{ scale }] }}>
      {animate && state === 'double-success' ? <DoubleSuccessDecor /> : animate && state === 'success' ? <SuccessConfetti><Artwork asset="0c112" width={382} height={438} /></SuccessConfetti> : animate && state === 'missed' ? <MissedRain><Artwork asset="7a3e3" top={-438} width={382} height={438} /><Artwork asset="7a3e3" width={382} height={438} /></MissedRain> : bounded && state !== 'setup' && <Artwork asset={state === 'success' ? '0c112' : state === 'missed' ? '7a3e3' : 'd0ef1'} width={382} height={438} />}
      {state === 'idle' && <>
        <Artwork asset="f3a85" left={14} top={330.892} width={350.073} />
        <Artwork asset="8517d" left={260.606} top={-12.426} width={104.952} height={90.364} />
      </>}
      <View style={{ position: 'absolute', left, top }}>{state === 'missed' && failures !== undefined ? <FailurePet failures={failures} animate={animate} /> : animate && state === 'success'
        ? <SuccessFlip><PetArtwork hair={hair} clothes={clothes} state={pose} color={color} /></SuccessFlip>
        : animate && state === 'idle' ? <IdleMotion><PetArtwork hair={hair} clothes={clothes} state={pose} color={color} /></IdleMotion>
        : <PetArtwork animate={animate} hair={hair} clothes={clothes} state={pose} color={color} showHat={state !== 'setup'} />}</View>
    </View>
    {timer && state === 'idle' ? <Text style={[DesignType.calendar, { position: 'absolute', top: 350 * scale, alignSelf: 'center', fontSize: 16, lineHeight: 22 }]}>{timer}</Text> : null}
    {showName && name ? <Text onLayout={e => setNameHeight(e.nativeEvent.layout.height)} style={[DesignType.label, styles.name, { top: 32 * scale, left: 24 * scale, right: 24 * scale }]}>{name}</Text> : null}
  </View>;
});
const styles = StyleSheet.create({ stage: { overflow: 'hidden', borderColor: Palette.black, flexShrink: 0 }, name: { position: 'absolute', left: 24, right: 24, textAlign: 'center' } });
