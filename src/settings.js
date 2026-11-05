import AsyncStorage from '@react-native-async-storage/async-storage';
import { PALETTES } from './palette';

const KEY = 'scan-flash/settings/v1';

export const DEFAULT_SETTINGS = {
  palette: 'standard', // 'standard' | 'safe'
  selected: {
    standard: ['red', 'blue', 'green', 'yellow'],
    safe: ['orange', 'skyblue', 'green', 'yellow'],
  },
  showNames: false,
  showShapes: false,

  intervalMode: 'fixed', // 'fixed' | 'random'
  fixedInterval: 2.0, // seconds
  minInterval: 1.0,
  maxInterval: 3.0,

  flashMode: 'hold', // 'hold' = colour stays until the next one; 'flash' = show then blank
  flashLength: 0.5, // seconds the colour is visible in 'flash' mode

  duration: 60, // exercise length, seconds
  countdown: 3, // seconds before the first colour
  avoidRepeats: true,
  vibrate: false,
};

export async function loadSettings() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const saved = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...saved,
      selected: { ...DEFAULT_SETTINGS.selected, ...(saved.selected || {}) },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(s) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // Saving is a convenience; the app works without it.
  }
}

export function activeColors(s) {
  const ids = s.selected[s.palette] || [];
  return PALETTES[s.palette].colors.filter((c) => ids.includes(c.id));
}

// Returns a list of problems that block starting a session (empty = OK).
export function validate(s) {
  const problems = [];
  if (activeColors(s).length < 2) problems.push('Select at least 2 colours.');
  if (s.intervalMode === 'random' && s.minInterval > s.maxInterval)
    problems.push('Minimum interval must not be longer than the maximum.');
  const shortest = s.intervalMode === 'fixed' ? s.fixedInterval : s.minInterval;
  if (s.flashMode === 'flash' && s.flashLength >= shortest)
    problems.push('Flash length must be shorter than the (shortest) interval.');
  if (s.duration < shortest) problems.push('Exercise duration must be longer than the interval.');
  return problems;
}
