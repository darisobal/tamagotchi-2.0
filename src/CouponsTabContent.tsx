import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckIn } from './types';
import { toDateString } from './logic';
import { Colors, Spacing } from './theme';
import { DesignType } from './design-system/tokens';
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
          <Text style={styles.dayLabel}>{group.dayLabel.toLowerCase()}</Text>
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
    paddingTop: Spacing.sm / 2,
  },
  dayGroup: {
    marginBottom: Spacing.xl / 2,
  },
  dayLabel: {
    ...DesignType.label,
    color: Colors.ink,
    marginTop: Spacing.lg / 2,
    marginBottom: Spacing.lg / 2,
  },
  couponSlot: {
    alignItems: 'center',
    marginBottom: Spacing.lg / 2,
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
    ...DesignType.label,
    color: Colors.ink,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    ...DesignType.supporting,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
