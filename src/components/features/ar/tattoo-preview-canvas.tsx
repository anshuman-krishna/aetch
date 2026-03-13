'use client';

import { useRef, useEffect, useCallback, useState, forwardRef, useImperativeHandle } from 'react';

export interface PreviewTransform {
  positionX: number;
  positionY: number;
  scale: number;
  rotation: number;
  opacity: number;
}

interface TattooPreviewCanvasProps {
  bodyImageUrl: string | null;
  tattooImageUrl: string | null;
  transform: PreviewTransform;
  onTransformChange: (t: PreviewTransform) => void;
  className?: string;
}

const MAX_CANVAS_SIZE = 1024;

// downscale image for performance
function fitImage(img: HTMLImageElement): { w: number; h: number } {
  const { naturalWidth: w, naturalHeight: h } = img;
  if (w <= MAX_CANVAS_SIZE && h <= MAX_CANVAS_SIZE) return { w, h };
  const ratio = Math.min(MAX_CANVAS_SIZE / w, MAX_CANVAS_SIZE / h);
  return { w: Math.round(w * ratio), h: Math.round(h * ratio) };
}

export const TattooPreviewCanvas = forwardRef<HTMLCanvasElement, TattooPreviewCanvasProps>(
  function TattooPreviewCanvas({ bodyImageUrl, tattooImageUrl, transform, onTransformChange, className }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const bodyImgRef = useRef<HTMLImageElement | null>(null);
    const tattooImgRef = useRef<HTMLImageElement | null>(null);
    const [canvasSize, setCanvasSize] = useState({ w: 600, h: 600 });
    const dragging = useRef(false);
    const lastPos = useRef({ x: 0, y: 0 });

    // expose canvas ref to parent
    useImperativeHandle(ref, () => canvasRef.current!, []);

    // load body image
    useEffect(() => {
      if (!bodyImageUrl) { bodyImgRef.current = null; return; }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        bodyImgRef.current = img;
        const size = fitImage(img);
        setCanvasSize(size);
      };
      img.src = bodyImageUrl;
    }, [bodyImageUrl]);

    // load tattoo image
    useEffect(() => {
      if (!tattooImageUrl) { tattooImgRef.current = null; return; }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => { tattooImgRef.current = img; };
      img.src = tattooImageUrl;
    }, [tattooImageUrl]);

    // render canvas
    const draw = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // draw body
      if (bodyImgRef.current) {
        ctx.drawImage(bodyImgRef.current, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // draw tattoo overlay
      if (tattooImgRef.current && bodyImgRef.current) {
        const tattoo = tattooImgRef.current;
        const tx = (transform.positionX / 100) * canvas.width;
        const ty = (transform.positionY / 100) * canvas.height;
        const tw = tattoo.naturalWidth * transform.scale * 0.5;
        const th = tattoo.naturalHeight * transform.scale * 0.5;

        ctx.save();
        ctx.translate(tx, ty);
        ctx.rotate((transform.rotation * Math.PI) / 180);
        ctx.globalAlpha = transform.opacity;
        // multiply blend for skin
        ctx.globalCompositeOperation = 'multiply';
        ctx.drawImage(tattoo, -tw / 2, -th / 2, tw, th);
        // screen pass for visibility
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = transform.opacity * 0.3;
        ctx.drawImage(tattoo, -tw / 2, -th / 2, tw, th);
        ctx.restore();
      }
    }, [transform]);

    // redraw on changes
    useEffect(() => {
      const id = requestAnimationFrame(draw);
      return () => cancelAnimationFrame(id);
    }, [draw, canvasSize, bodyImageUrl, tattooImageUrl]);

    // drag to reposition
    const handlePointerDown = (e: React.PointerEvent) => {
      if (!bodyImgRef.current || !tattooImgRef.current) return;
      dragging.current = true;
      lastPos.current = { x: e.clientX, y: e.clientY };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
      if (!dragging.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dx = ((e.clientX - lastPos.current.x) / rect.width) * 100;
      const dy = ((e.clientY - lastPos.current.y) / rect.height) * 100;
      lastPos.current = { x: e.clientX, y: e.clientY };
      onTransformChange({
        ...transform,
        positionX: Math.min(100, Math.max(0, transform.positionX + dx)),
        positionY: Math.min(100, Math.max(0, transform.positionY + dy)),
      });
    };

    const handlePointerUp = () => { dragging.current = false; };

    return (
      <canvas
        ref={canvasRef}
        width={canvasSize.w}
        height={canvasSize.h}
        className={className}
        style={{ cursor: tattooImgRef.current ? 'grab' : 'default', touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
    );
  },
);
