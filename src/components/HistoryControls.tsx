import { Undo2, Redo2, RotateCcw } from "lucide-react";

interface HistoryControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
}

export default function HistoryControls({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
}: HistoryControlsProps) {
  return (
    <div>
      {/* <h3 className="mb-3 text-sm font-semibold text-gray-700">History</h3> */}

      <div className="flex gap-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            canUndo
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          <Undo2 size={16} />
          {/* <span className="text-sm font-medium">Undo</span> */}
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={` flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            canRedo
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          <Redo2 size={16} />
          {/* <span className="text-sm font-medium">Redo</span> */}
        </button>

        <button
          onClick={onClear}
          className="flex items-center justify-center gap-2 px-3 py-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
        >
          <RotateCcw size={16} />
          {/* <span className="text-sm font-medium">Clear</span> */}
        </button>
      </div>
    </div>
  );
}
