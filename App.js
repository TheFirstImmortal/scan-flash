import { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SetupScreen from './src/screens/SetupScreen';
import SessionScreen from './src/screens/SessionScreen';
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from './src/settings';

export default function App() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [screen, setScreen] = useState('setup'); // 'setup' | 'session'

  useEffect(() => {
    loadSettings().then(setSettings);
  }, []);

  const update = useCallback((next) => {
    setSettings(next);
    saveSettings(next);
  }, []);

  const exit = useCallback(() => setScreen('setup'), []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {screen === 'setup' ? (
        <SetupScreen settings={settings} onChange={update} onStart={() => setScreen('session')} />
      ) : (
        <SessionScreen settings={settings} onExit={exit} />
      )}
    </SafeAreaProvider>
  );
}
