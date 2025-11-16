// Re-introduce your colorDistance helper if it's not globally available
// For example:
// interface RGB { r: number; g: number; b: number; }
// const colorDistance = (color1: RGB, color2: RGB): number => {
//   const dr = color1.r - color2.r;
//   const dg = color1.g - color2.g;
//   const db = color1.b - color2.b;
//   return Math.sqrt(dr * dr + dg * dg + db * db);
// };

import { colorDistance, RGB } from "./imageProcessing";

export const applyColorDifferenceOutline = (
  processedData: Uint8ClampedArray, // This is the posterized image data
  width: number,
  height: number,
  minColorDifference: number = 30 // Tune this value!
): Uint8ClampedArray => {
  const outputData = new Uint8ClampedArray(processedData.length);

  // Initialize output to white (no lines)
  for (let i = 0; i < processedData.length; i += 4) {
    outputData[i] = 255;
    outputData[i + 1] = 255;
    outputData[i + 2] = 255;
    outputData[i + 3] = 255;
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const currentIndex = (y * width + x) * 4;
      const currentColor: RGB = {
        r: processedData[currentIndex],
        g: processedData[currentIndex + 1],
        b: processedData[currentIndex + 2],
      };

      // Check right neighbor
      if (x < width - 1) {
        const rightIndex = (y * width + (x + 1)) * 4;
        const rightColor: RGB = {
          r: processedData[rightIndex],
          g: processedData[rightIndex + 1],
          b: processedData[rightIndex + 2],
        };
        if (colorDistance(currentColor, rightColor) > minColorDifference) {
          // If colors are significantly different, draw a line at the current pixel
          outputData[currentIndex] = 0;
          outputData[currentIndex + 1] = 0;
          outputData[currentIndex + 2] = 0;
          outputData[currentIndex + 3] = 255;
        }
      }

      // Check bottom neighbor
      if (y < height - 1) {
        const bottomIndex = ((y + 1) * width + x) * 4;
        const bottomColor: RGB = {
          r: processedData[bottomIndex],
          g: processedData[bottomIndex + 1],
          b: processedData[bottomIndex + 2],
        };
        if (colorDistance(currentColor, bottomColor) > minColorDifference) {
          // If colors are significantly different, draw a line at the current pixel
          outputData[currentIndex] = 0;
          outputData[currentIndex + 1] = 0;
          outputData[currentIndex + 2] = 0;
          outputData[currentIndex + 3] = 255;
        }
      }
    }
  }
  return outputData;
};
