import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Section, Segmented, Stepper, ToggleRow } from '../components/Controls';
import Shape from '../components/Shape';
import { PALETTES, contrastOn } from '../palette';
import { validate } from '../settings';
import { theme } from '../theme';

const fmtDuration = (sec) => {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return m ? `${m} min${s ? ` ${s} s` : ''}` : `${s} s`;
};

export default function SetupScreen({ settings, onChange, onStart }) {
  const s = settings;
  const set = (patch) => onChange({ ...s, ...patch });
  const palette = PALETTES[s.palette];
  const selected = s.selected[s.palette] || [];
  const problems = validate(s);

  const toggleColor = (id) => {
    const next = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id];
    set({ selected: { ...s.selected, [s.palette]: next } });
  };
  const setAll = (all) =>
    set({ selected: { ...s.selected, [s.palette]: all ? palette.colors.map((c) => c.id) : [] } });

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Scan Flash</Text>
        <Text style={styles.subtitle}>Train your scanning: call the colour as soon as it flashes.</Text>

        <Section title="Colours">
          <Segmented
            value={s.palette}
            onChange={(v) => set({ palette: v })}
            options={[
              { value: 'standard', label: 'Standard' },
              { value: 'safe', label: 'Colour-blind safe' },
            ]}
          />
          {s.palette === 'safe' ? (
            <Text style={styles.note}>
              Okabe-Ito palette: stays distinguishable for red-green and blue-yellow colour blindness.
            </Text>
          ) : null}
          <View style={styles.grid}>
            {palette.colors.map((c) => {
              const on = selected.includes(c.id);
              return (
                <Pressable
                  key={c.id}
                  onPress={() => toggleColor(c.id)}
                  style={styles.chipWrap}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on }}
                  accessibilityLabel={c.name}
                >
                  <View
                    style={[
                      styles.chip,
                      { backgroundColor: c.hex },
                      on ? styles.chipOn : styles.chipOff,
                    ]}
                  >
                    <Shape shape={c.shape} size={26} color={contrastOn(c.hex)} />
                    {on ? (
                      <View style={styles.check}>
                        <Text style={styles.checkText}>✓</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={[styles.chipLabel, on && { color: theme.text }]}>{c.name}</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.allRow}>
            <Text style={styles.link} onPress={() => setAll(true)}>
              Select all
            </Text>
            <Text style={styles.link} onPress={() => setAll(false)}>
              Clear
            </Text>
            <Text style={styles.count}>{selected.length} selected</Text>
          </View>
        </Section>

        <Section title="Display">
          <ToggleRow
            label="Show colour names"
            hint="Print the name on screen with each colour"
            value={s.showNames}
            onChange={(v) => set({ showNames: v })}
          />
          <ToggleRow
            label="Show shapes"
            hint="Each colour has its own symbol. Helps with colour blindness"
            value={s.showShapes}
            onChange={(v) => set({ showShapes: v })}
          />
          <View style={styles.inlineBlock}>
            <Text style={styles.blockLabel}>Flash style</Text>
            <Segmented
              value={s.flashMode}
              onChange={(v) => set({ flashMode: v })}
              options={[
                { value: 'hold', label: 'Hold until next' },
                { value: 'flash', label: 'Flash, then blank' },
              ]}
            />
          </View>
          {s.flashMode === 'flash' ? (
            <Stepper
              label="Flash length"
              hint="How long each colour stays visible"
              value={s.flashLength}
              onChange={(v) => set({ flashLength: v })}
              min={0.1}
              max={10}
              step={0.1}
              last
            />
          ) : null}
        </Section>

        <Section title="Timing">
          <View style={styles.inlineBlock}>
            <Text style={styles.blockLabel}>Interval between colours</Text>
            <Segmented
              value={s.intervalMode}
              onChange={(v) => set({ intervalMode: v })}
              options={[
                { value: 'fixed', label: 'Exact' },
                { value: 'random', label: 'Random range' },
              ]}
            />
          </View>
          {s.intervalMode === 'fixed' ? (
            <Stepper
              label="Interval"
              value={s.fixedInterval}
              onChange={(v) => set({ fixedInterval: v })}
              min={0.3}
              max={60}
              step={0.1}
            />
          ) : (
            <>
              <Stepper
                label="Shortest"
                value={s.minInterval}
                onChange={(v) => set({ minInterval: v })}
                min={0.3}
                max={60}
                step={0.1}
              />
              <Stepper
                label="Longest"
                value={s.maxInterval}
                onChange={(v) => set({ maxInterval: v })}
                min={0.3}
                max={60}
                step={0.1}
              />
            </>
          )}
          <Stepper
            label="Exercise duration"
            hint={fmtDuration(s.duration)}
            value={s.duration}
            onChange={(v) => set({ duration: v })}
            min={5}
            max={3600}
            step={15}
            decimals={0}
          />
          <Stepper
            label="Get-ready countdown"
            value={s.countdown}
            onChange={(v) => set({ countdown: v })}
            min={0}
            max={30}
            step={1}
            decimals={0}
            last
          />
        </Section>

        <Section title="Options">
          <ToggleRow
            label="No same colour twice in a row"
            value={s.avoidRepeats}
            onChange={(v) => set({ avoidRepeats: v })}
          />
          <ToggleRow
            label="Vibrate on each colour"
            hint="Phone buzzes when the colour changes"
            value={s.vibrate}
            onChange={(v) => set({ vibrate: v })}
            last
          />
        </Section>

        {problems.length ? (
          <View style={styles.problems}>
            {problems.map((p) => (
              <Text key={p} style={styles.problemText}>
                • {p}
              </Text>
            ))}
          </View>
        ) : null}
        <Button title="START" onPress={onStart} disabled={problems.length > 0} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  content: { padding: 18, paddingBottom: 48 },
  title: { color: theme.text, fontSize: 34, fontWeight: '900', letterSpacing: -0.5, marginTop: 8 },
  subtitle: { color: theme.muted, fontSize: 15, marginTop: 4, marginBottom: 24 },
  note: { color: theme.muted, fontSize: 13, marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  chipWrap: { width: '20%', alignItems: 'center', paddingVertical: 6 },
  chip: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOn: { borderWidth: 3, borderColor: theme.accent },
  chipOff: { borderWidth: 1, borderColor: theme.border, opacity: 0.45 },
  check: {
    position: 'absolute',
    top: -7,
    right: -7,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { color: '#0B0E14', fontSize: 12, fontWeight: '900' },
  chipLabel: { color: theme.muted, fontSize: 11, marginTop: 5, textAlign: 'center' },
  allRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 18 },
  link: { color: theme.accent, fontWeight: '600', fontSize: 14 },
  count: { color: theme.muted, fontSize: 13, marginLeft: 'auto' },
  inlineBlock: {
    paddingTop: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.border,
  },
  blockLabel: { color: theme.text, fontSize: 16, fontWeight: '500' },
  problems: {
    backgroundColor: '#2A1416',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  problemText: { color: theme.danger, fontSize: 14, marginVertical: 2 },
});
