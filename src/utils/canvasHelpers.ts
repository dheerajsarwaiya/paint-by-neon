export const getCursorPosition = (
  canvas: HTMLCanvasElement,
  event: MouseEvent | TouchEvent,
  scale: number,
  offsetX: number,
  offsetY: number
): { x: number; y: number } => {
  const rect = canvas.getBoundingClientRect();

  let clientX: number, clientY: number;

  if (event instanceof MouseEvent) {
    clientX = event.clientX;
    clientY = event.clientY;
  } else {
    clientX = event.touches[0].clientX;
    clientY = event.touches[0].clientY;
  }

  const x = (clientX - rect.left - offsetX) / scale;
  const y = (clientY - rect.top - offsetY) / scale;

  return { x, y };
};

export const drawLine = (
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  size: number,
  isEraser: boolean
) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = size;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (isEraser) {
    ctx.globalCompositeOperation = "destination-out";
  } else {
    ctx.globalCompositeOperation = "source-over";
  }

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
};

export const loadImageToCanvas = (
  imageDataUrl: string,
  canvas: HTMLCanvasElement
  // opacity: number
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // ctx.globalAlpha = opacity;
        ctx.filter = "blur(4px)";
        ctx.drawImage(img, 0, 0);
        ctx.filter = "none";
        ctx.globalAlpha = 1;
      }
      resolve();
    };
    img.onerror = reject;
    img.src = imageDataUrl;
  });
};
