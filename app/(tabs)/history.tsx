import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  Modal,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { useAppState } from '../../src/context';
import { CheckIn, DEFAULT_HABIT_NAME } from '../../src/types';
import { toDateString } from '../../src/logic';
import { Colors, Spacing, FontSize, Slab, Radius, Border } from '../../src/theme';
import { useFloatingTabBarExtraPadding } from '../../src/floatingTabBarPadding';
import { useMoodBackground } from '../../src/useMoodBackground';

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

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

export default function HistoryScreen() {
  const { checkIns, deleteCheckInById, prefs } = useAppState();
  const screenBg = useMoodBackground();
  const tabBarExtraPad = useFloatingTabBarExtraPadding();
  const habitName = (prefs.habitName || DEFAULT_HABIT_NAME).trim();
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - Spacing.lg * 2, 400);
  const cellGap = Spacing.xs;
  const innerCalendarW = contentWidth - Spacing.md * 2;
  const cellSize = Math.floor((innerCalendarW - cellGap * 6) / 7);

  const [cursor, setCursor] = useState(() => {
    const n = new Date();
    return { y: n.getFullYear(), m: n.getMonth() };
  });

  const [selectedIso, setSelectedIso] = useState<string | null>(null);

  const { countByDay, itemsByDay, distinctDays } = useMemo(() => {
    const countByDay: Record<string, number> = {};
    const itemsByDay: Record<string, CheckIn[]> = {};
    for (const ci of checkIns) {
      const day = toDateString(new Date(ci.timestamp));
      countByDay[day] = (countByDay[day] || 0) + 1;
      if (!itemsByDay[day]) itemsByDay[day] = [];
      itemsByDay[day].push(ci);
    }
    for (const k of Object.keys(itemsByDay)) {
      itemsByDay[k].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
    }
    return {
      countByDay,
      itemsByDay,
      distinctDays: Object.keys(countByDay).length,
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
    return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
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
    Alert.alert(
      'delete check-in?',
      'this will remove the entry and recalculate your track level.',
      [
        { text: 'cancel', style: 'cancel' },
        {
          text: 'delete',
          style: 'destructive',
          onPress: () => deleteCheckInById(id),
        },
      ],
    );
  };

  const selectedItems = selectedIso ? itemsByDay[selectedIso] ?? [] : [];

  if (checkIns.length === 0) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: screenBg }]}>
        <View style={[styles.empty, { paddingBottom: Spacing.xl + tabBarExtraPad }]}>
          <Text style={styles.emptyIcon}>[ ]</Text>
          <Text style={styles.emptyTitle}>no check-ins yet</Text>
          <Text style={styles.emptySubtitle}>
            complete your first habit to see it here!
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
          <Text style={styles.screenTitle}>history</Text>
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
                const isToday = cell.iso === todayIso;

                return (
                  <TouchableOpacity
                    key={cell.iso}
                    style={[
                      styles.dayCell,
                      {
                        width: cellSize,
                        height: cellSize,
                        backgroundColor: done ? Colors.ink : Colors.card,
                      },
                      isToday && styles.dayCellToday,
                    ]}
                    onPress={() => {
                      if ((countByDay[cell.iso] ?? 0) > 0) setSelectedIso(cell.iso);
                    }}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[styles.dayNum, done ? styles.dayNumOn : styles.dayNumOff]}
                    >
                      {cell.dayOfMonth}
                    </Text>
                  </TouchableOpacity>
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
            <View style={[styles.legendSwatch, styles.legendSwatchEmpty]} />
            <Text style={styles.legendText}>no entry</Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={selectedIso !== null && selectedItems.length > 0}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedIso(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setSelectedIso(null)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{formatModalTitle(selectedIso)}</Text>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setSelectedIso(null)}
                hitSlop={12}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedItems.map((item) => (
                <HistoryItem
                  key={item.id}
                  item={item}
                  habitName={habitName}
                  onDelete={handleDelete}
                />
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function formatModalTitle(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function HistoryItem({
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
        <View style={styles.itemHeader}>
          <Text style={styles.itemTrack}>{habitName}</Text>
          <Text style={styles.itemIntensity}>
            {item.intensity}
            {' +'}
            {item.intensity === 'small' ? 10 : item.intensity === 'medium' ? 20 : 30}
          </Text>
        </View>
        <Text style={styles.itemTime}>{time}</Text>
        {item.note ? <Text style={styles.itemNote}>{item.note}</Text> : null}
      </View>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => onDelete(item.id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.deleteText}>x</Text>
      </TouchableOpacity>
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
    fontSize: FontSize.display,
    fontFamily: Slab.black,
    color: Colors.ink,
    letterSpacing: -1,
    lineHeight: FontSize.display + 4,
  },
  countLabel: {
    fontSize: FontSize.sm,
    fontFamily: Slab.regular,
    color: Colors.textSecondary,
    marginTop: 4,
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
  dayCell: {
    borderRadius: Radius.sm,
    borderWidth: Border.base,
    borderColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellToday: {
    borderWidth: Border.thick,
  },
  dayNum: {
    fontSize: FontSize.sm,
    fontFamily: Slab.bold,
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
  legendSwatchEmpty: { backgroundColor: Colors.card },
  legendText: {
    fontSize: FontSize.sm,
    fontFamily: Slab.regular,
    color: Colors.textSecondary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '80%',
    backgroundColor: Colors.stateTodoBg,
    borderRadius: Radius.lg,
    borderWidth: Border.thick,
    borderColor: Colors.ink,
    padding: Spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  modalTitle: {
    flex: 1,
    fontSize: FontSize.md,
    fontFamily: Slab.black,
    color: Colors.ink,
  },
  modalClose: {
    width: 36,
    height: 36,
    borderWidth: Border.base,
    borderColor: Colors.ink,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
  },
  modalCloseText: {
    fontSize: 18,
    fontFamily: Slab.black,
    color: Colors.ink,
    marginTop: -2,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: Border.thick,
    borderColor: Colors.ink,
    borderRadius: Radius.md,
  },
  itemContent: { flex: 1 },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  itemTrack: {
    fontSize: FontSize.lg,
    fontFamily: Slab.black,
    color: Colors.ink,
  },
  itemIntensity: {
    fontSize: FontSize.sm,
    fontFamily: Slab.bold,
    color: Colors.ink,
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
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
    borderWidth: Border.base,
    borderColor: Colors.ink,
    borderRadius: Radius.sm,
  },
  deleteText: {
    fontSize: 16,
    fontFamily: Slab.black,
    color: Colors.ink,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 36,
    fontFamily: Slab.black,
    marginBottom: Spacing.md,
    color: Colors.ink,
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
