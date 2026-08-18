import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useAppState } from '../../src/context';
import { CheckIn, DEFAULT_HABIT_NAME } from '../../src/types';
import { toDateString } from '../../src/logic';
import { Colors, Spacing, FontSize, Slab, Radius, Border, Type } from '../../src/theme';
import { useFloatingTabBarExtraPadding } from '../../src/floatingTabBarPadding';
import { useMoodBackground } from '../../src/useMoodBackground';
import TrashButton from '../../src/TrashButton';
import EmptyFace from '../../src/EmptyFace';

const WEEKDAY_LABELS = ['s', 'm', 't', 'w', 't', 'f', 's'] as const;

type GridCell =
  | { kind: 'empty' }
  | { kind: 'day'; iso: string; dayOfMonth: number };

function buildMonthGrid(year: number, monthIdx: number): GridCell[] {
  const firstDow = new Date(year, monthIdx, 1).getDay();
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const grid: GridCell[] = [];

  for (let i = 0; i < firstDow; i++) grid.push({ kind: 'empty' });

  for (let d = 1; d <= daysInMonth; d++) {
    const iso = toDateString(new Date(year, monthIdx, d));
    grid.push({ kind: 'day', iso, dayOfMonth: d });
  }

  while (grid.length % 7 !== 0) grid.push({ kind: 'empty' });
  return grid;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function formatDayTitle(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).toLowerCase();
}

export default function ProgressScreen() {
  const { checkIns, deleteCheckInById, prefs } = useAppState();
  const screenBg = useMoodBackground();
  const tabBarExtraPad = useFloatingTabBarExtraPadding();
  const habitName = (prefs.habitName || DEFAULT_HABIT_NAME).trim();
  const petColor = prefs.petColor || Colors.pet;
  const petHat = prefs.petHat ?? 'none';
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - Spacing.lg * 2, 400);
  const cellGap = Spacing.xs;
  const innerCalendarW = contentWidth - Spacing.md * 2;
  const cellSize = Math.floor((innerCalendarW - cellGap * 6) / 7);

  const [cursor, setCursor] = useState(() => {
    const n = new Date();
    return { y: n.getFullYear(), m: n.getMonth() };
  });

  const { countByDay, paidByDay, itemsByDay, distinctDays, sortedDays } = useMemo(() => {
    const countByDay: Record<string, number> = {};
    const paidByDay: Record<string, boolean> = {};
    const itemsByDay: Record<string, CheckIn[]> = {};
    for (const ci of checkIns) {
      const day = toDateString(new Date(ci.timestamp));
      countByDay[day] = (countByDay[day] || 0) + 1;
      if (ci.isPaidRestart) paidByDay[day] = true;
      if (!itemsByDay[day]) itemsByDay[day] = [];
      itemsByDay[day].push(ci);
    }
    for (const k of Object.keys(itemsByDay)) {
      itemsByDay[k].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
    }
    const sortedDays = Object.keys(itemsByDay).sort((a, b) => b.localeCompare(a));
    return {
      countByDay,
      paidByDay,
      itemsByDay,
      distinctDays: sortedDays.length,
      sortedDays,
    };
  }, [checkIns]);

  const todayIso = toDateString(new Date());

  const grid = useMemo(
    () => buildMonthGrid(cursor.y, cursor.m),
    [cursor.y, cursor.m],
  );
  const rows = useMemo(() => chunk(grid, 7), [grid]);

  const monthTitle = useMemo(() => {
    const d = new Date(cursor.y, cursor.m, 1);
    return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }).toLowerCase();
  }, [cursor.y, cursor.m]);

  const goPrevMonth = useCallback(() => {
    setCursor((c) => {
      if (c.m === 0) return { y: c.y - 1, m: 11 };
      return { y: c.y, m: c.m - 1 };
    });
  }, []);

  const goNextMonth = useCallback(() => {
    setCursor((c) => {
      if (c.m === 11) return { y: c.y + 1, m: 0 };
      return { y: c.y, m: c.m + 1 };
    });
  }, []);

  const jumpToTodayMonth = useCallback(() => {
    const n = new Date();
    setCursor({ y: n.getFullYear(), m: n.getMonth() });
  }, []);

  const handleDelete = (id: string) => {
    const title = 'delete check-in?';
    const message = 'this will remove the entry and recalculate your track level.';

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`)) {
        void deleteCheckInById(id);
      }
      return;
    }

    Alert.alert(title, message, [
      { text: 'cancel', style: 'cancel' },
      {
        text: 'delete',
        style: 'destructive',
        onPress: () => {
          void deleteCheckInById(id);
        },
      },
    ]);
  };

  if (checkIns.length === 0) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: screenBg }]}>
        <View style={[styles.empty, { paddingBottom: Spacing.xl + tabBarExtraPad }]}>
          <View style={styles.emptyPet}>
            <EmptyFace color={petColor} hat={petHat} />
          </View>
          <Text style={styles.emptyTitle}>no check-ins yet</Text>
          <Text style={styles.emptySubtitle}>
            prove you're not all talk
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: screenBg }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Spacing.xxl + tabBarExtraPad },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBar}>
          <Text style={styles.screenTitle}>progress</Text>
          <Text style={styles.countLabel}>
            {checkIns.length} {checkIns.length === 1 ? 'entry' : 'entries'} · {distinctDays}{' '}
            day{distinctDays === 1 ? '' : 's'}
          </Text>
        </View>

        <View style={styles.monthNav}>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={goPrevMonth}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.navBtnText}>‹</Text>
          </TouchableOpacity>
          <View style={styles.monthTitleWrap}>
            <Text style={styles.monthTitle}>{monthTitle}</Text>
            <TouchableOpacity
              onPress={jumpToTodayMonth}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.todayLink}>today</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={goNextMonth}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.navBtnText}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.calendarCard, { width: contentWidth }]}>
          <View style={[styles.weekdayRow, { gap: cellGap, marginBottom: Spacing.sm }]}>
            {WEEKDAY_LABELS.map((w, i) => (
              <View key={`${w}-${i}`} style={[styles.weekdayCell, { width: cellSize }]}>
                <Text style={styles.weekdayText}>{w}</Text>
              </View>
            ))}
          </View>

          {rows.map((row, ri) => (
            <View key={ri} style={[styles.weekRow, { gap: cellGap }]}>
              {row.map((cell, ci) => {
                if (cell.kind === 'empty') {
                  return (
                    <View
                      key={`e-${ri}-${ci}`}
                      style={[styles.dayCellPlaceholder, { width: cellSize, height: cellSize }]}
                    />
                  );
                }
                const done = (countByDay[cell.iso] ?? 0) > 0;
                const paid = Boolean(paidByDay[cell.iso]);
                const isToday = cell.iso === todayIso;
                // Ring must contrast with both the cell fill AND the calendar
                // card background (Colors.card = white). Default to the blue
                // "pet" color; only switch to ink when the cell itself is blue
                // (paid restart) so the ring stays visible.
                const todayRingColor = paid ? Colors.ink : Colors.pet;
                const innerSize = isToday ? cellSize - 6 : cellSize;

                return (
                  <View
                    key={cell.iso}
                    style={[
                      styles.dayCellSlot,
                      { width: cellSize, height: cellSize },
                      isToday && styles.dayCellTodayWrap,
                      isToday && { borderColor: todayRingColor },
                    ]}
                  >
                    <View
                      style={[
                        styles.dayCell,
                        {
                          width: innerSize,
                          height: innerSize,
                          backgroundColor: paid
                            ? Colors.pet
                            : done
                              ? Colors.ink
                              : Colors.card,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayNum,
                          done || paid ? styles.dayNumOn : styles.dayNumOff,
                          isToday && styles.dayNumToday,
                        ]}
                      >
                        {cell.dayOfMonth}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        <View style={styles.legend}>
          <View style={styles.legendRow}>
            <View style={[styles.legendSwatch, { backgroundColor: Colors.ink }]} />
            <Text style={styles.legendText}>logged</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendSwatch, { backgroundColor: Colors.pet }]} />
            <Text style={styles.legendText}>paid restart</Text>
          </View>
        </View>

        <View style={styles.logSection}>
          {sortedDays.map((iso) => (
            <View key={iso} style={styles.daySection}>
              <Text style={styles.dayTitle}>{formatDayTitle(iso)}</Text>
              {(itemsByDay[iso] ?? []).map((item) => (
                <LogItem
                  key={item.id}
                  item={item}
                  habitName={habitName}
                  onDelete={handleDelete}
                />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function LogItem({
  item,
  habitName,
  onDelete,
}: {
  item: CheckIn;
  habitName: string;
  onDelete: (id: string) => void;
}) {
  const time = new Date(item.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={styles.item}>
      <View style={styles.itemContent}>
        <Text style={styles.itemTrack}>{habitName}</Text>
        {item.isPaidRestart ? (
          <Text style={styles.itemPaid}>paid restart · €1</Text>
        ) : null}
        <Text style={styles.itemTime}>{time}</Text>
        {item.note ? <Text style={styles.itemNote}>{item.note}</Text> : null}
      </View>
      <TrashButton
        onPress={() => onDelete(item.id)}
        accessibilityLabel="delete check-in"
        size={24}
        style={styles.deleteBtn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  headerBar: {
    width: '100%',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  screenTitle: {
    ...Type.screenTitle,
    color: Colors.ink,
  },
  countLabel: {
    ...Type.screenDescription,
    marginBottom: 40,
  },
  monthNav: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    maxWidth: 400,
  },
  navBtn: {
    width: 44,
    height: 44,
    borderWidth: Border.base,
    borderColor: Colors.ink,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
  },
  navBtnText: {
    fontSize: FontSize.xl,
    fontFamily: Slab.black,
    color: Colors.ink,
    marginTop: -2,
  },
  monthTitleWrap: { alignItems: 'center', flex: 1, paddingHorizontal: Spacing.sm },
  monthTitle: {
    fontSize: FontSize.lg,
    fontFamily: Slab.black,
    color: Colors.ink,
    textAlign: 'center',
  },
  todayLink: {
    fontSize: FontSize.xs,
    fontFamily: Slab.regular,
    color: Colors.textMuted,
    marginTop: 2,
    textDecorationLine: 'underline',
  },
  calendarCard: {
    borderWidth: Border.thick,
    borderColor: Colors.ink,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    padding: Spacing.md,
  },
  weekdayRow: {
    flexDirection: 'row',
  },
  weekdayCell: { alignItems: 'center' },
  weekdayText: {
    fontSize: FontSize.xs,
    fontFamily: Slab.regular,
    color: Colors.textMuted,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  dayCellPlaceholder: {},
  dayCellSlot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCell: {
    borderRadius: Radius.sm,
    borderWidth: Border.base,
    borderColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellTodayWrap: {
    borderWidth: Border.thick,
    borderRadius: Radius.sm,
  },
  dayNum: {
    fontSize: FontSize.sm,
    fontFamily: Slab.bold,
  },
  dayNumToday: {
    fontFamily: Slab.black,
  },
  dayNumOn: { color: Colors.card },
  dayNumOff: { color: Colors.ink },
  legend: {
    width: '100%',
    maxWidth: 400,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  legendSwatch: {
    width: 20,
    height: 20,
    borderRadius: Radius.sm,
    borderWidth: Border.base,
    borderColor: Colors.ink,
  },
  legendText: {
    fontSize: FontSize.sm,
    fontFamily: Slab.regular,
    color: Colors.textSecondary,
  },
  logSection: {
    width: '100%',
    maxWidth: 400,
    marginTop: Spacing.xl,
    gap: Spacing.lg,
  },
  daySection: {
    gap: Spacing.sm,
  },
  dayTitle: {
    fontSize: FontSize.md,
    fontFamily: Slab.black,
    color: Colors.ink,
    marginBottom: Spacing.xs,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderWidth: Border.thick,
    borderColor: Colors.ink,
    borderRadius: Radius.md,
  },
  itemContent: { flex: 1 },
  itemTrack: {
    fontSize: FontSize.lg,
    fontFamily: Slab.black,
    color: Colors.ink,
    marginBottom: 2,
  },
  itemPaid: {
    fontSize: FontSize.xs,
    fontFamily: Slab.semiBold,
    color: Colors.pet,
    marginBottom: 2,
  },
  itemTime: {
    fontSize: FontSize.xs,
    fontFamily: Slab.regular,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  itemNote: {
    fontSize: FontSize.sm,
    fontFamily: Slab.regular,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },
  deleteBtn: {
    marginLeft: Spacing.sm,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyPet: {
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontFamily: Slab.black,
    color: Colors.ink,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    fontSize: FontSize.md,
    fontFamily: Slab.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
