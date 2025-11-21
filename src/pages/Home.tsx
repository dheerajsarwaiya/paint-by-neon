import { QuickGuide } from "./../components/Quick-Guide";
import { WeclomeMessage } from "./../components/Weclome-Message";
import { useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Palette, HelpCircle } from "lucide-react";
import ImageUploader from "../components/ImageUploader";
import { saveProject, loadProject } from "../utils/projectSave";
import { exportCanvasAsImage } from "../utils/exportCanvas";
import PaintCanvas, { PaintCanvasRef } from "../components/PaintCanvas";
import ColorPalette from "../components/ColorPalette";
import BrushControls, { ToolType } from "../components/BrushControls";
import CanvasControls from "../components/CanvasControls";
import HistoryControls from "../components/HistoryControls";
import ColorHighlightOverlay from "../components/ColorHighlightOverlay";
import LayersPanel, { Layer } from "../components/LayersPanel";
// import { Analytics } from "@vercel/analytics/next";

function Home() {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [sketchImageDataUrl, setSketchImageDataUrl] = useState<string | null>(
    null
  );
  const [dominantColors, setDominantColors] = useState<string[]>([]);
  const [brushSize, setBrushSize] = useState(10);
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushOpacity, setBrushOpacity] = useState(0.3);
  const [toolType, setToolType] = useState<ToolType>("brush");
  const [isPanMode, setIsPanMode] = useState(false);
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  // const [imageLocked, setImageLocked] = useState(false);
  // const [imageOpacity, setImageOpacity] = useState(0.5);

  // Layers state management
  const [layers, setLayers] = useState<Layer[]>([
    { id: 0, name: "Layer 0", visible: true, isSketch: true },
    { id: 1, name: "Layer 1", visible: true },
    { id: 2, name: "Layer 2", visible: true },
    { id: 3, name: "Layer 3", visible: true },
  ]);
  const [activeLayerId, setActiveLayerId] = useState(1);

  // Global undo/redo history across all layers
  interface HistorySnapshot {
    layers: Record<number, ImageData>;
  }
  const [globalHistory, setGlobalHistory] = useState<HistorySnapshot[]>([]);
  const [globalHistoryStep, setGlobalHistoryStep] = useState(-1);
  const [triggerUndo, setTriggerUndo] = useState(0);
  const [triggerRedo, setTriggerRedo] = useState(0);
  const [isColorHighlightEnabled, setIsColorHighlightEnabled] = useState(true);
  const [showQuickGuide, setShowQuickGuide] = useState(false);
  const [loadedPaintLayers, setLoadedPaintLayers] = useState<
    Record<number, string | null>
  >({});
  const paintCanvasRef = useRef<PaintCanvasRef>(null);

  const handleImageUpload = (
    dataUrl: string,
    sketchUrl: string,
    colors?: string[]
  ) => {
    setImageDataUrl(dataUrl);
    setSketchImageDataUrl(sketchUrl);
    setDominantColors(colors || []);
    // Set default brush color to first dominant color if available
    if (colors && colors.length > 0) {
      setBrushColor(colors[0]);
    }
    setScale(1);
    setOffsetX(0);
    setOffsetY(0);
    setGlobalHistory([]);
    setGlobalHistoryStep(-1);
    setIsColorHighlightEnabled(true);
    setLoadedPaintLayers({}); // Reset loaded paint layers for new uploads
    // Reset layers visibility
    setLayers([
      { id: 0, name: "Layer 0", visible: true, isSketch: true },
      { id: 1, name: "Layer 1", visible: true },
      { id: 2, name: "Layer 2", visible: true },
      { id: 3, name: "Layer 3", visible: true },
    ]);
    setActiveLayerId(1);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 5));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.1));
  };

  const handleResetZoom = () => {
    setScale(1);
    setOffsetX(0);
    setOffsetY(0);
  };

  const handlePan = (deltaX: number, deltaY: number) => {
    setOffsetX((prev) => prev + deltaX);
    setOffsetY((prev) => prev + deltaY);
  };

  const handleHistoryUpdate = useCallback(
    (imageData: ImageData, layerId: number) => {
      // Get all current layer states
      const allLayersData =
        paintCanvasRef.current?.getAllLayersImageData() || {};

      // Filter out null values and create clean layers object
      const cleanLayers: Record<number, ImageData> = {};
      for (const [id, data] of Object.entries(allLayersData)) {
        if (data) {
          cleanLayers[parseInt(id)] = data;
        }
      }

      // Update the changed layer
      cleanLayers[layerId] = imageData;

      const snapshot: HistorySnapshot = {
        layers: cleanLayers,
      };

      // Add to global history, removing any future states if we're in the middle of undo stack
      const newHistory = globalHistory.slice(0, globalHistoryStep + 1);
      newHistory.push(snapshot);

      setGlobalHistory(newHistory);
      setGlobalHistoryStep(newHistory.length - 1);
    },
    [globalHistory, globalHistoryStep]
  );

  const handleUndo = () => {
    if (globalHistoryStep > 0) {
      setGlobalHistoryStep((prev) => prev - 1);
      setTriggerUndo((prev) => prev + 1);
    }
  };

  const handleRedo = () => {
    if (globalHistoryStep < globalHistory.length - 1) {
      setGlobalHistoryStep((prev) => prev + 1);
      setTriggerRedo((prev) => prev + 1);
    }
  };

  const handleClear = () => {
    if (
      window.confirm(
        `Are you sure you want to clear all painting on Layer ${activeLayerId}?`
      )
    ) {
      // Clear only affects the current active layer
      // We'll trigger the canvas to clear and add to history
      const canvasRef = paintCanvasRef.current;
      if (canvasRef) {
        const layerImageData = canvasRef.getLayerImageData(activeLayerId);
        if (layerImageData) {
          // Create a blank image data
          const blankImageData = new ImageData(
            layerImageData.width,
            layerImageData.height
          );
          handleHistoryUpdate(blankImageData, activeLayerId);
          setTriggerUndo((prev) => prev + 1); // Trigger a refresh
        }
      }
    }
  };

  const handleUndoRedoComplete = () => {};

  const handleLayerSelect = (layerId: number) => {
    if (layerId !== 0) {
      setActiveLayerId(layerId);
    }
  };

  const handleLayerVisibilityToggle = (layerId: number) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
      )
    );
  };

  const handleSaveProgress = async (): Promise<void> => {
    try {
      if (!imageDataUrl || !sketchImageDataUrl) {
        alert(
          "No project data to save. Please upload an image and start painting first."
        );
        return;
      }

      // Get all layers image data
      const allLayersImageData =
        paintCanvasRef.current?.getAllLayersImageData();

      if (!allLayersImageData) {
        alert("No canvas data to save.");
        return;
      }

      const result = await saveProject(
        imageDataUrl,
        sketchImageDataUrl,
        dominantColors,
        allLayersImageData,
        {
          brushSize,
          brushColor,
          brushOpacity,
          scale,
          offsetX,
          offsetY,
          isEraser: toolType === "eraser",
          isPanMode,
          isColorHighlightEnabled,
        },
        {
          activeLayerId,
          layersVisibility: layers.reduce(
            (acc, layer) => ({ ...acc, [layer.id]: layer.visible }),
            {}
          ),
        }
      );

      if (result.success) {
        alert(`Progress saved successfully as ${result.filename}`);
      } else {
        alert(`Failed to save progress: ${result.error}`);
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("An unexpected error occurred while saving.");
    }
  };

  const handleLoadProgress = async (file: File): Promise<void> => {
    try {
      const result = await loadProject(file);

      if (!result.success || !result.data) {
        alert(`Failed to load project: ${result.error}`);
        return;
      }

      const { data } = result;

      // Restore project images and settings
      setImageDataUrl(data.project.originalImage);
      setSketchImageDataUrl(data.project.sketchImage);
      setDominantColors(data.project.dominantColors);

      // Restore UI settings
      setBrushSize(data.settings.brushSize);
      setBrushColor(data.settings.brushColor);
      setBrushOpacity(data.settings.brushOpacity);
      setScale(data.settings.scale);
      setOffsetX(data.settings.offsetX);
      setOffsetY(data.settings.offsetY);
      setToolType(data.settings.isEraser ? "eraser" : "brush");
      setIsPanMode(data.settings.isPanMode);
      setIsColorHighlightEnabled(data.settings.isColorHighlightEnabled);

      // Clear history for fresh start
      setGlobalHistory([]);
      setGlobalHistoryStep(-1);

      // Restore layers state
      if (data.layers) {
        // New format with multi-layer support
        setActiveLayerId(data.layers.activeLayerId);
        setLayers((prev) =>
          prev.map((layer) => ({
            ...layer,
            visible: data.layers!.layersVisibility[layer.id] ?? layer.visible,
          }))
        );

        // Load all paint layers
        if (data.canvas.paintLayers) {
          const loadedLayers: Record<number, string | null> = {};
          for (const [layerIdStr, layerData] of Object.entries(
            data.canvas.paintLayers
          )) {
            loadedLayers[parseInt(layerIdStr)] = layerData;
          }
          setLoadedPaintLayers(loadedLayers);
        }
      } else if (data.canvas.paintLayer) {
        // Legacy format - load to layer 1 for backwards compatibility
        setLoadedPaintLayers({ 1: data.canvas.paintLayer });
        setActiveLayerId(1);
      }

      alert("Project loaded successfully!");
    } catch (error) {
      console.error("Load error:", error);
      alert("An unexpected error occurred while loading the project.");
    }
  };

  const handleExportImage = async (): Promise<void> => {
    try {
      // Get all layers image data
      const allLayersImageData =
        paintCanvasRef.current?.getAllLayersImageData();

      if (!allLayersImageData || !sketchImageDataUrl) {
        alert(
          "No canvas data to export. Please upload an image and start painting first."
        );
        return;
      }

      // Ask user if they want to include the original colored/posterized image
      const includeOriginal = window.confirm(
        "Do you want to include the original colored image in the export?\n\n" +
          "Click OK to export with the original colored/posterized image as background.\n" +
          "Click Cancel to export with only the grayscale sketch outline and your painting."
      );

      // Get layers visibility
      const layersVisibility = layers.reduce(
        (acc, layer) => ({ ...acc, [layer.id]: layer.visible }),
        {}
      );
      const sketchVisible = layers.find((l) => l.id === 0)?.visible ?? true;

      await exportCanvasAsImage(
        sketchImageDataUrl,
        allLayersImageData,
        layersVisibility,
        {
          includeOriginal,
          originalImageDataUrl: imageDataUrl || undefined,
          filename: "my-painting.png",
          sketchVisible,
        }
      );

      alert("Image exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      alert("An error occurred while exporting the image.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-gray-300 to-gray-800">
                <Palette className="text-[#39FF14]" size={24} />
              </div>
              <div>
                <h1 className="flex gap-2 text-2xl font-bold text-amber-500">
                  Paint By{" "}
                  <span className="text-[#39FF14] [-webkit-text-stroke:1px_#374151] [text-stroke:1px_#374151]">
                    {" "}
                    Neon
                  </span>
                </h1>
                <p className="text-sm text-gray-600">
                  Upload, trace, and create beautiful artwork
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/why-and-how"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <HelpCircle size={16} />
                Why and How?
              </Link>
              <ImageUploader
                onImageUpload={handleImageUpload}
                onProjectLoad={handleLoadProgress}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {/* Welcome message for new users */}
        {!imageDataUrl && !sketchImageDataUrl && (
          <WeclomeMessage
            handleImageUpload={handleImageUpload}
            handleLoadProgress={handleLoadProgress}
          />
        )}

        {/* Main workspace - only shown after upload/load */}
        {(imageDataUrl || sketchImageDataUrl) && (
          <>
            {/* Top bar with brush and canvas controls */}
            <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:flex-wrap sm:gap-4 sm:mb-6">
              {" "}
              <button
                onClick={() => setShowQuickGuide(!showQuickGuide)}
                className="flex items-center gap-2 px-4 py-2 mb-4 text-sm font-medium transition-colors border rounded-lg shadow-sm text-amber-700 bg-gradient-to-r from-amber-50 to-green-50 border-amber-200 hover:from-amber-100 hover:to-green-100"
              >
                <HelpCircle size={16} />
                Quick Guide
              </button>
              <div className="w-full overflow-x-auto sm:w-auto">
                <BrushControls
                  brushSize={brushSize}
                  onBrushSizeChange={setBrushSize}
                  brushOpacity={brushOpacity}
                  onBrushOpacityChange={setBrushOpacity}
                  toolType={toolType}
                  onToolChange={setToolType}
                />
              </div>
              <div className="w-full overflow-x-auto sm:w-auto">
                <CanvasControls
                  scale={scale}
                  onZoomIn={handleZoomIn}
                  onZoomOut={handleZoomOut}
                  onResetZoom={handleResetZoom}
                  isPanMode={isPanMode}
                  onTogglePan={() => setIsPanMode(!isPanMode)}
                  // imageLocked={imageLocked}
                  // onToggleLock={() => setImageLocked(!imageLocked)}
                  // imageOpacity={imageOpacity}
                  // onOpacityChange={setImageOpacity}
                />
              </div>
              <div className="w-full overflow-x-auto sm:w-auto">
                <HistoryControls
                  canUndo={globalHistoryStep > 0}
                  canRedo={globalHistoryStep < globalHistory.length - 1}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                  onClear={handleClear}
                  onSave={handleSaveProgress}
                  onLoad={handleLoadProgress}
                  onExport={handleExportImage}
                  canSave={!!imageDataUrl && !!sketchImageDataUrl}
                />
              </div>
            </div>
            <div>
              {showQuickGuide && (
                <QuickGuide setShowQuickGuide={setShowQuickGuide} />
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
              {/* Canvas area - shows first on mobile, second on desktop */}
              <div className="order-1 space-y-4 lg:order-2 lg:col-span-3">
                {/* Canvas area with overlay layers panel */}
                <div className="relative p-3 bg-white rounded-lg shadow-lg sm:p-6 aspect-square">
                  {/* Layers Panel - overlaid on top-right corner */}
                  <div className="absolute top-3 right-3 z-10 max-w-[200px]">
                    <LayersPanel
                      layers={layers}
                      activeLayerId={activeLayerId}
                      onLayerSelect={handleLayerSelect}
                      onLayerVisibilityToggle={handleLayerVisibilityToggle}
                    />
                  </div>

                  <PaintCanvas
                    ref={paintCanvasRef}
                    sketchImageDataUrl={sketchImageDataUrl}
                    brushSize={brushSize}
                    brushColor={brushColor}
                    brushOpacity={brushOpacity}
                    toolType={toolType}
                    isPanMode={isPanMode}
                    scale={scale}
                    offsetX={offsetX}
                    offsetY={offsetY}
                    onPan={handlePan}
                    onHistoryUpdate={handleHistoryUpdate}
                    triggerUndo={triggerUndo}
                    triggerRedo={triggerRedo}
                    onUndoRedoComplete={handleUndoRedoComplete}
                    globalHistory={globalHistory}
                    globalHistoryStep={globalHistoryStep}
                    loadedPaintLayers={loadedPaintLayers}
                    activeLayerId={activeLayerId}
                    layersVisibility={layers.reduce(
                      (acc, layer) => ({ ...acc, [layer.id]: layer.visible }),
                      {}
                    )}
                    sketchVisible={
                      layers.find((l) => l.id === 0)?.visible ?? true
                    }
                  />
                </div>
              </div>

              {/* Sidebar - shows second on mobile, first on desktop */}
              <div className="order-2 space-y-4 lg:order-1 lg:col-span-1">
                {imageDataUrl && (
                  <div className="p-4 bg-white rounded-lg shadow-sm">
                    {/* <h3 className="mb-2 text-sm font-medium text-gray-700">
                  Original Image
                </h3> */}
                    <ColorHighlightOverlay
                      imageDataUrl={imageDataUrl}
                      brushColor={brushColor}
                      isEnabled={isColorHighlightEnabled}
                      onToggle={() =>
                        setIsColorHighlightEnabled(!isColorHighlightEnabled)
                      }
                      scale={scale}
                      offsetX={offsetX}
                      offsetY={offsetY}
                    />
                  </div>
                )}
                <ColorPalette
                  selectedColor={brushColor}
                  onColorChange={setBrushColor}
                  dominantColors={dominantColors}
                />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Home;
