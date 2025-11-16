import {
  applyKernel,
  GAUSSIAN_KERNEL,
  GAUSSIAN_SIZE,
  GAUSSIAN_WEIGHT,
} from "./applyKernal";

// Assuming GAUSSIAN_5X5_KERNEL and related constants are defined
export const blurImage = (imageDataUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context failed"));

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Apply the blur kernel
      const blurredData = applyKernel(
        imageData.data,
        canvas.width,
        canvas.height,
        GAUSSIAN_KERNEL,
        GAUSSIAN_SIZE,
        GAUSSIAN_WEIGHT
      );

      // Update the ImageData object
      imageData.data.set(blurredData);

      // Write to canvas and return Data URL
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };

    img.onerror = () => reject(new Error("Failed to load image for blur"));
    img.src = imageDataUrl;
  });
};
