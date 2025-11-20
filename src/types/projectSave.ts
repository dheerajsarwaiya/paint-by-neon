export interface PaintOverArtSave {
  version: string;
  timestamp: number;
  project: {
    originalImage: string; // Base64 original image
    sketchImage: string; // Base64 sketch template
    dominantColors: string[]; // Extracted colors
  };
  canvas: {
    paintLayer?: string; // Base64 encoded current paint layer (legacy - for backwards compatibility)
    paintLayers?: Record<number, string>; // Base64 encoded paint layers by layer ID (new multi-layer support)
    dimensions: { width: number; height: number };
  };
  layers?: {
    activeLayerId: number;
    layersVisibility: Record<number, boolean>;
  };
  settings: {
    brushSize: number;
    brushColor: string;
    brushOpacity: number;
    scale: number;
    offsetX: number;
    offsetY: number;
    isEraser: boolean;
    isPanMode: boolean;
    isColorHighlightEnabled: boolean;
  };
}

export interface SaveResult {
  success: boolean;
  filename?: string;
  error?: string;
}

export interface LoadResult {
  success: boolean;
  data?: PaintOverArtSave;
  error?: string;
}
