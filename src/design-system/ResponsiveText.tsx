import React, { forwardRef } from 'react';
import { StyleSheet, Text as NativeText, TextInput as NativeTextInput, TextProps, TextInputProps, useWindowDimensions } from 'react-native';

import { contentScale, scaledTypography } from './responsiveMetrics';

export function useDesignScale() {
  return contentScale(useWindowDimensions().width);
}

/** Responsive design sizing is separate from the user's accessibility font scaling. */
export const ResponsiveText = forwardRef<NativeText, TextProps & { designMinimumSize?: number }>(function ResponsiveText({ style, designMinimumSize = 16, ...props }, ref) {
  const scale = useDesignScale();
  return <NativeText {...props} ref={ref} style={[style, scaledTypography(StyleSheet.flatten(style), scale, designMinimumSize)]} />;
});
export const ResponsiveTextInput = forwardRef<NativeTextInput, TextInputProps>(function ResponsiveTextInput({ style, ...props }, ref) {
  const scale = useDesignScale();
  return <NativeTextInput {...props} ref={ref} style={[style, scaledTypography(StyleSheet.flatten(style), scale)]} />;
});
