import React from 'react';
import { View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import { PetHair, PetClothes } from '../types';
import type { PetPose } from './Artwork';

export const HAIR_OPTIONS: { id: PetHair; label: string }[] = [
  { id: 'none', label: 'None' }, { id: 'curls', label: 'Curls' },
  { id: 'spikes', label: 'Spikes' }, { id: 'swoop', label: 'Side swoop' },
];
export const CLOTHES_OPTIONS: { id: PetClothes; label: string }[] = [
  { id: 'none', label: 'None' }, { id: 'tee', label: 'Striped T-shirt' },
  { id: 'vest', label: 'Waistcoat' }, { id: 'scarf', label: 'Scarf' },
];

// Original vector accessories in the upright pet's coordinate space.
// The same paths serve the picker and every pose; no separate thumbnail artwork.
function Hair({ value }: { value: PetHair }) {
  if (value === 'none') return null;
  return <G stroke="#080809" strokeWidth={3.8} strokeLinejoin="round" strokeLinecap="round" fill="#080809">
    {value === 'curls' && <Path d="M12 48 C5 37 13 29 21 30 C14 18 25 10 35 16 C34 3 49 3 54 13 C61 1 75 8 74 17 C85 7 98 15 94 26 C110 22 117 39 106 48 L102 34 C92 38 87 28 80 31 C72 37 63 24 56 29 C47 37 38 25 32 35 C22 31 21 43 12 48 Z" />}
    {value === 'spikes' && <Path d="M12 47 L19 24 L31 28 L33 6 L49 23 L63 0 L68 23 L87 9 L86 30 L106 24 L105 48 C90 34 81 32 66 31 C44 27 25 34 12 47 Z" />}
    {value === 'swoop' && <Path d="M12 51 C7 29 21 15 43 12 C70 6 97 14 109 39 C83 29 68 21 49 29 C41 42 26 49 12 51 Z M18 37 C31 22 48 19 66 20" />}
  </G>;
}
function Clothes({ value }: { value: PetClothes }) {
  if (value === 'none') return null;
  return <G stroke="#080809" strokeWidth={3.4} strokeLinejoin="round" strokeLinecap="round">
    {value === 'tee' && <><Path fill="#FFFFFF" d="M43 117 L32 124 L25 140 L40 147 L46 137 L46 168 Q68 175 91 164 L86 137 L98 145 L109 133 L91 118 L78 115 Q62 134 52 116 Z" /><Path fill="none" d="M49 140 Q66 145 85 138 M48 153 Q68 159 88 151" /></>}
    {value === 'vest' && <><Path fill="#B8ACFF" d="M47 116 L38 127 L44 183 L62 190 L69 180 L82 188 L96 178 L86 122 L78 115 L64 142 Z" /><Path fill="none" d="M64 142 L69 180 M49 161 L58 163 M76 161 L86 158" /><Path d="M68 153 l1 .5 M69 166 l1 .5" /></>}
    {value === 'scarf' && <><Path fill="#FED12E" d="M49 124 L48 164 L61 173 L68 135 L81 155 L91 148 L75 123 Z" /><Path fill="#FED12E" d="M35 113 Q59 126 87 113 L89 126 Q66 140 36 125 Z" /><Path fill="none" d="M52 156 L60 160 M79 144 L85 140 M42 120 Q58 127 76 122" /></>}
  </G>;
}
export function AccessoryIcon({ hair = 'none', clothes = 'none', size = 48 }: { hair?: PetHair; clothes?: PetClothes; size?: number }) {
  return <Svg width={size} height={size} viewBox={hair !== 'none' ? '0 -8 122 72' : '18 105 99 91'} aria-hidden><Hair value={hair} /><Clothes value={clothes} /></Svg>;
}
export function PetAccessories({ hair = 'none', clothes = 'none', state }: { hair?: PetHair; clothes?: PetClothes; state: PetPose }) {
  if (hair === 'none' && clothes === 'none') return null;
  const transform = state === 'success' ? 'translate(160.17 264.58) rotate(180)' : state === 'missed' ? 'translate(27.53 0)' : undefined;
  return <View pointerEvents="none" aria-hidden style={{ position: 'absolute', left: 0, top: 0, width: 180, height: 290 }}><Svg width={180} height={290} viewBox="0 0 180 290"><G transform={transform}><Hair value={hair} /><Clothes value={clothes} /></G></Svg></View>;
}
