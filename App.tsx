import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { MatchesScreen } from './src/screens/MatchesScreen';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2458c6',
    background: '#f4f6fa',
    surface: '#ffffff',
    onSurface: '#192234',
    onSurfaceVariant: '#596579',
    outlineVariant: '#dfe4ed',
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <View style={styles.root}>
          <SafeAreaView style={styles.phone}>
            <MatchesScreen />
          </SafeAreaView>
        </View>
        <StatusBar style="dark" />
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#e6eaf1',
  },
  phone: {
    flex: 1,
    width: '100%',
    maxWidth: 440,
    backgroundColor: theme.colors.background,
  },
});
