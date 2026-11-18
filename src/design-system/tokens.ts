import snapshot from '../../docs/design-system/tokens.json';

/** Published Figma library v0.1.1. Keep the registry as the source of values. */
export const libraryVersion = snapshot.version;
export const Palette = snapshot.primitives;
export const Size = { page: 430, control: 72, compactControl: 60, option: 68, target: 44 };
export const Geometry = { radius: snapshot.dimensions['radius/control'], border: snapshot.dimensions['border/default'], focus: snapshot.dimensions['border/focus'] };
export const Reading = { regular: 'Aleo_400Regular', bold: 'Aleo_700Bold' } as const;
export const DesignType = {
  title: { fontFamily: 'HeptaSlab_700Bold', fontSize: 62, lineHeight: 65 },
  compactTitle: { fontFamily: 'HeptaSlab_700Bold', fontSize: 42, lineHeight: 48 },
  feedback: { fontFamily: 'HeptaSlab_800ExtraBold', fontSize: 42, lineHeight: 48 },
  label: { fontFamily: 'HeptaSlab_700Bold', fontSize: 22, lineHeight: 28 },
  button: { fontFamily: 'HeptaSlab_700Bold', fontSize: 22, lineHeight: 48 },
  body: { fontFamily: Reading.regular, fontSize: 22, lineHeight: 44 },
  supporting: { fontFamily: Reading.bold, fontSize: 22, lineHeight: 28 },
  calendar: { fontFamily: Reading.regular, fontSize: 14, lineHeight: 18 },
} as const;
