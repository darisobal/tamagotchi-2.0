import { advanceClock } from '../../src/habitClock';
import { ResponsiveText as Text, useDesignScale } from '../../src/design-system/ResponsiveText';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useAppState } from '../../src/context';
import { groupCheckInsByDay, groupFailuresByDay, loggedMonths } from '../../src/calendar';
import { useFloatingTabBarExtraPadding } from '../../src/floatingTabBarPadding';
import { Page } from '../../src/design-system/Page';
import { CalendarMonth } from '../../src/design-system/CalendarMonth';
import { DesignType, Palette } from '../../src/design-system/tokens';

export default function ProgressScreen() {
  const { checkIns, tracks, now } = useAppState();
  const bottomPadding = useFloatingTabBarExtraPadding();
  const [cursor, setCursor] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const scale = useDesignScale();
  const failures = useMemo(() => tracks[0]?.habitClock ? advanceClock(tracks[0].habitClock, now).history ?? [] : [], [tracks, now]);
  const failureDays = useMemo(() => groupFailuresByDay(failures), [failures]);
  const months = useMemo(() => loggedMonths(checkIns, failures), [checkIns, failures]);
  useEffect(() => {
    if (months.length && !months.some(item => item.year === cursor.getFullYear() && item.month === cursor.getMonth())) {
      const latest = [...months].sort((a, b) => b.year - a.year || b.month - a.month)[0];
      setCursor(new Date(latest.year, latest.month, 1));
    }
  }, [months, cursor]);
  const days = useMemo(() => groupCheckInsByDay(checkIns), [checkIns]);
  return <Page bottomPadding={bottomPadding + 24}>
      <CalendarMonth year={cursor.getFullYear()} month={cursor.getMonth()} entriesByDay={days} failuresByDay={failureDays} />
      {[...new Set(months.map(item => item.year))].map(year => <View key={year} style={{ gap: 16 * scale, marginTop: 24 * scale }}>
        <Text accessibilityRole="header" style={DesignType.label}>{year === new Date().getFullYear() ? 'This year' : year}</Text>
        <View style={[styles.months, { gap: 12 * scale }]}>
          {months.filter(item => item.year === year).map(item => <Pressable key={item.month} accessibilityRole="button" accessibilityState={{ selected: cursor.getFullYear() === year && cursor.getMonth() === item.month }} accessibilityLabel={new Date(year, item.month).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })} onPress={() => setCursor(new Date(year, item.month, 1))} style={{ borderWidth: 3 * scale, borderColor: Palette.black, borderRadius: 20 * scale, paddingHorizontal: 22 * scale, minHeight: Math.max(44, 58 * scale), justifyContent: 'center' }}>
            <Text style={DesignType.body}>{new Date(year, item.month).toLocaleDateString(undefined, { month: 'long' })}</Text>
          </Pressable>)}
        </View>
      </View>)}
      {checkIns.length === 0 && failures.length === 0 ? <Text style={DesignType.supporting}>No check-ins yet.</Text> : null}
  </Page>;
}
const styles = StyleSheet.create({ months: { flexDirection: 'row', flexWrap: 'wrap' } });
