export const toGrayscale = (imageDataUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context failed"));

      // Disable image smoothing to preserve exact pixel mapping
      ctx.imageSmoothingEnabled = false;

      // Draw image at exact size
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        // Standard luminosity formula for grayscale
        const avg = Math.round(
          0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
        );

        // Set R, G, and B channels to the same average value
        data[i] = avg; // R
        data[i + 1] = avg; // G
        data[i + 2] = avg; // B
        // data[i + 3] (Alpha) remains unchanged
      }

      ctx.putImageData(imageData, 0, 0);

      // Use the same format as input to preserve exact properties
      const format = imageDataUrl.includes("data:image/jpeg")
        ? "image/jpeg"
        : "image/png";
      const quality = format === "image/jpeg" ? 1.0 : undefined;

      resolve(canvas.toDataURL(format, quality));
    };
    img.onerror = () => reject(new Error("Failed to load image for grayscale"));
    img.src = imageDataUrl;
  });
};
