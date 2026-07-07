import { Tabs } from 'expo-router';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, Slab } from '../../src/theme';
import { FLOATING_TAB_BAR_BOTTOM_GAP, FLOATING_TAB_VISUAL_HEIGHT } from '../../src/floatingTabBarPadding';

const FLOAT_HORIZONTAL = 18;
const PANEL_RADIUS = 26;

function FloatingTabBar(props: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, FLOATING_TAB_BAR_BOTTOM_GAP) + 4;
  const { state, descriptors, navigation } = props;

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.floatingRoot,
        {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingBottom: bottomPad,
          paddingHorizontal: FLOAT_HORIZONTAL,
        },
      ]}
    >
      <View style={styles.panel}>
        <View style={[styles.tabRow, { minHeight: FLOATING_TAB_VISUAL_HEIGHT }]}>
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const { options } = descriptors[route.key];
            const label =
              typeof options.tabBarLabel === 'string'
                ? options.tabBarLabel
                : options.title ?? route.name;
            const activeTint = options.tabBarActiveTintColor ?? Colors.ink;
            const inactiveTint = options.tabBarInactiveTintColor ?? '#9A9A9A';

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
                style={({ pressed }) => [
                  styles.tabCell,
                  pressed && styles.tabCellPressed,
                ]}
              >
                <View style={styles.tabLabelWrap}>
                  <Text
                    style={[
                      styles.tabLabel,
                      { color: focused ? activeTint : inactiveTint },
                    ]}
                    numberOfLines={1}
                  >
                    {label}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingRoot: {
    backgroundColor: 'transparent',
    width: '100%',
    zIndex: 10,
  },
  panel: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    backgroundColor: Colors.surface,
    borderRadius: PANEL_RADIUS,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 14,
      },
      android: {
        elevation: 12,
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 14,
      },
    }),
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    width: '100%',
  },
  tabCell: {
    flex: 1,
    alignSelf: 'stretch',
    ...Platform.select({
      web: {
        display: 'flex',
        flexDirection: 'column',
      },
      default: {},
    }),
  },
  tabCellPressed: {
    opacity: 0.75,
  },
  tabLabelWrap: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
  },
  tabLabel: {
    fontSize: FontSize.sm,
    fontFamily: Slab.black,
    letterSpacing: 0.3,
    textTransform: 'lowercase',
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
  },
});

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="index"
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.ink,
        tabBarInactiveTintColor: '#9A9A9A',
      }}
    >
      <Tabs.Screen name="settings" options={{ title: 'setup' }} />
      <Tabs.Screen name="index" options={{ title: 'home' }} />
      <Tabs.Screen name="history" options={{ title: 'history' }} />
    </Tabs>
  );
}
