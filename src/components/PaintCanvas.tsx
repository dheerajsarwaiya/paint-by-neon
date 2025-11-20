import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from "react";
import { Point } from "../types/canvas";
import type { ToolType } from "./BrushControls";
import {
  drawLine,
  drawSpray,
  loadImageToCanvas,
} from "../utils/canvasHelpers";
import { getCanvasImageData } from "../utils/canvasSerializer";
import { base64ToImageData } from "../utils/canvasSerializer";

interface HistorySnapshot {
  layers: Record<number, ImageData>;
}

interface PaintCanvasProps {
  sketchImageDataUrl: string | null;
  brushSize: number;
  brushColor: string;
  brushOpacity: number;
  toolType: ToolType;
  isPanMode: boolean;
  scale: number;
  offsetX: number;
  offsetY: number;
  onPan: (deltaX: number, deltaY: number) => void;
  onHistoryUpdate: (imageData: ImageData, layerId: number) => void;
  triggerUndo: number;
  triggerRedo: number;
  onUndoRedoComplete: () => void;
  globalHistory: HistorySnapshot[];
  globalHistoryStep: number;
  loadedPaintLayers?: Record<number, string | null>;
  activeLayerId: number;
  layersVisibility: Record<number, boolean>;
  sketchVisible: boolean;
}

export interface PaintCanvasRef {
  getCurrentImageData: () => ImageData | null;
  getLayerImageData: (layerId: number) => ImageData | null;
  getAllLayersImageData: () => Record<number, ImageData | null>;
}

const PaintCanvas = forwardRef<PaintCanvasRef, PaintCanvasProps>((props, ref) => {
  const {
    sketchImageDataUrl,
    brushSize,
    brushColor,
    brushOpacity,
    toolType,
    isPanMode,
    scale,
    offsetX,
    offsetY,
    onPan,
    onHistoryUpdate,
    triggerUndo,
    triggerRedo,
    onUndoRedoComplete,
    globalHistory,
    globalHistoryStep,
    loadedPaintLayers,
    activeLayerId,
    layersVisibility,
    sketchVisible,
  } = props;

  const sketchCanvasRef = useRef<HTMLCanvasElement>(null);
  const layer1CanvasRef = useRef<HTMLCanvasElement>(null);
  const layer2CanvasRef = useRef<HTMLCanvasElement>(null);
  const layer3CanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<Point | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState<Point | null>(null);

  // Map layer IDs to canvas refs
  const getCanvasRef = (layerId: number) => {
    switch (layerId) {
      case 1:
        return layer1CanvasRef;
      case 2:
        return layer2CanvasRef;
      case 3:
        return layer3CanvasRef;
      default:
        return null;
    }
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    getCurrentImageData: () => {
      const canvasRef = getCanvasRef(activeLayerId);
      if (!canvasRef?.current) return null;
      return getCanvasImageData(canvasRef.current);
    },
    getLayerImageData: (layerId: number) => {
      const canvasRef = getCanvasRef(layerId);
      if (!canvasRef?.current) return null;
      return getCanvasImageData(canvasRef.current);
    },
    getAllLayersImageData: () => {
      const result: Record<number, ImageData | null> = {};
      [1, 2, 3].forEach((layerId) => {
        const canvasRef = getCanvasRef(layerId);
        if (canvasRef?.current) {
          result[layerId] = getCanvasImageData(canvasRef.current);
        } else {
          result[layerId] = null;
        }
      });
      return result;
    },
  }));

  // Track if we've already loaded paint layers to avoid re-initializing
  const hasLoadedPaintLayersRef = useRef(false);
  const lastSketchUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const setupCanvases = async () => {
      if (
        sketchImageDataUrl &&
        sketchCanvasRef.current &&
        layer1CanvasRef.current &&
        layer2CanvasRef.current &&
        layer3CanvasRef.current
      ) {
        try {
          // Check if this is a new sketch image (new upload vs. loaded project)
          const isNewSketchImage = lastSketchUrlRef.current !== sketchImageDataUrl;
          if (isNewSketchImage && !loadedPaintLayers) {
            hasLoadedPaintLayersRef.current = false;
          }
          lastSketchUrlRef.current = sketchImageDataUrl;

          // Wait for the sketch image to load and set canvas dimensions
          await loadImageToCanvas(sketchImageDataUrl, sketchCanvasRef.current);

          // Now set all paint layer canvases to match the sketch canvas dimensions
          const sketchCanvas = sketchCanvasRef.current;
          const paintCanvases = [
            layer1CanvasRef.current,
            layer2CanvasRef.current,
            layer3CanvasRef.current,
          ];

          paintCanvases.forEach((canvas) => {
            canvas.width = sketchCanvas.width;
            canvas.height = sketchCanvas.height;
          });

          // Load or initialize paint layers
          if (loadedPaintLayers && !hasLoadedPaintLayersRef.current) {
            console.log("Loading paint layers from saved file...");
            try {
              for (const [layerIdStr, base64Data] of Object.entries(loadedPaintLayers)) {
                const layerId = parseInt(layerIdStr);
                if (base64Data && [1, 2, 3].includes(layerId)) {
                  const canvasRef = getCanvasRef(layerId);
                  if (canvasRef?.current) {
                    const ctx = canvasRef.current.getContext("2d");
                    if (ctx) {
                      const imageData = await base64ToImageData(base64Data);
                      ctx.putImageData(imageData, 0, 0);
                      onHistoryUpdate(imageData, layerId);
                    }
                  }
                }
              }
              hasLoadedPaintLayersRef.current = true;
              console.log("Paint layers loaded successfully!");
            } catch (error) {
              console.error("Failed to restore paint layers:", error);
            }
          } else if (!loadedPaintLayers && !hasLoadedPaintLayersRef.current) {
            // Initialize empty paint layers
            console.log("Initializing empty paint layers...");
            // Create initial snapshot with all empty layers
            const shouldCreateInitialSnapshot = globalHistory.length === 0;
            
            paintCanvases.forEach((canvas) => {
              const ctx = canvas.getContext("2d");
              if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
              }
            });
            
            // Create initial snapshot with all layers for first paint stroke to be undoable
            if (shouldCreateInitialSnapshot) {
              const ctx1 = layer1CanvasRef.current.getContext("2d");
              if (ctx1) {
                const imageData1 = ctx1.getImageData(0, 0, layer1CanvasRef.current.width, layer1CanvasRef.current.height);
                onHistoryUpdate(imageData1, 1);
              }
            }
            
            hasLoadedPaintLayersRef.current = true;
          }
        } catch (error) {
          console.error("Failed to load image to canvas:", error);
        }
      }
    };

    setupCanvases();
  }, [sketchImageDataUrl, loadedPaintLayers]);

  const performUndo = useCallback(() => {
    if (globalHistoryStep >= 0) {
      const snapshot = globalHistory[globalHistoryStep];
      if (snapshot) {
        // Restore all layers from the snapshot
        for (const [layerIdStr, imageData] of Object.entries(snapshot.layers)) {
          const layerId = parseInt(layerIdStr);
          const canvasRef = getCanvasRef(layerId);
          if (canvasRef?.current) {
            const ctx = canvasRef.current.getContext("2d");
            if (ctx) {
              ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
              ctx.putImageData(imageData, 0, 0);
            }
          }
        }
      }
    }
  }, [globalHistory, globalHistoryStep]);

  const performRedo = useCallback(() => {
    if (globalHistoryStep < globalHistory.length - 1) {
      const snapshot = globalHistory[globalHistoryStep + 1];
      if (snapshot) {
        // Restore all layers from the snapshot
        for (const [layerIdStr, imageData] of Object.entries(snapshot.layers)) {
          const layerId = parseInt(layerIdStr);
          const canvasRef = getCanvasRef(layerId);
          if (canvasRef?.current) {
            const ctx = canvasRef.current.getContext("2d");
            if (ctx) {
              ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
              ctx.putImageData(imageData, 0, 0);
            }
          }
        }
      }
    }
  }, [globalHistory, globalHistoryStep]);

  useEffect(() => {
    if (triggerUndo > 0) {
      performUndo();
      onUndoRedoComplete();
    }
  }, [triggerUndo, performUndo, onUndoRedoComplete]);

  useEffect(() => {
    if (triggerRedo > 0) {
      performRedo();
      onUndoRedoComplete();
    }
  }, [triggerRedo, performRedo, onUndoRedoComplete]);

  const saveToHistory = () => {
    const canvasRef = getCanvasRef(activeLayerId);
    if (canvasRef?.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        const imageData = ctx.getImageData(
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
        onHistoryUpdate(imageData, activeLayerId);
      }
    }
  };

  const getCanvasCoordinates = useCallback(
    (event: React.MouseEvent | React.TouchEvent): Point | null => {
      if (!containerRef.current) return null;

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();

      let clientX: number, clientY: number;

      if ("touches" in event) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      } else {
        clientX = event.clientX;
        clientY = event.clientY;
      }

      // Calculate the position relative to the container
      const containerX = clientX - containerRect.left;
      const containerY = clientY - containerRect.top;

      // Account for the transform: scale(scale) translate(offsetX/scale, offsetY/scale)
      // To reverse: first undo the translate, then undo the scale
      const canvasX = (containerX - offsetX) / scale;
      const canvasY = (containerY - offsetY) / scale;

      return { x: canvasX, y: canvasY };
    },
    [scale, offsetX, offsetY]
  );

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();

    if (isPanMode) {
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      let clientX: number, clientY: number;
      if ("touches" in event) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      } else {
        clientX = event.clientX;
        clientY = event.clientY;
      }

      setIsPanning(true);
      setLastPanPoint({ x: clientX, y: clientY });
      return;
    }

    const point = getCanvasCoordinates(event);
    if (!point) return;

    setIsDrawing(true);
    setLastPoint(point);
  };

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();

    if (isPanMode && isPanning && lastPanPoint) {
      let clientX: number, clientY: number;
      if ("touches" in event) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      } else {
        clientX = event.clientX;
        clientY = event.clientY;
      }

      const deltaX = clientX - lastPanPoint.x;
      const deltaY = clientY - lastPanPoint.y;

      onPan(deltaX, deltaY);
      setLastPanPoint({ x: clientX, y: clientY });
      return;
    }

    if (!isDrawing || !lastPoint) {
      return;
    }

    const canvasRef = getCanvasRef(activeLayerId);
    if (!canvasRef?.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const currentPoint = getCanvasCoordinates(event);
    if (!currentPoint) {
      return;
    }

    if (toolType === "spray") {
      drawSpray(ctx, currentPoint.x, currentPoint.y, brushColor, brushSize, brushOpacity);
    } else {
      drawLine(
        ctx,
        lastPoint.x,
        lastPoint.y,
        currentPoint.x,
        currentPoint.y,
        brushColor,
        brushSize,
        toolType === "eraser",
        brushOpacity
      );
    }

    setLastPoint(currentPoint);
  };

  const stopDrawing = () => {
    if (isPanning) {
      setIsPanning(false);
      setLastPanPoint(null);
      return;
    }

    if (isDrawing) {
      setIsDrawing(false);
      setLastPoint(null);
      saveToHistory();
    }
  };

  if (!sketchImageDataUrl) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-lg">
        <p className="text-lg text-gray-500">
          Upload an image to start painting
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-gray-200 rounded-lg shadow-inner ${
        isPanMode ? (isPanning ? "cursor-grabbing" : "cursor-grab") : ""
      }`}
      style={{ width: "100%", height: "100%" }}
      {...(isPanMode && {
        onMouseDown: startDrawing,
        onMouseMove: draw,
        onMouseUp: stopDrawing,
        onMouseLeave: stopDrawing,
        onTouchStart: startDrawing,
        onTouchMove: draw,
        onTouchEnd: stopDrawing,
      })}
    >
      <div
        style={{
          transform: `scale(${scale}) translate(${offsetX / scale}px, ${
            offsetY / scale
          }px)`,
          transformOrigin: "0 0",
          position: "relative",
        }}
      >
        {/* Sketch Layer (Layer 0) */}
        <canvas
          ref={sketchCanvasRef}
          className="absolute top-0 left-0"
          style={{
            imageRendering: "auto",
            opacity: sketchVisible ? 1 : 0,
            pointerEvents: "none",
          }}
        />
        
        {/* Paint Layer 1 */}
        <canvas
          ref={layer1CanvasRef}
          className={`absolute top-0 left-0 ${
            isPanMode 
              ? "pointer-events-none" 
              : activeLayerId === 1 && layersVisibility[1]
                ? toolType === "brush" 
                  ? "cursor-brush" 
                  : toolType === "spray" 
                    ? "cursor-spray" 
                    : "cursor-eraser"
                : "pointer-events-none"
          }`}
          style={{
            opacity: layersVisibility[1] ? 1 : 0,
          }}
          {...(!isPanMode && activeLayerId === 1 && layersVisibility[1] && {
            onMouseDown: startDrawing,
            onMouseMove: draw,
            onMouseUp: stopDrawing,
            onMouseLeave: stopDrawing,
            onTouchStart: startDrawing,
            onTouchMove: draw,
            onTouchEnd: stopDrawing,
          })}
        />
        
        {/* Paint Layer 2 */}
        <canvas
          ref={layer2CanvasRef}
          className={`absolute top-0 left-0 ${
            isPanMode 
              ? "pointer-events-none" 
              : activeLayerId === 2 && layersVisibility[2]
                ? toolType === "brush" 
                  ? "cursor-brush" 
                  : toolType === "spray" 
                    ? "cursor-spray" 
                    : "cursor-eraser"
                : "pointer-events-none"
          }`}
          style={{
            opacity: layersVisibility[2] ? 1 : 0,
          }}
          {...(!isPanMode && activeLayerId === 2 && layersVisibility[2] && {
            onMouseDown: startDrawing,
            onMouseMove: draw,
            onMouseUp: stopDrawing,
            onMouseLeave: stopDrawing,
            onTouchStart: startDrawing,
            onTouchMove: draw,
            onTouchEnd: stopDrawing,
          })}
        />
        
        {/* Paint Layer 3 */}
        <canvas
          ref={layer3CanvasRef}
          className={`absolute top-0 left-0 ${
            isPanMode 
              ? "pointer-events-none" 
              : activeLayerId === 3 && layersVisibility[3]
                ? toolType === "brush" 
                  ? "cursor-brush" 
                  : toolType === "spray" 
                    ? "cursor-spray" 
                    : "cursor-eraser"
                : "pointer-events-none"
          }`}
          style={{
            opacity: layersVisibility[3] ? 1 : 0,
          }}
          {...(!isPanMode && activeLayerId === 3 && layersVisibility[3] && {
            onMouseDown: startDrawing,
            onMouseMove: draw,
            onMouseUp: stopDrawing,
            onMouseLeave: stopDrawing,
            onTouchStart: startDrawing,
            onTouchMove: draw,
            onTouchEnd: stopDrawing,
          })}
        />
      </div>
    </div>
  );
});

export default PaintCanvas;
