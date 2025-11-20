import { Eye, EyeOff } from "lucide-react";

export interface Layer {
  id: number;
  name: string;
  visible: boolean;
  isSketch?: boolean;
}

interface LayersPanelProps {
  layers: Layer[];
  activeLayerId: number;
  onLayerSelect: (layerId: number) => void;
  onLayerVisibilityToggle: (layerId: number) => void;
}

const LayersPanel = ({
  layers,
  activeLayerId,
  onLayerSelect,
  onLayerVisibilityToggle,
}: LayersPanelProps) => {
  return (
    <div className="p-3 bg-white rounded-lg shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-gray-700">Layers</h3>
      <div className="space-y-2">
        {[...layers].reverse().map((layer) => (
          <div
            key={layer.id}
            className={`flex items-center justify-between p-2 rounded-lg border-2 transition-all cursor-pointer ${
              activeLayerId === layer.id
                ? "border-amber-500 bg-amber-50"
                : "border-gray-200 bg-gray-50 hover:border-gray-300"
            } ${!layer.visible ? "opacity-50" : ""}`}
            onClick={() => {
              if (layer.visible && !layer.isSketch) {
                onLayerSelect(layer.id);
              }
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  activeLayerId === layer.id ? "bg-amber-500" : "bg-gray-300"
                }`}
              />
              <span className="text-sm font-medium text-gray-700">
                {layer.name}
              </span>
              {layer.isSketch && (
                <span className="px-1.5 py-0.5 text-xs font-medium text-gray-600 bg-gray-200 rounded">
                  Sketch
                </span>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLayerVisibilityToggle(layer.id);
              }}
              className="p-1 transition-colors rounded hover:bg-gray-200"
              title={layer.visible ? "Hide layer" : "Show layer"}
            >
              {layer.visible ? (
                <Eye size={16} className="text-gray-600" />
              ) : (
                <EyeOff size={16} className="text-gray-400" />
              )}
            </button>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-gray-500">
        Click on a visible paint layer to activate it
      </p>
    </div>
  );
};

export default LayersPanel;
