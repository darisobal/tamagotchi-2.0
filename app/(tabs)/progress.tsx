import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppState } from '../../src/context';
import { CheckIn } from '../../src/types';
import { groupCheckInsByDay } from '../../src/calendar';
import { useFloatingTabBarExtraPadding } from '../../src/floatingTabBarPadding';
import { Page } from '../../src/design-system/Page';
import { Button, MonthChip, ScreenHeader } from '../../src/design-system/Controls';
import { CalendarMonth } from '../../src/design-system/CalendarMonth';
import { DesignType, Geometry, Palette } from '../../src/design-system/tokens';
import CouponsTabContent from '../../src/CouponsTabContent';
import TrashButton from '../../src/TrashButton';

export default function ProgressScreen() {
  const { checkIns, deleteCheckInById, prefs } = useAppState();
  const bottomPadding = useFloatingTabBarExtraPadding();
  const [cursor, setCursor] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [tab, setTab] = useState<'logs' | 'coupons'>('logs');
  const [details, setDetails] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const monthScroll = useRef<ScrollView>(null);
  const [monthWidth, setMonthWidth] = useState(382);
  const [selectedMonthBounds, setSelectedMonthBounds] = useState({ x: 0, width: 0 });
  useEffect(() => {
    monthScroll.current?.scrollTo({ x: Math.max(0, selectedMonthBounds.x - (monthWidth - selectedMonthBounds.width) / 2), animated: false });
  }, [monthWidth, selectedMonthBounds]);
  const days = useMemo(() => groupCheckInsByDay(checkIns), [checkIns]);
  const monthDays = Object.keys(days).filter(date => {
    const parsed = new Date(`${date}T12:00:00`);
    return parsed.getFullYear() === cursor.getFullYear() && parsed.getMonth() === cursor.getMonth();
  }).sort().reverse();
  const remove = async (id: string) => {
    setDeleting(id); setError('');
    try { await deleteCheckInById(id); } catch { setError('could not delete the check-in. try again.'); }
    finally { setDeleting(null); }
  };
  const requestDelete = (id: string) => {
    if (deleting) return;
    const message = 'this will remove the entry and recalculate your streak.';
    if (Platform.OS === 'web') { if (window.confirm(`delete check-in?\n\n${message}`)) void remove(id); }
    else Alert.alert('delete check-in?', message, [{ text: 'cancel', style: 'cancel' }, { text: 'delete', style: 'destructive', onPress: () => void remove(id) }]);
  };
  return <Page bottomPadding={bottomPadding + 24}>
    <ScreenHeader title="your progress" />
    <View style={styles.tabs}>
      <MonthChip label="logs" selected={tab === 'logs'} accessibilityRole="tab" onPress={() => setTab('logs')} style={styles.tab} />
      <MonthChip label="coupons" selected={tab === 'coupons'} accessibilityRole="tab" onPress={() => setTab('coupons')} style={styles.tab} />
    </View>
    {tab === 'coupons' ? <CouponsTabContent checkIns={checkIns} /> : <>
      <ScrollView ref={monthScroll} horizontal onLayout={event => setMonthWidth(event.nativeEvent.layout.width)} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.months}>
        {[-1, 0, 1].map(offset => {
          const date = new Date(cursor.getFullYear(), cursor.getMonth() + offset, 1);
          const month = date.toLocaleDateString(undefined, { month: 'long' }).toLowerCase();
          return <MonthChip key={offset} onLayout={offset === 0 ? event => { const { x, width } = event.nativeEvent.layout; setSelectedMonthBounds(previous => previous.x === x && previous.width === width ? previous : { x, width }); } : undefined} label={month} selected={offset === 0} onPress={() => setCursor(date)} accessibilityLabel={date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }).toLowerCase()} />;
        })}
      </ScrollView>
      {(cursor.getMonth() !== new Date().getMonth() || cursor.getFullYear() !== new Date().getFullYear()) && <Button label="this month" compact appearance="secondary" onPress={() => setCursor(new Date(new Date().getFullYear(), new Date().getMonth(), 1))} />}
      <CalendarMonth year={cursor.getFullYear()} month={cursor.getMonth()} entriesByDay={days} />
      {checkIns.length === 0 ? <Text style={DesignType.supporting}>no check-ins yet.</Text> : null}
      {error ? <Text accessibilityRole="alert" style={DesignType.supporting}>{error}</Text> : null}
      {monthDays.length > 0 && <Button label={details ? 'hide check-in details' : 'check-in details'} appearance="secondary" accessibilityState={{ expanded: details }} onPress={() => setDetails(value => !value)} />}
      {details && monthDays.map(date => <View key={date} style={styles.day}>
        <Text accessibilityRole="header" style={DesignType.label}>{new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toLowerCase()}</Text>
        {days[date].map(item => <LogItem key={item.id} item={item} habitName={prefs.habitName} onDelete={requestDelete} deleting={deleting === item.id} />)}
      </View>)}
    </>}
  </Page>;
}
function LogItem({ item, habitName, onDelete, deleting }: { item: CheckIn; habitName: string; onDelete: (id: string) => void; deleting: boolean }) {
  return <View style={styles.item}>
    <View style={styles.itemContent}>
      <Text style={DesignType.supporting}>{habitName}</Text>
      {item.isPaidRestart ? <Text style={DesignType.calendar}>paid restart</Text> : null}
      <Text style={DesignType.calendar}>{item.timestamp && new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase()}</Text>
      {item.note ? <Text style={DesignType.calendar}>{item.note}</Text> : null}
      {deleting ? <Text accessibilityLiveRegion="polite" style={DesignType.calendar}>deleting…</Text> : null}
    </View>
    <TrashButton onPress={() => onDelete(item.id)} accessibilityLabel="delete check-in" size={24} style={styles.delete} />
  </View>;
}
const styles = StyleSheet.create({ tabs: { flexDirection: 'row', gap: 12 }, tab: { flex: 1, paddingHorizontal: 8 }, months: { gap: 12 }, day: { gap: 16 }, item: { flexDirection: 'row', gap: 12, padding: 16, backgroundColor: Palette.white, borderWidth: Geometry.border, borderRadius: Geometry.radius }, itemContent: { flex: 1, gap: 8 }, delete: { minWidth: 44, minHeight: 44 } });
