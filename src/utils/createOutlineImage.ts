import { applyColorDifferenceOutline } from "./applyColorDifferenceOutline";
// import { applyEdgeDetection } from "./applyEdgeDetection";

// Function to create outline using the Laplacian filter (assuming applyEdgeDetection is available)
export const createOutlineImage = (
  posterizedDataUrl: string,
  threshold: number = 100
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context failed"));

      // The image drawn here is the POSTERIZED one
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Apply the edge detection (Laplacian filter)
      const outlineData = applyColorDifferenceOutline(
        imageData.data,
        canvas.width,
        canvas.height,
        threshold
      );

      // const outlineData = applyEdgeDetection(
      //   imageData.data,
      //   canvas.width,
      //   canvas.height,
      //   threshold
      // );

      // Update the ImageData object with the outlines
      imageData.data.set(outlineData);

      // Write to canvas and return Data URL
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };

    img.onerror = () => reject(new Error("Failed to load image for outlining"));
    img.src = posterizedDataUrl;
  });
};
