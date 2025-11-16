// Define a type for a convolution kernel
type Kernel = number[];

// // Define a 3x3 Gaussian Blur kernel
export const GAUSSIAN_3X3_KERNEL = [1, 2, 1, 2, 4, 2, 1, 2, 1];
// The sum of the kernel values is 16, which is the weight/divisor
export const GAUSSIAN_3X3_WEIGHT = 16;
export const GAUSSIAN_3X3_SIZE = 3;

// Define a 5x5 Gaussian Blur kernel
// const GAUSSIAN_5X5_KERNEL = [
//   1, 4, 7, 4, 1, 4, 16, 26, 16, 4, 7, 26, 41, 26, 7, 4, 16, 26, 16, 4, 1, 4, 7,
//   4, 1,
// ];
// // // The sum of the kernel values is 273
// const GAUSSIAN_5X5_WEIGHT = 273;
// const GAUSSIAN_5X5_SIZE = 5;

export const GAUSSIAN_KERNEL = GAUSSIAN_3X3_KERNEL;
// The sum of the kernel values is 273
export const GAUSSIAN_WEIGHT = GAUSSIAN_3X3_WEIGHT;
export const GAUSSIAN_SIZE = GAUSSIAN_3X3_SIZE;

// Helper function to apply a convolution kernel
export const applyKernel = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  kernel: Kernel,
  kernelSize: number,
  kernelWeight: number
): Uint8ClampedArray => {
  const outputData = new Uint8ClampedArray(data.length);
  const halfSize = Math.floor(kernelSize / 2);

  // Iterate over every pixel
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0,
        g = 0,
        b = 0;

      // Apply the kernel around the current pixel
      for (let ky = 0; ky < kernelSize; ky++) {
        for (let kx = 0; kx < kernelSize; kx++) {
          const px = x + kx - halfSize;
          const py = y + ky - halfSize;

          // Check for image boundaries (skips pixels outside the image)
          if (px >= 0 && px < width && py >= 0 && py < height) {
            const index = (py * width + px) * 4;
            const kernelValue = kernel[ky * kernelSize + kx];

            r += data[index] * kernelValue;
            g += data[index + 1] * kernelValue;
            b += data[index + 2] * kernelValue;
          }
        }
      }

      // Calculate the index for the current pixel
      const outputIndex = (y * width + x) * 4;

      // Normalize and assign new color values
      outputData[outputIndex] = Math.min(
        255,
        Math.max(0, Math.round(r / kernelWeight))
      );
      outputData[outputIndex + 1] = Math.min(
        255,
        Math.max(0, Math.round(g / kernelWeight))
      );
      outputData[outputIndex + 2] = Math.min(
        255,
        Math.max(0, Math.round(b / kernelWeight))
      );
      outputData[outputIndex + 3] = data[outputIndex + 3]; // Keep alpha channel unchanged
    }
  }
  return outputData;
};
