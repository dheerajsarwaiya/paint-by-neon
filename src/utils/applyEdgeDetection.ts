export const applyEdgeDetection = (
  processedData: Uint8ClampedArray,
  width: number,
  height: number,
  threshold: number = 150 // Increased default threshold for testing
): Uint8ClampedArray => {
  const kernel = [0, 1, 0, 1, -4, 1, 0, 1, 0]; // Laplacian 3x3
  const size = 3;
  const halfSize = Math.floor(size / 2);
  const outputData = new Uint8ClampedArray(processedData.length);

  // 💡 NEW: Define a factor to boost the weak Laplacian output.
  const AMPLIFICATION_FACTOR = 8; // Adjust this value (e.g., 5 to 10)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let edgeValue = 0;

      // Apply the Laplacian kernel using the simplified gray value
      for (let ky = 0; ky < size; ky++) {
        for (let kx = 0; kx < size; kx++) {
          const px = x + kx - halfSize;
          const py = y + ky - halfSize;

          if (px >= 0 && px < width && py >= 0 && py < height) {
            const index = (py * width + px) * 4;
            const kernelValue = kernel[ky * size + kx];

            const neighborGray =
              0.299 * processedData[index] +
              0.587 * processedData[index + 1] +
              0.114 * processedData[index + 2];

            // Apply kernel to grayscale value
            edgeValue += neighborGray * kernelValue;
          }
        }
      }

      const outputIndex = (y * width + x) * 4;

      // ✅ FIX: Amplify the raw edge value before comparing to the threshold.
      const amplifiedEdgeValue = Math.abs(edgeValue * AMPLIFICATION_FACTOR);

      // Check if the absolute edge value is above the threshold
      if (amplifiedEdgeValue > threshold) {
        // Edge detected: Set to black (0, 0, 0)
        outputData[outputIndex] = 0;
        outputData[outputIndex + 1] = 0;
        outputData[outputIndex + 2] = 0;
        outputData[outputIndex + 3] = 255; // Solid
      } else {
        // No edge: Set to white (255, 255, 255)
        outputData[outputIndex] = 255;
        outputData[outputIndex + 1] = 255;
        outputData[outputIndex + 2] = 255;
        outputData[outputIndex + 3] = 255;
      }
    }
  }
  return outputData;
};
