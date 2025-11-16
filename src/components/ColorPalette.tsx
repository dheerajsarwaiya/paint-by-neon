import { useState } from 'react';
import { Palette } from 'lucide-react';
import ColorMixer from './ColorMixer';

interface ColorPaletteProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  dominantColors?: string[];
}

const TAILWIND_COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#FFFFFF' },
  { name: 'Gray 500', value: '#6B7280' },
  { name: 'Red 500', value: '#EF4444' },
  { name: 'Red 700', value: '#B91C1C' },
  { name: 'Orange 500', value: '#F97316' },
  { name: 'Amber 500', value: '#F59E0B' },
  { name: 'Yellow 400', value: '#FACC15' },
  { name: 'Lime 500', value: '#84CC16' },
  { name: 'Green 500', value: '#22C55E' },
  { name: 'Emerald 600', value: '#059669' },
  { name: 'Teal 500', value: '#14B8A6' },
  { name: 'Cyan 500', value: '#06B6D4' },
  { name: 'Sky 500', value: '#0EA5E9' },
  { name: 'Blue 500', value: '#3B82F6' },
  { name: 'Blue 700', value: '#1D4ED8' },
  { name: 'Violet 500', value: '#8B5CF6' },
  { name: 'Purple 500', value: '#A855F7' },
  { name: 'Fuchsia 500', value: '#D946EF' },
  { name: 'Pink 500', value: '#EC4899' },
  { name: 'Rose 500', value: '#F43F5E' },
];

export default function ColorPalette({ selectedColor, onColorChange, dominantColors }: ColorPaletteProps) {
  const [showColorMixer, setShowColorMixer] = useState(false);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Brush Color</h3>
        <button
          onClick={() => setShowColorMixer(true)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white transition-all duration-150 bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 hover:shadow-md"
          title="Find mixing recipe for selected color"
        >
          <Palette size={14} />
          Color Mixer
        </button>
      </div>
      {dominantColors && dominantColors.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-medium text-gray-600">Image Colors</p>
          <div className="grid grid-cols-7 gap-2 pb-4 mb-4 border-b border-gray-200">
            {dominantColors.map((color) => (
              <button
                key={color}
                onClick={() => onColorChange(color)}
                className={`w-8 h-8 rounded-md border-2 transition-all hover:scale-110 ${
                  selectedColor === color
                    ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-900'
                    : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}
      <p className="mb-2 text-xs font-medium text-gray-600">More Colors</p>
      <div className="grid grid-cols-7 gap-2">
        {TAILWIND_COLORS.map((color) => (
          <button
            key={color.value}
            onClick={() => onColorChange(color.value)}
            className={`w-8 h-8 rounded-md border-2 transition-all hover:scale-110 ${
              selectedColor === color.value
                ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-900'
                : 'border-gray-300'
            }`}
            style={{ backgroundColor: color.value }}
            title={color.name}
          />
        ))}
      </div>

      {/* Color Mixer Modal */}
      {showColorMixer && (
        <ColorMixer
          selectedColor={selectedColor}
          onClose={() => setShowColorMixer(false)}
        />
      )}
    </div>
  );
}
