import { Redirect, Tabs } from 'expo-router';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, Slab, Border } from '../../src/theme';
import { useMoodBackground } from '../../src/useMoodBackground';
import { useAuth } from '../../src/authContext';
import {
  TAB_BAR_DIVIDER,
  TAB_BAR_INDICATOR,
  TAB_BAR_INDICATOR_GAP,
  TAB_BAR_LABEL_LINE,
  TAB_BAR_TOP_PAD,
} from '../../src/floatingTabBarPadding';

const TAB_INDICATOR_WIDTH = 24;

function BottomTextTabBar(props: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const screenBg = useMoodBackground();
  const { state, descriptors, navigation } = props;

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.root,
        {
          backgroundColor: screenBg,
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}
    >
      <View style={styles.divider} />
      <View style={styles.tabRow}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const { options } = descriptors[route.key];
          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : options.title ?? route.name;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  navigation.dispatch({
                    ...CommonActions.navigate(route),
                    target: state.key,
                  });
                }
              }}
              onLongPress={() =>
                navigation.emit({
                  type: 'tabLongPress',
                  target: route.key,
                })
              }
              style={({ pressed }) => [styles.tabCell, pressed && styles.tabCellPressed]}
            >
              <Text
                style={[styles.tabLabel, !focused && styles.tabLabelInactive]}
                numberOfLines={1}
              >
                {label}
              </Text>
              {focused ? <View style={styles.tabIndicator} /> : <View style={styles.tabIndicatorSpacer} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  divider: {
    height: TAB_BAR_DIVIDER,
    backgroundColor: Colors.ink,
    width: '100%',
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: TAB_BAR_TOP_PAD,
  },
  tabCell: {
    flex: 1,
    alignItems: 'center',
    minHeight: TAB_BAR_LABEL_LINE + TAB_BAR_INDICATOR_GAP + TAB_BAR_INDICATOR,
  },
  tabCellPressed: {
    opacity: 0.75,
  },
  tabLabel: {
    fontSize: FontSize.tab,
    fontFamily: Slab.semiBold,
    color: Colors.ink,
    letterSpacing: 0.2,
    lineHeight: TAB_BAR_LABEL_LINE,
    textAlign: 'center',
  },
  tabLabelInactive: {
    opacity: 0.5,
  },
  tabIndicator: {
    marginTop: TAB_BAR_INDICATOR_GAP,
    width: TAB_INDICATOR_WIDTH,
    height: TAB_BAR_INDICATOR,
    backgroundColor: Colors.ink,
    borderRadius: 0,
  },
  tabIndicatorSpacer: {
    marginTop: TAB_BAR_INDICATOR_GAP,
    height: TAB_BAR_INDICATOR,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg,
  },
});

export default function TabLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/auth" />;
  }

  return (
    <Tabs
      initialRouteName="index"
      tabBar={(props) => <BottomTextTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.ink,
        tabBarInactiveTintColor: Colors.ink,
      }}
    >
      <Tabs.Screen name="settings" options={{ title: 'setup' }} />
      <Tabs.Screen name="index" options={{ title: 'home' }} />
      <Tabs.Screen name="history" options={{ title: 'history' }} />
    </Tabs>
  );
}
