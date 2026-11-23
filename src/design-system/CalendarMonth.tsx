import { FailureRecord, localDay } from '../habitClock';
import { ResponsiveText as Text, useDesignScale } from './ResponsiveText';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { buildMonthGrid, calendarStatus, CalendarStatus } from '../calendar';
import { CheckIn } from '../types';
import { DesignType, Palette } from './tokens';
import { PetStage } from './PetStage';

export function CalendarDay({ day, date, state = 'missing', paid = false, failures, lastColumn = false }: { day: number; date: string; state?: CalendarStatus; failures?: number; paid?: boolean; lastColumn?: boolean }) {
  const scale = useDesignScale();
  const isToday = date === localDay(Date.now());
  const status = state === 'missing' ? 'No check-in recorded' : state === 'future' ? 'Future date' : state === 'double-success' ? 'Multiple check-ins' : state === 'success' ? 'Check-in completed' : `Missed check-in, ${failures === 5 ? 'pet died' : `${failures ?? 1} missing ${!failures || failures === 1 ? 'part' : 'parts'}`}`;
  const dateLabel = new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  return <View accessible accessibilityLabel={`${dateLabel}${isToday ? ', Today' : ''}, ${status}${paid ? ', paid restart' : ''}`} style={[styles.day, { width: (lastColumn ? 58 : 57) * scale, height: 81 * scale, borderWidth: 3 * scale, borderColor: isToday ? Palette.coral : Palette.black, borderRadius: 20 * scale, backgroundColor: state === 'double-success' ? Palette.lavender : state === 'missed' ? Palette.coral : 'transparent' }]}>
    {isToday ? <View pointerEvents="none" style={{ position: 'absolute', left: -3 * scale, right: -3 * scale, top: -3 * scale, bottom: -3 * scale, borderWidth: 5 * scale, borderColor: Palette.coral, borderRadius: 20 * scale, zIndex: 3 }} /> : null}
    <Text designMinimumSize={10} style={[DesignType.calendar, styles.number, { left: 5 * scale, top: 5 * scale }]}>{day}</Text>
    {state === 'success' || state === 'double-success' || state === 'missed' ? <View style={styles.art}><PetStage failures={failures} state={state} width={382 / 7 * scale} compact calendar /></View> : null}
  </View>;
}
export function CalendarMonth({ year, month, entriesByDay, failuresByDay = {} }: { year: number; month: number; entriesByDay: Record<string, CheckIn[]>; failuresByDay?: Record<string, FailureRecord> }) {
  const scale = useDesignScale();
  const today = localDay(Date.now());
  const grid = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const title = new Date(year, month, 1).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  return <View style={styles.calendar}>
    <Text accessibilityRole="header" style={DesignType.title}>{title}</Text>
    <View style={styles.row}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((label, index) => <Text key={index} designMinimumSize={10} style={[DesignType.calendar, styles.weekday, { marginTop: 16 * scale, marginBottom: 15 * scale }]}>{label}</Text>)}</View>
    {Array.from({ length: grid.length / 7 }, (_, row) => <View key={row} style={[styles.row, { zIndex: grid.slice(row * 7, row * 7 + 7).some(cell => cell?.date === today) ? 2 : 0, height: (row === grid.length / 7 - 1 ? 81 : 78) * scale }]}>
      {grid.slice(row * 7, row * 7 + 7).map((cell, index) => <View key={cell?.date ?? `empty-${index}`} style={[styles.cell, { zIndex: cell?.date === today ? 2 : 0, width: (index === 6 ? 58 : 54) * scale }]}>
        {cell ? <CalendarDay lastColumn={index === 6} day={cell.day} date={cell.date} state={calendarStatus(cell.date, entriesByDay[cell.date], undefined, failuresByDay[cell.date])} failures={failuresByDay[cell.date]?.level} paid={entriesByDay[cell.date]?.some(entry => entry.isPaidRestart)} /> : null}
      </View>)}
    </View>)}
  </View>;
}
const styles = StyleSheet.create({
  calendar: { gap: 0 },
  row: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center' },
  // Source cells overlap by their 3 px stroke: 57 × 81 on a 54 × 78 pitch.
  cell: { position: 'relative' },
  day: { position: 'absolute', left: 0, top: 0, borderColor: Palette.black, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  number: { position: 'absolute', zIndex: 1 },
  art: { position: 'absolute', bottom: 0, alignItems: 'center' },
});
