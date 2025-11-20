/**
 * Exports the canvas as an image by combining layers
 * @param sketchImageDataUrl - The sketch image data URL
 * @param paintLayersImageData - All paint layers ImageData (keyed by layer ID)
 * @param layersVisibility - Visibility state of each layer
 * @param options - Export options
 * @param options.includeOriginal - Whether to include the original/grayscale image as background
 * @param options.originalImageDataUrl - The original/grayscale image data URL (required if includeOriginal is true)
 * @param options.filename - Optional filename for the exported image
 * @param options.sketchVisible - Whether the sketch layer should be visible
 */
export async function exportCanvasAsImage(
  sketchImageDataUrl: string,
  paintLayersImageData: Record<number, ImageData | null>,
  layersVisibility: Record<number, boolean>,
  options: {
    includeOriginal?: boolean;
    originalImageDataUrl?: string;
    filename?: string;
    sketchVisible?: boolean;
  } = {}
): Promise<void> {
  const { includeOriginal = false, originalImageDataUrl, filename = 'my-painting.png', sketchVisible = true } = options;

  try {
    // Create a temporary canvas to combine layers
    const exportCanvas = document.createElement('canvas');
    const ctx = exportCanvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Load the sketch image
    const sketchImage = new Image();
    await new Promise<void>((resolve, reject) => {
      sketchImage.onload = () => resolve();
      sketchImage.onerror = () => reject(new Error('Failed to load sketch image'));
      sketchImage.src = sketchImageDataUrl;
    });

    // Set canvas dimensions to match the sketch image
    exportCanvas.width = sketchImage.width;
    exportCanvas.height = sketchImage.height;

    // Layer 0: Background - either original colored image or grayscale sketch (if visible)
    if (includeOriginal && originalImageDataUrl) {
      // Draw the original colored/posterized image as background
      const originalImage = new Image();
      await new Promise<void>((resolve, reject) => {
        originalImage.onload = () => resolve();
        originalImage.onerror = () => reject(new Error('Failed to load original image'));
        originalImage.src = originalImageDataUrl;
      });
      ctx.drawImage(originalImage, 0, 0);
    } else if (sketchVisible) {
      // Draw the grayscale sketch as background (when not including original and sketch is visible)
      ctx.drawImage(sketchImage, 0, 0);
    }

    // Layer 1, 2, 3: Draw all visible paint layers in order
    const layerIds = [1, 2, 3]; // Draw layers in order
    for (const layerId of layerIds) {
      const isVisible = layersVisibility[layerId];
      const imageData = paintLayersImageData[layerId];
      
      if (isVisible && imageData) {
        // Create temporary canvas for this layer
        const paintCanvas = document.createElement('canvas');
        paintCanvas.width = imageData.width;
        paintCanvas.height = imageData.height;
        const paintCtx = paintCanvas.getContext('2d');
        
        if (paintCtx) {
          paintCtx.putImageData(imageData, 0, 0);
          // Draw this paint layer onto the export canvas
          ctx.drawImage(paintCanvas, 0, 0);
        }
      }
    }

    // Convert to blob and download
    exportCanvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Failed to create image blob');
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
    }, 'image/png');
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
}
