import "./global.css"; // <--- Add this import!
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';

export default function App() {
  return (
    <View className="flex-1 bg-gray-200 items-center justify-center">
      <Text className="text-blue-500 text-2xl font-bold">
        Hello Tailwind!
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}
