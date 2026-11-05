import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { theme } from '../theme';

export function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

export function Row({ label, hint, children, last }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <View style={styles.rowText}>
        <Text style={styles.label}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      {children}
    </View>
  );
}

export function ToggleRow({ label, hint, value, onChange, last }) {
  return (
    <Row label={label} hint={hint} last={last}>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#3A3F4B', true: theme.accent }}
        thumbColor="#FFFFFF"
        accessibilityLabel={label}
      />
    </Row>
  );
}

export function Segmented({ options, value, onChange }) {
  return (
    <View style={styles.segmented} accessibilityRole="radiogroup">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={[styles.segment, active && styles.segmentActive]}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// Numeric input with - / + buttons. Value is committed (and clamped) when the
// user finishes typing, so partial input like "0." never breaks state.
export function Stepper({ label, hint, value, onChange, min, max, step, decimals = 1, suffix = 's', last }) {
  const fmt = (v) => (decimals ? v.toFixed(decimals) : String(Math.round(v)));
  const [text, setText] = useState(fmt(value));
  useEffect(() => setText(fmt(value)), [value]);

  const clamp = (v) => {
    const f = 10 ** decimals;
    return Math.min(max, Math.max(min, Math.round(v * f) / f));
  };
  const commit = () => {
    const v = parseFloat(text.replace(',', '.'));
    if (Number.isFinite(v)) onChange(clamp(v));
    else setText(fmt(value));
  };

  return (
    <Row label={label} hint={hint} last={last}>
      <View style={styles.stepper}>
        <Pressable
          style={styles.stepBtn}
          onPress={() => onChange(clamp(value - step))}
          accessibilityLabel={`Decrease ${label}`}
        >
          <Text style={styles.stepBtnText}>−</Text>
        </Pressable>
        <TextInput
          style={styles.stepInput}
          value={text}
          onChangeText={setText}
          onEndEditing={commit}
          onBlur={commit}
          keyboardType="decimal-pad"
          returnKeyType="done"
          selectTextOnFocus
          accessibilityLabel={label}
        />
        <Text style={styles.suffix}>{suffix}</Text>
        <Pressable
          style={styles.stepBtn}
          onPress={() => onChange(clamp(value + step))}
          accessibilityLabel={`Increase ${label}`}
        >
          <Text style={styles.stepBtnText}>+</Text>
        </Pressable>
      </View>
    </Row>
  );
}

export function Button({ title, onPress, disabled, variant = 'primary', style }) {
  const secondary = variant === 'secondary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        secondary && styles.buttonSecondary,
        disabled && styles.buttonDisabled,
        pressed && !disabled && { opacity: 0.8 },
        style,
      ]}
    >
      <Text style={[styles.buttonText, secondary && styles.buttonTextSecondary]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 22 },
  sectionTitle: {
    color: theme.muted,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  card: { backgroundColor: theme.card, borderRadius: 16, paddingHorizontal: 14 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, minHeight: 56 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border },
  rowText: { flex: 1, paddingRight: 10 },
  label: { color: theme.text, fontSize: 16, fontWeight: '500' },
  hint: { color: theme.muted, fontSize: 13, marginTop: 2 },
  segmented: {
    flexDirection: 'row',
    backgroundColor: theme.bg,
    borderRadius: 12,
    padding: 3,
    marginVertical: 12,
  },
  segment: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  segmentActive: { backgroundColor: theme.accent },
  segmentText: { color: theme.muted, fontWeight: '600', fontSize: 14 },
  segmentTextActive: { color: '#0B0E14' },
  stepper: { flexDirection: 'row', alignItems: 'center' },
  stepBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: { color: theme.text, fontSize: 22, fontWeight: '600', marginTop: -2 },
  stepInput: {
    color: theme.text,
    fontSize: 17,
    fontWeight: '600',
    minWidth: 52,
    textAlign: 'right',
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  suffix: { color: theme.muted, fontSize: 15, marginLeft: 3, marginRight: 8, minWidth: 12 },
  button: {
    backgroundColor: theme.accent,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonSecondary: { backgroundColor: theme.card },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#0B0E14', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  buttonTextSecondary: { color: theme.text },
});
