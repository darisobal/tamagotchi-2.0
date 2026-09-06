import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckIn } from './types';
import { toDateString } from './logic';
import { Colors, FontSize, Slab, Spacing } from './theme';
import PowerCoupon from './PowerCoupon';
import {
  couponRotationForIndex,
  formatCouponDayLabel,
  isCouponEligible,
} from './coupons';

type CouponsTabContentProps = {
  checkIns: CheckIn[];
};

type CouponGroup = {
  dayIso: string;
  dayLabel: string;
  items: CheckIn[];
};

export default function CouponsTabContent({ checkIns }: CouponsTabContentProps) {
  const groups = useMemo(() => {
    const eligible = checkIns.filter(isCouponEligible);
    const byDay: Record<string, CheckIn[]> = {};

    for (const checkIn of eligible) {
      const day = toDateString(new Date(checkIn.timestamp));
      if (!byDay[day]) byDay[day] = [];
      byDay[day].push(checkIn);
    }

    const sortedDays = Object.keys(byDay).sort((a, b) => b.localeCompare(a));

    return sortedDays.map((dayIso): CouponGroup => ({
      dayIso,
      dayLabel: formatCouponDayLabel(dayIso),
      items: byDay[dayIso].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      ),
    }));
  }, [checkIns]);

  if (groups.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>no coupons yet</Text>
        <Text style={styles.emptySubtitle}>log progress to earn your first power coupon</Text>
      </View>
    );
  }

  let rotationIndex = 0;

  return (
    <View style={styles.scroll}>
      {groups.map((group) => (
        <View key={group.dayIso} style={styles.dayGroup}>
          <Text style={styles.dayLabel}>{group.dayLabel}</Text>
          {group.items.map((item) => {
            const rotation = couponRotationForIndex(rotationIndex);
            rotationIndex += 1;
            return (
              <View key={item.id} style={styles.couponSlot}>
                <PowerCoupon rotation={rotation} />
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    width: '100%',
    maxWidth: 400,
    paddingTop: Spacing.sm,
  },
  dayGroup: {
    marginBottom: Spacing.xl,
  },
  dayLabel: {
    fontFamily: Slab.bold,
    fontSize: FontSize.lg + 2,
    lineHeight: FontSize.lg + 28,
    color: Colors.ink,
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  couponSlot: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    overflow: 'visible',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    minHeight: 280,
  },
  emptyTitle: {
    fontFamily: Slab.black,
    fontSize: FontSize.xl,
    color: Colors.ink,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    fontFamily: Slab.regular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
