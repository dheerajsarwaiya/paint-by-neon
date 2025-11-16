interface ColorMixData {
  name: string;
  hex: string;
  r: number;
  g: number;
  b: number;
  mix: {
    white: number;
    black: number;
    umber: number;
    cadY: number;
    lemonY: number;
    cadR: number;
    mag: number;
    ultraB: number;
    phthaloB: number;
  };
  notes: string;
}

/** Converts HEX to RGB array [r, g, b]. Returns null on error. */
function hexToRgb(hex: string): [number, number, number] | null {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null;
}

/** Calculates the squared Euclidean distance between two colors. */
function colorDistanceSquared(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  return (r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2;
}

/** Finds the closest Tailwind color in the palette to a given RGB value. */
export function findClosestColorInPalette(hex: string, palette: ColorMixData[]): ColorMixData | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;

  const [r, g, b] = rgb;
  let minDistance = Infinity;
  let closestColor: ColorMixData | null = null;

  for (const color of palette) {
    const dist = colorDistanceSquared(r, g, b, color.r, color.g, color.b);
    if (dist < minDistance) {
      minDistance = dist;
      closestColor = color;
    }
  }
  
  return closestColor;
}

/** Base paint names mapping */
export const basePaintNames: Record<string, string> = {
  white: 'Titanium White',
  black: 'Mars Black',
  umber: 'Burnt Umber',
  cadY: 'Cadmium Yellow',
  lemonY: 'Lemon Yellow',
  cadR: 'Cadmium Red',
  mag: 'Quinacridone Magenta',
  ultraB: 'Ultramarine Blue',
  phthaloB: 'Phthalo Blue'
};
