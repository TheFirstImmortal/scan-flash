// Two palettes. Every colour carries a unique shape so a player who cannot
// separate two hues can still tell them apart by the symbol (or the name).
//
// "safe" uses the Okabe-Ito palette, designed to stay distinguishable for the
// common forms of colour blindness (protanopia, deuteranopia, tritanopia).

export const PALETTES = {
  standard: {
    label: 'Standard',
    colors: [
      { id: 'red', name: 'Red', hex: '#E53935', shape: 'circle' },
      { id: 'blue', name: 'Blue', hex: '#1E5BE6', shape: 'square' },
      { id: 'green', name: 'Green', hex: '#2E9E3F', shape: 'triangle' },
      { id: 'yellow', name: 'Yellow', hex: '#FDD835', shape: 'diamond' },
      { id: 'orange', name: 'Orange', hex: '#FB8C00', shape: 'star' },
      { id: 'purple', name: 'Purple', hex: '#8E24AA', shape: 'plus' },
      { id: 'pink', name: 'Pink', hex: '#F06292', shape: 'cross' },
      { id: 'cyan', name: 'Cyan', hex: '#26C6DA', shape: 'ring' },
      { id: 'white', name: 'White', hex: '#FFFFFF', shape: 'bar' },
      { id: 'black', name: 'Black', hex: '#000000', shape: 'hexagon' },
    ],
  },
  safe: {
    label: 'Colour-blind safe',
    colors: [
      { id: 'orange', name: 'Orange', hex: '#E69F00', shape: 'star' },
      { id: 'skyblue', name: 'Sky blue', hex: '#56B4E9', shape: 'ring' },
      { id: 'green', name: 'Green', hex: '#009E73', shape: 'triangle' },
      { id: 'yellow', name: 'Yellow', hex: '#F0E442', shape: 'diamond' },
      { id: 'blue', name: 'Blue', hex: '#0072B2', shape: 'square' },
      { id: 'red', name: 'Red', hex: '#D55E00', shape: 'circle' },
      { id: 'pink', name: 'Pink', hex: '#CC79A7', shape: 'cross' },
      { id: 'white', name: 'White', hex: '#FFFFFF', shape: 'bar' },
      { id: 'black', name: 'Black', hex: '#000000', shape: 'hexagon' },
    ],
  },
};

// Neutral grey shown between flashes in "flash then blank" mode.
// Mid-grey so it never looks like black or white.
export const BLANK_HEX = '#6B6B6B';

// Black or white, whichever reads better on the given background.
export function contrastOn(hex) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const lum = 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  return lum > 0.179 ? '#000000' : '#FFFFFF';
}
