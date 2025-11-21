import { HelpCircle } from "lucide-react";

export function QuickGuide({
  setShowQuickGuide,
}: {
  setShowQuickGuide: (show: boolean) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative max-w-md p-6 mx-4 bg-white rounded-lg shadow-xl">
        <button
          onClick={() => setShowQuickGuide(false)}
          className="absolute text-gray-400 top-4 right-4 hover:text-gray-600"
        >
          ✕
        </button>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            <div className="p-2 rounded-full bg-amber-100">
              <HelpCircle className="text-amber-600" size={20} />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="mb-3 text-lg font-semibold text-gray-800">
              Getting Started - Quick Guide
            </h3>
            <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
              <li>
                <span className="font-medium">Select a brush tool</span> and
                adjust size from the controls above
              </li>
              <li>
                <span className="font-medium">Pick a color</span> from the color
                palette on the left
              </li>
              <li>
                <span className="font-medium">Follow the neon light areas</span>{" "}
                in the reference photo
              </li>
              <li>
                <span className="font-medium">Start painting</span> on the black
                & white canvas to bring it to life!
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
