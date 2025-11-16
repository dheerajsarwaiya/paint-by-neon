export const toGrayscale = (imageDataUrl: string): Promise<string> => {
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
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        // Standard luminosity formula for grayscale
        const avg = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

        // Set R, G, and B channels to the same average value
        data[i] = avg; // R
        data[i + 1] = avg; // G
        data[i + 2] = avg; // B
        // data[i + 3] (Alpha) remains unchanged
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("Failed to load image for grayscale"));
    img.src = imageDataUrl;
  });
};
