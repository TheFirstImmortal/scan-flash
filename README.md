# Scan Flash

A mobile app that helps soccer players train **scanning**. It flashes colours at set or random intervals, and the player calls out each colour as soon as it appears. Runs on **Android and iOS** (built with Expo / React Native).

## Features

- **Pick your colours**: choose any 2+ colours from the palette.
- **Colour names**: optionally print the colour's name on screen.
- **Interval**: an exact interval (e.g. every 2.0 s) or a random range (e.g. anywhere from 1.0 to 3.0 s).
- **Exercise duration**: total session length, from 5 s up to 60 min.
- **Flash style**:
  - *Hold until next*: the colour stays until the next one appears.
  - *Flash, then blank*: the colour shows for a set time (e.g. 0.5 s), then the screen goes neutral grey.
- **Get-ready countdown** before the first colour.
- **No repeats** option (never the same colour twice in a row).
- **Vibrate** on each colour change (optional).
- **Session summary**: total flashes and a per-colour count.
- Screen stays awake during a session, and settings are remembered between launches.

### Colour-blind support

- **Colour-blind safe palette** (Okabe-Ito), designed to stay distinguishable for red-green (protanopia, deuteranopia) and blue-yellow (tritanopia) colour blindness.
- **Shapes**: every colour has its own symbol (● ■ ▲ ◆ ★ ✚ ✖ ◯ ▬ ⬢), so colours can be told apart without relying on hue.
- **Names**: show the colour's name as text.
- Shapes and text automatically switch between black and white for maximum contrast on each colour.

## Run it on your phone (development)

1. Install [Node.js](https://nodejs.org) (LTS).
2. Install **Expo Go** on your phone (Play Store / App Store).
3. In this folder:
   ```bash
   npm install
   npx expo start
   ```
4. Scan the QR code in the terminal with Expo Go (Android) or the Camera app (iOS). Your phone and computer must be on the same Wi-Fi network. If they aren't, use `npx expo start --tunnel`.

## Build installable apps

Use [EAS Build](https://docs.expo.dev/build/introduction/):

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview   # APK you can install directly
eas build -p ios                         # requires an Apple Developer account
```

## Project structure

```
App.js                      app entry: settings state + screen switching
src/palette.js              colour palettes, shapes, contrast helper
src/settings.js             defaults, persistence, validation
src/screens/SetupScreen.js  settings UI
src/screens/SessionScreen.js the flashing session + summary
src/components/Shape.js     SVG shapes
src/components/Controls.js  switches, steppers, segmented controls, buttons
```
