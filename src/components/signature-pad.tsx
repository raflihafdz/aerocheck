'use client';

import { useRef, useState, useEffect } from 'react';

interface SignaturePadProps {
  onSignatureCapture: (signature: string) => void;
  onCancel: () => void;
}

export function SignaturePad({ onSignatureCapture, onCancel }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    // Set white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set drawing properties
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000';

    setContext(ctx);
  }, []);

  const getCoordinates = (e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e && e.touches.length > 0) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * (canvas.width / rect.width),
        y: (touch.clientY - rect.top) * (canvas.height / rect.height),
      };
    } else if ('clientX' in e) {
      return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height),
      };
    }
    return { x: 0, y: 0 };
  };

  const handleStart = (e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas || !context) return;

    const { x, y } = getCoordinates(e);

    setIsDrawing(true);
    context.beginPath();
    context.moveTo(x, y);
  };

  const handleMove = (e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing || !context) return;

    const { x, y } = getCoordinates(e);

    context.lineTo(x, y);
    context.stroke();
  };

  const handleEnd = (e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(false);
    if (context) {
      context.closePath();
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas || !context) return;

    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleCapture = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const signature = canvas.toDataURL('image/png');
    onSignatureCapture(signature);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" 
      style={{ touchAction: 'none' }}
      onTouchMove={(e) => e.preventDefault()}
    >
      <div 
        className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4"
        onTouchMove={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4">Tanda Tangan Digital</h3>
        
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden mb-4 bg-white" style={{ height: '300px', touchAction: 'none' }}>
          <canvas
            ref={canvasRef}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
            className="w-full h-full cursor-crosshair"
            style={{ touchAction: 'none', display: 'block' }}
          />
        </div>

        <div className="text-sm text-gray-500 mb-4">Tanda tangan di atas dengan mouse atau touchpad</div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={handleClear}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
          >
            Hapus
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            onClick={handleCapture}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Simpan Tanda Tangan
          </button>
        </div>
      </div>
    </div>
  );
}
