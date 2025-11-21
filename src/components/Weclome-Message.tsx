import React from "react";
import ImageUploader from "./ImageUploader";

interface WeclomeMessageProps {
  handleImageUpload: (
    dataUrl: string,
    sketchUrl: string,
    colors?: string[]
  ) => void;
  handleLoadProgress: (file: File) => void;
}

export function WeclomeMessage({
  handleImageUpload,
  handleLoadProgress,
}: WeclomeMessageProps) {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="max-w-2xl p-8 text-center bg-white shadow-lg rounded-2xl">
        <h2 className="mb-4 text-3xl font-bold text-gray-500">
          Welcome to <span className="text-amber-500">Paint By</span>
          <span className="text-[#39FF14] [-webkit-text-stroke:1px_#374151] [text-stroke:1px_#374151]">
            {" "}
            Neon
          </span>
        </h2>
        <img
          src="/images/home.webp"
          alt="Paint By Neon"
          className="w-full mx-auto mb-4"
        />
        {/* <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-600">
         <Palette className="text-[#39FF14]" size={40} />
        </div> */}
        <p className="mt-6 mb-6 text-lg font-bold leading-relaxed text-gray-600">
          Transform any image into a{" "}
          <span className="text-xl font-bold text-amber-500 ">
            Masterpiece{" "}
          </span>
          and bring it to life with your creativity.
        </p>
        <div className="p-6 mb-6 text-left bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
          <h3 className="mb-3 text-xl font-semibold text-gray-800">
            Getting Started:
          </h3>
          <ol className="space-y-3 text-gray-700">
            <li className="flex items-center gap-3 ">
              <span className="flex items-center justify-center flex-shrink-0 text-sm font-semibold text-white rounded-full w-7 h-7 bg-amber-500">
                1
              </span>
              <span className="pt-0.5 flex items-center gap-2">
                <ImageUploader
                  onImageUpload={handleImageUpload}
                  onProjectLoad={handleLoadProgress}
                />
                to choose a photo you'd like to paint
              </span>
            </li>{" "}
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center flex-shrink-0 text-sm font-semibold text-white rounded-full w-7 h-7 bg-amber-500">
                2
              </span>
              <span className="pt-0.5">
                <strong>Start painting</strong> - We create a sketch, provide a
                color palette, and a color highlighter tool that can help you
                paint the right color in the right places.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center flex-shrink-0 text-sm font-semibold text-white rounded-full w-7 h-7 bg-amber-500">
                3
              </span>
              <span className="pt-0.5">
                <strong>Paint offline</strong> - If you prefer hardcopy, take a
                printout of the sketch and use our mixer tool to get the right
                color for offline painting.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center flex-shrink-0 text-sm font-semibold text-white rounded-full w-7 h-7 bg-amber-500">
                4
              </span>
              <span className="pt-0.5">
                <strong>Save your progress</strong> - Export your artwork or
                save your work file to continue later
              </span>
            </li>
          </ol>
        </div>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <div className="text-sm text-gray-500">
            Already have a saved project?
          </div>
          <button
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = ".paintbyneon,.paintoverart";

              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];

                if (file) {
                  handleLoadProgress(file);
                }
              };

              input.click();
            }}
            className="px-6 py-2 text-sm font-medium text-white transition-colors bg-gray-700 rounded-lg hover:bg-gray-800"
          >
            Load Existing Work
          </button>
        </div>
      </div>
    </div>
  );
}
