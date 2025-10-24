import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="feed" />
      <Tabs.Screen name="match" />
      <Tabs.Screen name="chat" />
      <Tabs.Screen name="growth" />
    </Tabs>
  );
}
