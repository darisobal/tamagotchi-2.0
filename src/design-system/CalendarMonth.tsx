import { ResponsiveText as Text, useDesignScale } from './ResponsiveText';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { buildMonthGrid, calendarStatus, CalendarStatus } from '../calendar';
import { CheckIn } from '../types';
import { DesignType, Palette } from './tokens';
import { PetStage } from './PetStage';

export function CalendarDay({ day, date, state = 'missing', paid = false }: { day: number; date: string; state?: CalendarStatus; paid?: boolean }) {
  const scale = useDesignScale();
  const status = state === 'missing' ? 'No check-in recorded' : state === 'future' ? 'Future date' : state === 'double-success' ? 'Multiple check-ins' : state === 'success' ? 'Check-in completed' : 'Missed check-in';
  const dateLabel = new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  return <View accessible accessibilityLabel={`${dateLabel}, ${status}${paid ? ', paid restart' : ''}`} style={[styles.day, { borderWidth: 3 * scale, borderRadius: 20 * scale, backgroundColor: state === 'double-success' ? Palette.lavender : state === 'missed' ? Palette.coral : 'transparent' }]}>
    <Text style={[DesignType.calendar, styles.number, { left: 6 * scale, top: 5 * scale }]}>{day}</Text>
    {state === 'success' || state === 'double-success' || state === 'missed' ? <View style={styles.art}><PetStage state={state} width={382 / 7 * scale} compact calendar /></View> : null}
  </View>;
}
export function CalendarMonth({ year, month, entriesByDay }: { year: number; month: number; entriesByDay: Record<string, CheckIn[]> }) {
  const grid = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const title = new Date(year, month, 1).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  return <View style={styles.calendar}>
    <Text accessibilityRole="header" style={DesignType.title}>{title}</Text>
    <View style={styles.row}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((label, index) => <Text key={index} style={[DesignType.calendar, styles.weekday]}>{label}</Text>)}</View>
    {Array.from({ length: grid.length / 7 }, (_, row) => <View key={row} style={styles.row}>
      {grid.slice(row * 7, row * 7 + 7).map((cell, index) => <View key={cell?.date ?? `empty-${index}`} style={styles.cell}>
        {cell ? <CalendarDay day={cell.day} date={cell.date} state={calendarStatus(cell.date, entriesByDay[cell.date])} paid={entriesByDay[cell.date]?.some(entry => entry.isPaidRestart)} /> : null}
      </View>)}
    </View>)}
  </View>;
}
const styles = StyleSheet.create({
  calendar: { gap: 0 },
  row: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center', marginTop: 16, marginBottom: 16 },
  cell: { flex: 1, minWidth: 0, aspectRatio: 54 / 78 },
  day: { flex: 1, borderColor: Palette.black, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  number: { position: 'absolute', zIndex: 1 },
  art: { position: 'absolute', bottom: 0, alignItems: 'center' },
});
