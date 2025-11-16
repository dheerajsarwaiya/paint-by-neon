import { useState, useEffect } from 'react';
import { X, Palette } from 'lucide-react';
import { findClosestColorInPalette, basePaintNames } from '../utils/colorMixer';
import colorPaletteMixer from '../data/color-palette-mixer.json';

interface ColorMixerProps {
  selectedColor: string;
  onClose: () => void;
}

interface ColorMixData {
  name: string;
  hex: string;
  r: number;
  g: number;
  b: number;
  mix: {
    white: number;
    black: number;
    umber: number;
    cadY: number;
    lemonY: number;
    cadR: number;
    mag: number;
    ultraB: number;
    phthaloB: number;
  };
  notes: string;
}

export default function ColorMixer({ selectedColor, onClose }: ColorMixerProps) {
  const [matchedColor, setMatchedColor] = useState<ColorMixData | null>(null);

  useEffect(() => {
    const match = findClosestColorInPalette(selectedColor, colorPaletteMixer as ColorMixData[]);
    setMatchedColor(match);
  }, [selectedColor]);

  if (!matchedColor) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <div className="w-full max-w-2xl p-6 bg-white shadow-2xl rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <Palette className="text-indigo-600" size={28} />
              Color Mixer
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 transition-colors hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
          <p className="text-gray-600">Loading color data...</p>
        </div>
      </div>
    );
  }

  const mixingParts: Array<{ key: string; parts: number; name: string }> = [];
  let totalParts = 0;

  Object.entries(matchedColor.mix).forEach(([key, parts]) => {
    if (parts > 0) {
      totalParts += parts;
      mixingParts.push({
        key,
        parts,
        name: basePaintNames[key] || key,
      });
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-3xl bg-white shadow-2xl rounded-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <Palette className="text-indigo-600" size={28} />
              Physical Color Mixer
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 transition-colors hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Find the nearest match and mixing recipe for your selected color
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Color Comparison */}
          <div>
            <h3 className="pb-2 mb-3 text-lg font-semibold text-gray-700 border-b">
              1. Color Match
            </h3>
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <p className="mb-2 font-medium text-center text-gray-600">Your Selected Color</p>
                <div
                  className="w-full h-20 border-gray-300 rounded-lg shadow-inner border-3"
                  style={{ backgroundColor: selectedColor }}
                />
                <p className="mt-2 font-mono text-sm text-center text-gray-500">
                  {selectedColor.toUpperCase()}
                </p>
              </div>
              <div className="flex-1">
                <p className="mb-2 font-medium text-center text-gray-600">Nearest Match</p>
                <div
                  className="w-full h-20 border-gray-300 rounded-lg shadow-inner border-3"
                  style={{ backgroundColor: matchedColor.hex }}
                />
                <p className="mt-2 text-sm font-semibold text-center text-gray-700">
                  {matchedColor.name}
                </p>
                <p className="font-mono text-xs text-center text-gray-500">
                  {matchedColor.hex.toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Mixing Instructions */}
          <div>
            <h3 className="pb-2 mb-3 text-lg font-semibold text-gray-700 border-b">
              2. Mixing Recipe
            </h3>
            
            {mixingParts.length === 0 ? (
              <p className="italic text-gray-600">No mixing data available for this color.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {mixingParts.map(({ key, parts, name }) => (
                  <div
                    key={key}
                    className="p-4 border border-gray-200 rounded-lg shadow-sm bg-gradient-to-br from-gray-50 to-gray-100"
                  >
                    <p className="text-lg font-bold text-indigo-700">
                      {parts} Part{parts > 1 ? 's' : ''}
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-700">{name}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="p-4 mt-4 border border-blue-200 rounded-lg bg-blue-50">
              <p className="text-sm text-gray-700">
                <span className="font-bold">Total Parts:</span>{' '}
                <span className="font-mono text-indigo-600">{totalParts}</span>
                {totalParts > 0 && (
                  <span className="ml-2 text-gray-600">
                    (Mix these parts together to achieve the color)
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Mixing Notes */}
          {matchedColor.notes && (
            <div>
              <h3 className="pb-2 mb-3 text-lg font-semibold text-gray-700 border-b">
                3. Mixing Tips
              </h3>
              <div className="p-4 border rounded-lg bg-amber-50 border-amber-200">
                <p className="text-sm italic leading-relaxed text-gray-700">
                  {matchedColor.notes}
                </p>
              </div>
            </div>
          )}

          {/* Base Colors Reference */}
          <div>
            <h3 className="pb-2 mb-3 text-lg font-semibold text-gray-700 border-b">
              Base Colors Reference
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 sm:grid-cols-3">
              {Object.entries(basePaintNames).map(([key, name]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-indigo-600">{key}:</span>
                  <span>{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 font-bold text-white transition duration-150 ease-in-out bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
