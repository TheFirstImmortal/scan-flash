import { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, useWindowDimensions, Vibration, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useKeepAwake } from 'expo-keep-awake';
import { SafeAreaView } from 'react-native-safe-area-context';
import Shape from '../components/Shape';
import { Button } from '../components/Controls';
import { BLANK_HEX, contrastOn } from '../palette';
import { activeColors } from '../settings';
import { theme } from '../theme';

const REPEAT_BLINK_MS = 120; // blank gap so a repeated colour is visibly a new flash

function pickColor(colors, prevId, avoidRepeats) {
  const pool = avoidRepeats && prevId ? colors.filter((c) => c.id !== prevId) : colors;
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function SessionScreen({ settings: s, onExit }) {
  useKeepAwake();
  const { width, height } = useWindowDimensions();
  const colors = useRef(activeColors(s)).current;

  const [runId, setRunId] = useState(0); // bump to restart
  const [phase, setPhase] = useState(s.countdown > 0 ? 'countdown' : 'running');
  const [count, setCount] = useState(s.countdown);
  const [current, setCurrent] = useState(null); // colour object, or null = blank
  const [remaining, setRemaining] = useState(s.duration);
  const [stats, setStats] = useState({ total: 0, byId: {} });

  const timers = useRef([]);
  const tick = useRef(null);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, Math.max(0, ms)));
  const clearAll = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (tick.current) clearInterval(tick.current);
    tick.current = null;
  };

  const run = useCallback(() => {
    clearAll();
    setStats({ total: 0, byId: {} });
    setCurrent(null);
    setRemaining(s.duration);

    let prevId = null;
    let endAt = 0;

    const nextInterval = () =>
      (s.intervalMode === 'fixed'
        ? s.fixedInterval
        : s.minInterval + Math.random() * (s.maxInterval - s.minInterval)) * 1000;

    const show = (color) => {
      setCurrent(color);
      if (s.vibrate) Vibration.vibrate(40);
      setStats((st) => ({
        total: st.total + 1,
        byId: { ...st.byId, [color.id]: (st.byId[color.id] || 0) + 1 },
      }));
    };

    const finish = () => {
      clearAll();
      setCurrent(null);
      setRemaining(0);
      setPhase('done');
      if (s.vibrate) Vibration.vibrate([0, 200, 100, 200]);
    };

    // Each step is scheduled against an absolute timestamp so timer drift
    // never accumulates over a long session.
    const step = (at) => {
      const color = pickColor(colors, prevId, s.avoidRepeats);
      const repeat = color.id === prevId;
      prevId = color.id;
      const interval = nextInterval();

      if (repeat && s.flashMode === 'hold') {
        setCurrent(null);
        later(() => show(color), REPEAT_BLINK_MS);
      } else {
        show(color);
      }
      if (s.flashMode === 'flash') {
        later(() => setCurrent(null), at + s.flashLength * 1000 - Date.now());
      }

      const nextAt = at + interval;
      if (nextAt >= endAt) later(finish, endAt - Date.now());
      else later(() => step(nextAt), nextAt - Date.now());
    };

    const begin = () => {
      setPhase('running');
      const start = Date.now();
      endAt = start + s.duration * 1000;
      step(start);
    };

    // Countdown, then go.
    if (s.countdown > 0) {
      setPhase('countdown');
      const t0 = Date.now();
      for (let i = 0; i < s.countdown; i++) {
        later(() => setCount(s.countdown - i), t0 + i * 1000 - Date.now());
      }
      later(begin, t0 + s.countdown * 1000 - Date.now());
    } else {
      begin();
    }

    // Remaining-time readout.
    tick.current = setInterval(() => {
      if (endAt) setRemaining(Math.max(0, Math.ceil((endAt - Date.now()) / 1000)));
    }, 250);
  }, [s, colors]);

  useEffect(() => {
    run();
    return clearAll;
  }, [run, runId]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onExit();
      return true;
    });
    return () => sub.remove();
  }, [onExit]);

  const bg = phase === 'running' ? (current ? current.hex : BLANK_HEX) : theme.bg;
  const fg = contrastOn(bg);
  const mm = Math.floor(remaining / 60);
  const ss = String(remaining % 60).padStart(2, '0');
  const shapeSize = Math.min(width, height) * 0.55;

  if (phase === 'done') {
    return (
      <SafeAreaView style={[styles.fill, { backgroundColor: theme.bg }]}>
        <StatusBar style="light" />
        <View style={styles.done}>
          <Text style={styles.doneTitle}>Session complete</Text>
          <Text style={styles.doneTotal}>{stats.total}</Text>
          <Text style={styles.doneSub}>colours flashed</Text>
          <View style={styles.breakdown}>
            {colors.map((c) => (
              <View key={c.id} style={styles.breakRow}>
                <View style={[styles.swatch, { backgroundColor: c.hex }]}>
                  <Shape shape={c.shape} size={18} color={contrastOn(c.hex)} />
                </View>
                <Text style={styles.breakName}>{c.name}</Text>
                <Text style={styles.breakCount}>{stats.byId[c.id] || 0}</Text>
              </View>
            ))}
          </View>
          <Button title="GO AGAIN" onPress={() => setRunId((n) => n + 1)} style={{ alignSelf: 'stretch' }} />
          <Button
            title="Back to settings"
            variant="secondary"
            onPress={onExit}
            style={{ alignSelf: 'stretch', marginTop: 12 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.fill, { backgroundColor: bg }]}>
      <StatusBar hidden />
      <SafeAreaView style={styles.fill}>
        <View style={styles.topBar}>
          <View style={[styles.pill, { borderColor: fg }]}>
            <Text style={[styles.pillText, { color: fg }]}>
              {mm}:{ss}
            </Text>
          </View>
          <Pressable
            onPress={onExit}
            hitSlop={16}
            style={[styles.pill, { borderColor: fg }]}
            accessibilityRole="button"
            accessibilityLabel="Stop session"
          >
            <Text style={[styles.pillText, { color: fg }]}>✕ Stop</Text>
          </Pressable>
        </View>

        <View style={styles.center} accessibilityLiveRegion="assertive">
          {phase === 'countdown' ? (
            <>
              <Text style={styles.getReady}>Get ready</Text>
              <Text style={styles.countNum}>{count}</Text>
            </>
          ) : current ? (
            <>
              {s.showShapes ? <Shape shape={current.shape} size={shapeSize} color={fg} /> : null}
              {s.showNames ? (
                <Text
                  style={[styles.name, { color: fg, fontSize: Math.min(width, height) * 0.16 }]}
                  adjustsFontSizeToFit
                  numberOfLines={1}
                >
                  {current.name.toUpperCase()}
                </Text>
              ) : null}
            </>
          ) : null}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  pill: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    opacity: 0.7,
  },
  pillText: { fontSize: 16, fontWeight: '700', fontVariant: ['tabular-nums'] },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  getReady: { color: theme.muted, fontSize: 22, fontWeight: '600' },
  countNum: { color: theme.text, fontSize: 160, fontWeight: '900' },
  name: { fontWeight: '900', letterSpacing: 2, marginTop: 16 },
  done: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  doneTitle: { color: theme.muted, fontSize: 18, fontWeight: '600' },
  doneTotal: { color: theme.text, fontSize: 96, fontWeight: '900' },
  doneSub: { color: theme.muted, fontSize: 16, marginTop: -8, marginBottom: 24 },
  breakdown: {
    alignSelf: 'stretch',
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 12,
    marginBottom: 24,
  },
  breakRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  swatch: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  breakName: { color: theme.text, fontSize: 16, marginLeft: 12, flex: 1 },
  breakCount: { color: theme.text, fontSize: 18, fontWeight: '700', fontVariant: ['tabular-nums'] },
});
