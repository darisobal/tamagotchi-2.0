import { ResponsiveText as Text, useDesignScale } from '../../src/design-system/ResponsiveText';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useAppState } from '../../src/context';
import { CheckIn } from '../../src/types';
import { groupCheckInsByDay, loggedMonths } from '../../src/calendar';
import { useFloatingTabBarExtraPadding } from '../../src/floatingTabBarPadding';
import { Page } from '../../src/design-system/Page';
import { Button } from '../../src/design-system/Controls';
import { CalendarMonth } from '../../src/design-system/CalendarMonth';
import { DesignType, Geometry, Palette } from '../../src/design-system/tokens';
import TrashButton from '../../src/TrashButton';

export default function ProgressScreen() {
  const { checkIns, deleteCheckInById, prefs } = useAppState();
  const bottomPadding = useFloatingTabBarExtraPadding();
  const [cursor, setCursor] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [details, setDetails] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const scale = useDesignScale();
  const months = useMemo(() => loggedMonths(checkIns), [checkIns]);
  useEffect(() => {
    if (months.length && !months.some(item => item.year === cursor.getFullYear() && item.month === cursor.getMonth())) {
      const latest = [...months].sort((a, b) => b.year - a.year || b.month - a.month)[0];
      setCursor(new Date(latest.year, latest.month, 1));
    }
  }, [months, cursor]);
  const days = useMemo(() => groupCheckInsByDay(checkIns), [checkIns]);
  const monthDays = Object.keys(days).filter(date => {
    const parsed = new Date(`${date}T12:00:00`);
    return parsed.getFullYear() === cursor.getFullYear() && parsed.getMonth() === cursor.getMonth();
  }).sort().reverse();
  const remove = async (id: string) => {
    setDeleting(id); setError('');
    try { await deleteCheckInById(id); } catch { setError('Could not delete the check-in. Try again.'); }
    finally { setDeleting(null); }
  };
  const requestDelete = (id: string) => {
    if (deleting) return;
    const message = 'This will remove the entry and recalculate your streak.';
    if (Platform.OS === 'web') { if (window.confirm(`Delete check-in?\n\n${message}`)) void remove(id); }
    else Alert.alert('Delete check-in?', message, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => void remove(id) }]);
  };
  return <Page bottomPadding={bottomPadding + 24}>
      <CalendarMonth year={cursor.getFullYear()} month={cursor.getMonth()} entriesByDay={days} />
      {[...new Set(months.map(item => item.year))].map(year => <View key={year} style={{ gap: 16 * scale, marginTop: 24 * scale }}>
        <Text accessibilityRole="header" style={DesignType.label}>{year === new Date().getFullYear() ? 'This year' : year}</Text>
        <View style={[styles.months, { gap: 12 * scale }]}>
          {months.filter(item => item.year === year).map(item => <Pressable key={item.month} accessibilityRole="button" accessibilityState={{ selected: cursor.getFullYear() === year && cursor.getMonth() === item.month }} accessibilityLabel={new Date(year, item.month).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })} onPress={() => setCursor(new Date(year, item.month, 1))} style={{ borderWidth: 3 * scale, borderColor: Palette.black, borderRadius: 20 * scale, paddingHorizontal: 22 * scale, minHeight: Math.max(44, 58 * scale), justifyContent: 'center' }}>
            <Text style={DesignType.body}>{new Date(year, item.month).toLocaleDateString(undefined, { month: 'long' })}</Text>
          </Pressable>)}
        </View>
      </View>)}
      {checkIns.length === 0 ? <Text style={DesignType.supporting}>No check-ins yet.</Text> : null}
      {error ? <Text accessibilityRole="alert" style={DesignType.supporting}>{error}</Text> : null}
      {monthDays.length > 0 && <Button label={details ? 'Hide check-in details' : 'Check-in details'} appearance="secondary" accessibilityState={{ expanded: details }} onPress={() => setDetails(value => !value)} />}
      {details && monthDays.map(date => <View key={date} style={styles.day}>
        <Text accessibilityRole="header" style={DesignType.label}>{new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Text>
        {days[date].map(item => <LogItem key={item.id} item={item} habitName={prefs.habitName} onDelete={requestDelete} deleting={deleting === item.id} />)}
      </View>)}
  </Page>;
}
function LogItem({ item, habitName, onDelete, deleting }: { item: CheckIn; habitName: string; onDelete: (id: string) => void; deleting: boolean }) {
  return <View style={styles.item}>
    <View style={styles.itemContent}>
      <Text style={DesignType.supporting}>{habitName}</Text>
      {item.isPaidRestart ? <Text style={DesignType.calendar}>Paid restart</Text> : null}
      <Text style={DesignType.calendar}>{item.timestamp && new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      {item.note ? <Text style={DesignType.calendar}>{item.note}</Text> : null}
      {deleting ? <Text accessibilityLiveRegion="polite" style={DesignType.calendar}>Deleting…</Text> : null}
    </View>
    <TrashButton onPress={() => onDelete(item.id)} accessibilityLabel="Delete check-in" size={24} style={styles.delete} />
  </View>;
}
const styles = StyleSheet.create({ months: { flexDirection: 'row', flexWrap: 'wrap' }, day: { gap: 16 }, item: { flexDirection: 'row', gap: 12, padding: 16, backgroundColor: Palette.white, borderWidth: Geometry.border, borderRadius: Geometry.radius }, itemContent: { flex: 1, gap: 8 }, delete: { minWidth: 44, minHeight: 44 } });
