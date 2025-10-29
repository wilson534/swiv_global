import { Tabs } from 'expo-router';
import { Platform, Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="feed" />
      <Tabs.Screen name="match" />
      <Tabs.Screen name="chat" />
      <Tabs.Screen name="growth" />
    </Tabs>
  );
}

// Clean tab bar design - Inspired by WeChat/Twitter
function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const tabs = [
    { name: 'feed', icon: '📊', label: 'Feed' },
    { name: 'match', icon: '💝', label: 'Match' },
    { name: 'chat', icon: '💬', label: 'Chat' },
    { name: 'growth', icon: '🚀', label: 'Growth' },
  ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab, index) => {
        const isFocused = state.index === index;
        const route = state.routes[index];

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={tab.name}
            onPress={onPress}
            style={styles.tabItem}
          >
            <View style={isFocused ? styles.activeTab : styles.inactiveTab}>
              <Text style={isFocused ? styles.activeIcon : styles.inactiveIcon}>
                {tab.icon}
              </Text>
            </View>
            <Text style={isFocused ? styles.activeLabel : styles.inactiveLabel}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    height: Platform.OS === 'ios' ? 95 : 75,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    paddingTop: 12,
    paddingHorizontal: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  inactiveTab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  activeIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  inactiveIcon: {
    fontSize: 20,
    color: '#9CA3AF',
  },
  activeLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#000000',
    marginTop: 4,
  },
  inactiveLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#9CA3AF',
    marginTop: 4,
  },
});
