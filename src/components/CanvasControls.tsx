import { ZoomIn, ZoomOut, Maximize2, Hand } from "lucide-react";

interface CanvasControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  isPanMode: boolean;
  onTogglePan: () => void;
  // imageLocked: boolean;
  // onToggleLock: () => void;
  // imageOpacity: number;
  // onOpacityChange: (opacity: number) => void;
}

export default function CanvasControls({
  scale,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  isPanMode,
  onTogglePan,
}: // imageLocked,
// onToggleLock,
// imageOpacity,
// onOpacityChange,
CanvasControlsProps) {
  return (
    <div>
      {/* <h3 className="mb-3 text-sm font-semibold text-gray-700">
        Canvas Controls
      </h3> */}

      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={onZoomOut}
              className="flex items-center justify-center gap-2 px-3 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
              disabled={scale <= 0.1}
            >
              <ZoomOut size={16} />
              {/* <span className="text-sm font-medium">Out</span> */}
            </button>
            <label className="block mb-2 text-xs text-gray-600">
              {Math.round(scale * 100)}%
            </label>

            <button
              onClick={onZoomIn}
              className="flex items-center justify-center gap-2 px-3 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
              disabled={scale >= 5}
            >
              <ZoomIn size={16} />
              {/* <span className="text-sm font-medium">In</span> */}
            </button>
            <button
              onClick={onResetZoom}
              className="flex items-center justify-center gap-2 px-3 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              <Maximize2 size={16} />
              {/* <span className="text-sm font-medium">Reset</span> */}
            </button>
            <button
              onClick={onTogglePan}
              className={`flex items-center justify-center gap-2 px-3 py-2 transition-colors rounded-lg ${
                isPanMode
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              title={isPanMode ? "Switch to Paint Mode" : "Switch to Pan Mode"}
            >
              <Hand size={16} />
            </button>
          </div>
        </div>

        {/* <div>
          <label className="flex items-center gap-2 mb-2 text-xs text-gray-600">
            <Eye size={14} />
            Image Opacity: {Math.round(imageOpacity * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={imageOpacity * 100}
            onChange={(e) => onOpacityChange(Number(e.target.value) / 100)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div> */}

        {/* <button
          onClick={onToggleLock}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            imageLocked
              ? "bg-amber-500 text-white hover:bg-amber-600"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {imageLocked ? <Lock size={16} /> : <Unlock size={16} />}
          <span className="text-sm font-medium">
            {imageLocked ? "Image Locked" : "Lock Image"}
          </span>
        </button> */}
      </div>
    </div>
  );
}
