export interface CanvasState {
  imageDataUrl: string | null;
  scale: number;
  offsetX: number;
  offsetY: number;
  brushSize: number;
  brushColor: string;
  isEraser: boolean;
  history: ImageData[];
  historyStep: number;
  imageLocked: boolean;
  imageOpacity: number;
}

export interface Point {
  x: number;
  y: number;
}
