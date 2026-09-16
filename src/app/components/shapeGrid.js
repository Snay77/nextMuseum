"use client";

import { useRef, useEffect } from 'react';

const ShapeGrid = ({
  direction = 'right',
  speed = 1,
  borderColor = '#999',
  squareSize = 40,
  size,
  hoverFillColor = '#222',
  hoverColor,
  shape = 'square',
  hoverTrailAmount = 0,
  imageUrls = [],
  className = ''
}) => {
  const effectiveSquareSize = size ?? squareSize;
  const effectiveHoverFillColor = hoverColor ?? hoverFillColor;
  const imageUrlsKey = imageUrls.join('|');
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const numSquaresX = useRef();
  const numSquaresY = useRef();
  const gridOffset = useRef({ x: 0, y: 0 });
  const hoveredSquare = useRef(null);
  const trailCells = useRef([]);
  const cellOpacities = useRef(new Map());
  const loadedImages = useRef(new Map());

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const isHex = shape === 'hexagon';
    const isTri = shape === 'triangle';
    const hexHoriz = effectiveSquareSize * 1.5;
    const hexVert = effectiveSquareSize * Math.sqrt(3);
    const patternSize = Math.max(1, imageUrls.length);

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      numSquaresX.current = Math.ceil(canvas.width / effectiveSquareSize) + 1;
      numSquaresY.current = Math.ceil(canvas.height / effectiveSquareSize) + 1;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const drawHex = (cx, cy, size) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const vx = cx + size * Math.cos(angle);
        const vy = cy + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(vx, vy);
        else ctx.lineTo(vx, vy);
      }
      ctx.closePath();
    };

    const drawCircle = (cx, cy, size) => {
      ctx.beginPath();
      ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
      ctx.closePath();
    };

    const drawTriangle = (cx, cy, size, flip) => {
      ctx.beginPath();
      if (flip) {
        ctx.moveTo(cx, cy + size / 2);
        ctx.lineTo(cx + size / 2, cy - size / 2);
        ctx.lineTo(cx - size / 2, cy - size / 2);
      } else {
        ctx.moveTo(cx, cy - size / 2);
        ctx.lineTo(cx + size / 2, cy + size / 2);
        ctx.lineTo(cx - size / 2, cy + size / 2);
      }
      ctx.closePath();
    };

    const getImageForCell = cellKey => {
      if (imageUrls.length === 0) return null;

      let hash = 0;
      for (let index = 0; index < cellKey.length; index += 1) {
        hash = (hash * 31 + cellKey.charCodeAt(index)) | 0;
      }

      const imageIndex = Math.abs(hash) % imageUrls.length;
      return loadedImages.current.get(imageUrls[imageIndex]);
    };

    const wrapIndex = (value, size) => ((value % size) + size) % size;

    const getCellKey = (col, row, cellWidth, cellHeight = cellWidth) => {
      const worldCol = col - Math.floor(gridOffset.current.x / cellWidth);
      const worldRow = row - Math.floor(gridOffset.current.y / cellHeight);

      return `${wrapIndex(worldCol, patternSize)},${wrapIndex(worldRow, patternSize)}`;
    };

    const getInteractionCellKey = cell => {
      const cellWidth = isHex
        ? hexHoriz
        : isTri
          ? effectiveSquareSize / 2
          : effectiveSquareSize;
      const cellHeight = isHex
        ? hexVert
        : isTri
          ? effectiveSquareSize
          : effectiveSquareSize;

      return getCellKey(cell.x, cell.y, cellWidth, cellHeight);
    };

    const drawImageCover = (image, x, y, width, height, drawShape) => {
      if (!image) return;

      const imageRatio = image.naturalWidth / image.naturalHeight;
      const targetRatio = width / height;
      let sourceX = 0;
      let sourceY = 0;
      let sourceWidth = image.naturalWidth;
      let sourceHeight = image.naturalHeight;

      if (imageRatio > targetRatio) {
        sourceWidth = image.naturalHeight * targetRatio;
        sourceX = (image.naturalWidth - sourceWidth) / 2;
      } else {
        sourceHeight = image.naturalWidth / targetRatio;
        sourceY = (image.naturalHeight - sourceHeight) / 2;
      }

      ctx.save();
      ctx.beginPath();
      drawShape();
      ctx.clip();
      ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
      ctx.restore();
    };

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isHex) {
        const colShift = Math.floor(gridOffset.current.x / hexHoriz);
        const offsetX = ((gridOffset.current.x % hexHoriz) + hexHoriz) % hexHoriz;
        const offsetY = ((gridOffset.current.y % hexVert) + hexVert) % hexVert;

        const cols = Math.ceil(canvas.width / hexHoriz) + 3;
        const rows = Math.ceil(canvas.height / hexVert) + 3;

        for (let col = -2; col < cols; col++) {
          for (let row = -2; row < rows; row++) {
            const cx = col * hexHoriz + offsetX;
            const cy = row * hexVert + ((col + colShift) % 2 !== 0 ? hexVert / 2 : 0) + offsetY;

            const cellKey = getCellKey(col, row, hexHoriz, hexVert);
            const alpha = cellOpacities.current.get(cellKey);
            const image = getImageForCell(cellKey);
            drawImageCover(
              image,
              cx - effectiveSquareSize,
              cy - effectiveSquareSize,
              effectiveSquareSize * 2,
              effectiveSquareSize * 2,
              () => drawHex(cx, cy, effectiveSquareSize),
            );
            if (alpha) {
              ctx.globalAlpha = alpha;
              drawHex(cx, cy, squareSize);
              ctx.fillStyle = effectiveHoverFillColor;
              ctx.fill();
              ctx.globalAlpha = 1;
            }

            drawHex(cx, cy, effectiveSquareSize);
            ctx.strokeStyle = borderColor;
            ctx.stroke();
          }
        }
      } else if (isTri) {
        const halfW = squareSize / 2;
        const colShift = Math.floor(gridOffset.current.x / halfW);
        const rowShift = Math.floor(gridOffset.current.y / squareSize);
        const offsetX = ((gridOffset.current.x % halfW) + halfW) % halfW;
        const offsetY = ((gridOffset.current.y % squareSize) + squareSize) % squareSize;

        const cols = Math.ceil(canvas.width / halfW) + 4;
        const rows = Math.ceil(canvas.height / squareSize) + 4;

        for (let col = -2; col < cols; col++) {
          for (let row = -2; row < rows; row++) {
            const cx = col * halfW + offsetX;
            const cy = row * squareSize + squareSize / 2 + offsetY;
            const flip = ((col + colShift + row + rowShift) % 2 + 2) % 2 !== 0;

            const cellKey = getCellKey(col, row, halfW, squareSize);
            const alpha = cellOpacities.current.get(cellKey);
            const image = getImageForCell(cellKey);
            drawImageCover(
              image,
              cx - effectiveSquareSize / 2,
              cy - effectiveSquareSize / 2,
              effectiveSquareSize,
              effectiveSquareSize,
              () => drawTriangle(cx, cy, effectiveSquareSize, flip),
            );
            if (alpha) {
              ctx.globalAlpha = alpha;
              drawTriangle(cx, cy, effectiveSquareSize, flip);
              ctx.fillStyle = effectiveHoverFillColor;
              ctx.fill();
              ctx.globalAlpha = 1;
            }

            drawTriangle(cx, cy, effectiveSquareSize, flip);
            ctx.strokeStyle = borderColor;
            ctx.stroke();
          }
        }
      } else if (shape === 'circle') {
        const offsetX = ((gridOffset.current.x % squareSize) + squareSize) % squareSize;
        const offsetY = ((gridOffset.current.y % squareSize) + squareSize) % squareSize;

        const cols = Math.ceil(canvas.width / squareSize) + 3;
        const rows = Math.ceil(canvas.height / squareSize) + 3;

        for (let col = -2; col < cols; col++) {
          for (let row = -2; row < rows; row++) {
            const cx = col * squareSize + squareSize / 2 + offsetX;
            const cy = row * squareSize + squareSize / 2 + offsetY;

            const cellKey = getCellKey(col, row, squareSize);
            const alpha = cellOpacities.current.get(cellKey);
            const image = getImageForCell(cellKey);
            drawImageCover(
              image,
              cx - effectiveSquareSize / 2,
              cy - effectiveSquareSize / 2,
              effectiveSquareSize,
              effectiveSquareSize,
              () => drawCircle(cx, cy, effectiveSquareSize),
            );
            if (alpha) {
              ctx.globalAlpha = alpha;
              drawCircle(cx, cy, effectiveSquareSize);
              ctx.fillStyle = effectiveHoverFillColor;
              ctx.fill();
              ctx.globalAlpha = 1;
            }

            drawCircle(cx, cy, effectiveSquareSize);
            ctx.strokeStyle = borderColor;
            ctx.stroke();
          }
        }
      } else {
        const offsetX = ((gridOffset.current.x % effectiveSquareSize) + effectiveSquareSize) % effectiveSquareSize;
        const offsetY = ((gridOffset.current.y % effectiveSquareSize) + effectiveSquareSize) % effectiveSquareSize;

        const cols = Math.ceil(canvas.width / effectiveSquareSize) + 3;
        const rows = Math.ceil(canvas.height / effectiveSquareSize) + 3;

        for (let col = -2; col < cols; col++) {
          for (let row = -2; row < rows; row++) {
            const sx = col * effectiveSquareSize + offsetX;
            const sy = row * effectiveSquareSize + offsetY;

            const cellKey = getCellKey(col, row, effectiveSquareSize);
            const alpha = cellOpacities.current.get(cellKey);
            const image = getImageForCell(cellKey);
            drawImageCover(
              image,
              sx,
              sy,
              effectiveSquareSize,
              effectiveSquareSize,
              () => {
                ctx.rect(sx, sy, effectiveSquareSize, effectiveSquareSize);
              },
            );
            if (alpha) {
              ctx.globalAlpha = alpha;
              ctx.fillStyle = effectiveHoverFillColor;
              ctx.fillRect(sx, sy, effectiveSquareSize, effectiveSquareSize);
              ctx.globalAlpha = 1;
            }

            ctx.strokeStyle = borderColor;
            ctx.strokeRect(sx, sy, effectiveSquareSize, effectiveSquareSize);
          }
        }
      }

      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.sqrt(canvas.width ** 2 + canvas.height ** 2) / 2
      );
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    let lastFrameTime = 0;
    const frameInterval = 1000 / 30;

    const updateAnimation = timestamp => {
      if (timestamp - lastFrameTime < frameInterval) {
        requestRef.current = requestAnimationFrame(updateAnimation);
        return;
      }

      lastFrameTime = timestamp;
      const effectiveSpeed = Math.max(speed, 0.1);
      const wrapX = (isHex ? hexHoriz * 2 : effectiveSquareSize) * patternSize;
      const wrapY = (isHex ? hexVert : isTri ? effectiveSquareSize * 2 : effectiveSquareSize) * patternSize;

      switch (direction) {
        case 'right':
          gridOffset.current.x =
            (gridOffset.current.x - effectiveSpeed + wrapX) % wrapX;
          break;
        case 'left':
          gridOffset.current.x =
            (gridOffset.current.x + effectiveSpeed + wrapX) % wrapX;
          break;
        case 'up':
          gridOffset.current.y =
            (gridOffset.current.y + effectiveSpeed + wrapY) % wrapY;
          break;
        case 'down':
          gridOffset.current.y =
            (gridOffset.current.y - effectiveSpeed + wrapY) % wrapY;
          break;
        case 'diagonal':
          gridOffset.current.x =
            (gridOffset.current.x - effectiveSpeed + wrapX) % wrapX;
          gridOffset.current.y =
            (gridOffset.current.y - effectiveSpeed + wrapY) % wrapY;
          break;
        default:
          break;
      }

      updateCellOpacities();
      drawGrid();
      requestRef.current = requestAnimationFrame(updateAnimation);
    };

    imageUrls.filter(Boolean).forEach(src => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => {
        loadedImages.current.set(src, image);
        drawGrid();
      };
      image.src = src;
    });

    const updateCellOpacities = () => {
      const targets = new Map();

      if (hoveredSquare.current) {
        targets.set(getInteractionCellKey(hoveredSquare.current), 1);
      }

      if (hoverTrailAmount > 0) {
        for (let i = 0; i < trailCells.current.length; i++) {
          const t = trailCells.current[i];
          const key = getInteractionCellKey(t);
          if (!targets.has(key)) {
            targets.set(key, (trailCells.current.length - i) / (trailCells.current.length + 1));
          }
        }
      }

      for (const [key] of targets) {
        if (!cellOpacities.current.has(key)) {
          cellOpacities.current.set(key, 0);
        }
      }

      for (const [key, opacity] of cellOpacities.current) {
        const target = targets.get(key) || 0;
        const next = opacity + (target - opacity) * 0.15;
        if (next < 0.005) {
          cellOpacities.current.delete(key);
        } else {
          cellOpacities.current.set(key, next);
        }
      }
    };

    const handleMouseMove = event => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      if (isHex) {
        const colShift = Math.floor(gridOffset.current.x / hexHoriz);
        const offsetX = ((gridOffset.current.x % hexHoriz) + hexHoriz) % hexHoriz;
        const offsetY = ((gridOffset.current.y % hexVert) + hexVert) % hexVert;
        const adjustedX = mouseX - offsetX;
        const adjustedY = mouseY - offsetY;

        const col = Math.round(adjustedX / hexHoriz);
        const rowOffset = (col + colShift) % 2 !== 0 ? hexVert / 2 : 0;
        const row = Math.round((adjustedY - rowOffset) / hexVert);

        if (
          !hoveredSquare.current ||
          hoveredSquare.current.x !== col ||
          hoveredSquare.current.y !== row
        ) {
          if (hoveredSquare.current && hoverTrailAmount > 0) {
            trailCells.current.unshift({ ...hoveredSquare.current });
            if (trailCells.current.length > hoverTrailAmount) trailCells.current.length = hoverTrailAmount;
          }
          hoveredSquare.current = { x: col, y: row };
        }
      } else if (isTri) {
        const halfW = squareSize / 2;
        const offsetX = ((gridOffset.current.x % halfW) + halfW) % halfW;
        const offsetY = ((gridOffset.current.y % squareSize) + squareSize) % squareSize;

        const adjustedX = mouseX - offsetX;
        const adjustedY = mouseY - offsetY;

        const col = Math.round(adjustedX / halfW);
        const row = Math.floor(adjustedY / squareSize);

        if (
          !hoveredSquare.current ||
          hoveredSquare.current.x !== col ||
          hoveredSquare.current.y !== row
        ) {
          if (hoveredSquare.current && hoverTrailAmount > 0) {
            trailCells.current.unshift({ ...hoveredSquare.current });
            if (trailCells.current.length > hoverTrailAmount) trailCells.current.length = hoverTrailAmount;
          }
          hoveredSquare.current = { x: col, y: row };
        }
      } else if (shape === 'circle') {
        const offsetX = ((gridOffset.current.x % squareSize) + squareSize) % squareSize;
        const offsetY = ((gridOffset.current.y % squareSize) + squareSize) % squareSize;

        const adjustedX = mouseX - offsetX;
        const adjustedY = mouseY - offsetY;

        const col = Math.round(adjustedX / squareSize);
        const row = Math.round(adjustedY / squareSize);

        if (
          !hoveredSquare.current ||
          hoveredSquare.current.x !== col ||
          hoveredSquare.current.y !== row
        ) {
          if (hoveredSquare.current && hoverTrailAmount > 0) {
            trailCells.current.unshift({ ...hoveredSquare.current });
            if (trailCells.current.length > hoverTrailAmount) trailCells.current.length = hoverTrailAmount;
          }
          hoveredSquare.current = { x: col, y: row };
        }
      } else {
        const offsetX = ((gridOffset.current.x % squareSize) + squareSize) % squareSize;
        const offsetY = ((gridOffset.current.y % squareSize) + squareSize) % squareSize;

        const adjustedX = mouseX - offsetX;
        const adjustedY = mouseY - offsetY;

        const col = Math.floor(adjustedX / squareSize);
        const row = Math.floor(adjustedY / squareSize);

        if (
          !hoveredSquare.current ||
          hoveredSquare.current.x !== col ||
          hoveredSquare.current.y !== row
        ) {
          if (hoveredSquare.current && hoverTrailAmount > 0) {
            trailCells.current.unshift({ ...hoveredSquare.current });
            if (trailCells.current.length > hoverTrailAmount) trailCells.current.length = hoverTrailAmount;
          }
          hoveredSquare.current = { x: col, y: row };
        }
      }
    };

    const handleMouseLeave = () => {
      if (hoveredSquare.current && hoverTrailAmount > 0) {
        trailCells.current.unshift({ ...hoveredSquare.current });
        if (trailCells.current.length > hoverTrailAmount) trailCells.current.length = hoverTrailAmount;
      }
      hoveredSquare.current = null;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    let isVisible = false;
    let isPageVisible = !document.hidden;

    const tryStart = () => {
      if (isVisible && isPageVisible && !requestRef.current) {
        requestRef.current = requestAnimationFrame(updateAnimation);
      }
    };
    const tryStop = () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        isVisible ? tryStart() : tryStop();
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    const onVisibility = () => {
      isPageVisible = !document.hidden;
      isPageVisible ? tryStart() : tryStop();
    };
    document.addEventListener('visibilitychange', onVisibility);

    tryStart();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      tryStop();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [direction, speed, borderColor, effectiveHoverFillColor, effectiveSquareSize, shape, hoverTrailAmount, imageUrlsKey]);

  return <canvas ref={canvasRef} className={`shapegrid-canvas ${className}`}></canvas>;
};

export default ShapeGrid;
