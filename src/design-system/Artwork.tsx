import { ResponsiveText as Text } from './ResponsiveText';
import React, { memo, useEffect, useState } from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { artworkAssets, ArtworkAsset } from './artworkAssets';
import { readAsset } from './readAsset';
import { Palette, DesignType } from './tokens';

const cache = new Map<ArtworkAsset, Promise<string>>();
/** Render the unchanged local SVG at its root size; transform its wrapper to fit a design slot. */
export const Artwork = memo(function Artwork({ asset, left = 0, top = 0, width, height, rotation = 0, color }: {
  asset: ArtworkAsset; left?: number; top?: number; width?: number; height?: number; rotation?: number; color?: string;
}) {
  const definition = artworkAssets[asset];
  const [xml, setXml] = useState<string | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    let pending = cache.get(asset);
    if (!pending) { pending = readAsset(definition.source); cache.set(asset, pending); }
    void pending.then(value => { if (active) { setXml(value); setError(false); } }).catch(() => { cache.delete(asset); if (active) setError(true); });
    return () => { active = false; };
  }, [asset, definition.source]);
  const slotW = width ?? definition.width;
  const slotH = height ?? definition.height * (slotW / definition.width);
  // Only the separate body-fill asset is recolored. Original paths and line art stay unchanged.
  const renderedXml = color && xml ? xml.replace(asset === '6dd10' ? /fill="black"/g : /fill="#FF7254"/gi, `fill="${/^#[0-9a-f]{6}$/i.test(color) ? color : Palette.coral}"`) : xml;
  return <View pointerEvents="none" aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: 'absolute', left, top, width: slotW, height: slotH, transform: [{ rotate: `${rotation}deg` }] }}>
    <View style={{ width: definition.width, height: definition.height, transformOrigin: 'top left', transform: [{ scaleX: slotW / definition.width }, { scaleY: slotH / definition.height }] }}>
      {renderedXml ? <SvgXml xml={renderedXml} /> : error ? <Text style={DesignType.calendar}>Artwork unavailable</Text> : null}
    </View>
  </View>;
});

export type PetPose = 'idle' | 'success' | 'missed' | 'double-success';
export const petBounds = {
  idle: { width: 129.542, height: 278.173 }, success: { width: 175.175, height: 264.578 },
  missed: { width: 157.068, height: 267.971 }, 'double-success': { width: 160.175, height: 286.603 },
};

export const PetArtwork = memo(function PetArtwork({ state = 'idle', color = Palette.coral, showHat = true }: { state?: PetPose; color?: string; showHat?: boolean }) {
  const missed = state === 'missed';
  if (state === 'success') return <View style={petBounds.success}>
    <Artwork asset="6dd10" left={41.17} top={37.07} rotation={180} color={color} />
    <Artwork asset="87014" left={28.764} top={34.16} rotation={180} />
    <Artwork asset="9217e" left={81.136} top={235.43} rotation={180} />
    <Artwork asset="7725d" left={55.185} top={238.975} rotation={180} />
    <RotatedLimb asset="42fc0" left={114.25} top={0} boxW={60.926} boxH={61.579} width={41.423} height={45.708} rotation={-141.18} offsetX={-1.181} offsetY={-.457} />
    <RotatedLimb asset="cebc2" left={0} top={21.99} boxW={69.176} boxH={42.588} width={64.923} height={24.123} rotation={162.44} offsetX={0} offsetY={-2.945} />
  </View>;
  if (state === 'double-success') return <View style={petBounds['double-success']}>
    <Artwork asset="6dd10" top={11} color={color} />
    <Artwork asset="88ec3" left={4.454} top={21.853} />
    <Artwork asset="9217e" left={44.917} top={-2.987} />
    <Artwork asset="7725d" left={34.84} top={18.967} />
    <RotatedLimb asset="1ac98" left={6} top={230} boxW={53.925} boxH={56.604} width={41.423} height={45.708} rotation={-18.77} offsetX={-1.181} offsetY={-.457} />
    <RotatedLimb asset="cebc2" left={91} top={200} boxW={69.176} boxH={42.588} width={64.923} height={24.123} rotation={-17.56} offsetX={0} offsetY={-2.945} />
  </View>;
  return <View style={petBounds[state]}>
    <Artwork asset={missed ? '901f3' : '6dd10'} left={missed ? 27.53 : 0} top={11} color={missed ? undefined : color} />
    <Artwork asset={missed ? '8dcbc' : '9953f'} left={missed ? -.305 : 4.454} top={21.853} />
    {showHat && <><Artwork asset={missed ? '33d31' : '9217e'} left={missed ? 72.447 : 44.917} top={-2.987} />
    <Artwork asset={missed ? 'e92e0' : '7725d'} left={missed ? 62.37 : 34.84} top={18.967} /></>}
  </View>;
});
function RotatedLimb({ asset, left, top, boxW, boxH, width, height, rotation, offsetX, offsetY }: {
  asset: ArtworkAsset; left: number; top: number; boxW: number; boxH: number; width: number; height: number; rotation: number; offsetX: number; offsetY: number;
}) {
  return <View style={{ position: 'absolute', left: left + (boxW - width) / 2, top: top + (boxH - height) / 2, width, height, transform: [{ rotate: `${rotation}deg` }] }}>
    <Artwork asset={asset} left={offsetX} top={offsetY} />
  </View>;
}
