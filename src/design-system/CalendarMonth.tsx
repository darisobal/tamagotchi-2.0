import { ResponsiveText as Text } from './ResponsiveText';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { buildMonthGrid, calendarStatus, CalendarStatus } from '../calendar';
import { CheckIn } from '../types';
import { DesignType, Geometry, Palette } from './tokens';
import { PetStage } from './PetStage';

export function CalendarDay({ day, date, state = 'missing', paid = false }: { day: number; date: string; state?: CalendarStatus; paid?: boolean }) {
  const status = state === 'missing' ? 'No check-in recorded' : state === 'future' ? 'Future date' : state === 'double-success' ? 'Multiple check-ins' : state === 'success' ? 'Check-in completed' : 'Missed check-in';
  const dateLabel = new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
  return <View accessible accessibilityLabel={`${dateLabel}, ${status}${paid ? ', paid restart' : ''}`} style={styles.day}>
    <Text style={DesignType.calendar}>{day}</Text>
    {state === 'success' || state === 'double-success' || state === 'missed' ? <PetStage state={state} width={32} compact /> : null}
  </View>;
}
export function CalendarMonth({ year, month, entriesByDay }: { year: number; month: number; entriesByDay: Record<string, CheckIn[]> }) {
  const grid = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const title = new Date(year, month, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  return <View style={styles.card}>
    <Text accessibilityRole="header" style={DesignType.label}>{title}</Text>
    <View style={styles.row}>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(label => <Text key={label} style={[DesignType.calendar, styles.weekday]}>{label}</Text>)}</View>
    {Array.from({ length: grid.length / 7 }, (_, row) => <View key={row} style={styles.row}>
      {grid.slice(row * 7, row * 7 + 7).map((cell, index) => <View key={cell?.date ?? `empty-${index}`} style={styles.cell}>
        {cell ? <CalendarDay day={cell.day} date={cell.date} state={calendarStatus(cell.date, entriesByDay[cell.date])} paid={entriesByDay[cell.date]?.some(entry => entry.isPaidRestart)} /> : null}
      </View>)}
    </View>)}
  </View>;
}
const styles = StyleSheet.create({
  card: { backgroundColor: Palette.white, borderWidth: Geometry.border, borderColor: Palette.black, borderRadius: Geometry.radius, paddingHorizontal: 16, paddingVertical: 24, gap: 16 },
  row: { flexDirection: 'row' }, weekday: { flex: 1, textAlign: 'center' }, cell: { flex: 1, minWidth: 0, minHeight: 64 }, day: { gap: 4, alignItems: 'center' },
});
