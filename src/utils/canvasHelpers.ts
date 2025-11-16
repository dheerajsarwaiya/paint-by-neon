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
  isEraser: boolean,
  opacity: number = 0.4
) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = size;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (!isEraser) {
    ctx.globalAlpha = opacity;
  }

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

export const drawSpray = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  size: number,
  opacity: number = 0.4,
  density: number = 50
) => {
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = opacity;
  ctx.globalCompositeOperation = "source-over";

  // Draw multiple small dots in a circular area
  const radius = size / 2;
  for (let i = 0; i < density; i++) {
    // Random angle and distance from center
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * radius;
    
    const dotX = x + Math.cos(angle) * distance;
    const dotY = y + Math.sin(angle) * distance;
    
    // Draw small dot (size varies slightly for more natural look)
    const dotSize = Math.random() * 1.5 + 0.5;
    ctx.beginPath();
    ctx.arc(dotX, dotY, dotSize, 0, Math.PI * 2);
    ctx.fill();
  }

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
