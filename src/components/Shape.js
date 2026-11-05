import Svg, { Circle, Path, Polygon, Rect } from 'react-native-svg';

// All shapes are drawn in a 100x100 box so they scale cleanly to any size.
function points(n, r, rot = -90, inner = null) {
  const pts = [];
  const total = inner ? n * 2 : n;
  for (let i = 0; i < total; i++) {
    const rad = inner && i % 2 ? inner : r;
    const a = ((rot + (360 / total) * i) * Math.PI) / 180;
    pts.push(`${(50 + rad * Math.cos(a)).toFixed(2)},${(50 + rad * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(' ');
}

export default function Shape({ shape, size = 40, color = '#000' }) {
  let el;
  switch (shape) {
    case 'circle':
      el = <Circle cx="50" cy="50" r="44" fill={color} />;
      break;
    case 'square':
      el = <Rect x="10" y="10" width="80" height="80" fill={color} />;
      break;
    case 'triangle':
      el = <Polygon points="50,6 95,88 5,88" fill={color} />;
      break;
    case 'diamond':
      el = <Polygon points="50,4 96,50 50,96 4,50" fill={color} />;
      break;
    case 'star':
      el = <Polygon points={points(5, 48, -90, 20)} fill={color} />;
      break;
    case 'plus':
      el = <Path d="M38 6h24v32h32v24H62v32H38V62H6V38h32z" fill={color} />;
      break;
    case 'cross':
      el = (
        <Path
          d="M22 6 50 34 78 6 94 22 66 50 94 78 78 94 50 66 22 94 6 78 34 50 6 22z"
          fill={color}
        />
      );
      break;
    case 'ring':
      el = <Circle cx="50" cy="50" r="36" fill="none" stroke={color} strokeWidth="16" />;
      break;
    case 'bar':
      el = <Rect x="4" y="34" width="92" height="32" rx="6" fill={color} />;
      break;
    case 'hexagon':
      el = <Polygon points={points(6, 46, 0)} fill={color} />;
      break;
    default:
      el = null;
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {el}
    </Svg>
  );
}
