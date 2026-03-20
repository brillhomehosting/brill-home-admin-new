import { cn } from '@/shared/utils';
import {
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Contact,
    Download,
    Minus,
    Plus,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

type IDCardViewerProps = {
  open: boolean;
  onClose: () => void;
  customerName: string;
  updatedAt: string;
  frontImage: string;
  backImage: string;
  initialIndex?: 0 | 1;
};

export function IDCardViewer({
  open,
  onClose,
  customerName,
  updatedAt,
  frontImage,
  backImage,
  initialIndex = 0,
}: IDCardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState<0 | 1>(initialIndex);
  const [zoom, setZoom] = useState(100);

  // Reset state when opened
  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
      setZoom(100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setCurrentIndex(1);
      if (e.key === 'ArrowLeft') setCurrentIndex(0);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const images = [
    { src: frontImage, label: 'Mặt trước' },
    { src: backImage, label: 'Mặt sau' },
  ];

  const currentImage = images[currentIndex];

  const handleZoomOut = () => setZoom((z) => Math.max(z - 25, 50));
  const handleZoomIn = () => setZoom((z) => Math.min(z + 25, 200));

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
    >
      {/* Lightbox Container */}
      <div className="relative flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-[#262423] shadow-2xl animate-zoom-in">
        
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex px-1 items-center justify-center rounded text-accent-500 bg-accent-500/10">
              <Contact className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white sm:text-base">
                CCCD {currentImage.label} — {customerName}
              </h2>
              <p className="text-xs text-white/50">Cập nhật: {updatedAt}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* View Toggle */}
            <div className="flex items-center gap-1 rounded-full bg-white/5 p-1">
              <button
                onClick={() => setCurrentIndex(0)}
                className={cn(
                  'rounded-full px-4 py-1.5 text-xs font-semibold transition-colors',
                  currentIndex === 0
                    ? 'bg-accent-500 text-white'
                    : 'text-white/60 hover:text-white'
                )}
              >
                Mặt trước
              </button>
              <button
                onClick={() => setCurrentIndex(1)}
                className={cn(
                  'rounded-full px-4 py-1.5 text-xs font-semibold transition-colors',
                  currentIndex === 1
                    ? 'bg-accent-500 text-white'
                    : 'text-white/60 hover:text-white'
                )}
              >
                Mặt sau
              </button>
            </div>

            {/* Separator */}
            <div className="h-6 w-px bg-white/10" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="text-white/60 transition-colors hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Viewing Area */}
        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-auto bg-[#262423] p-8">
            <img
            src={currentImage.src}
            alt={currentImage.label}
            style={{ 
                transform: `scale(${zoom / 100})`, 
                transformOrigin: 'center',
                transition: 'transform 0.2s ease-out'
            }}
            className="max-h-full max-w-full rounded-md object-contain shadow-sm"
            draggable={false}
            />

            {/* Left/Right Navigation */}
            <button
            onClick={() => setCurrentIndex(0)}
            className="absolute left-8 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-black/40 p-3 text-white backdrop-blur transition-all hover:bg-black/60 disabled:opacity-30 disabled:hover:bg-black/40"
            disabled={currentIndex === 0}
            >
            <ChevronLeft className="h-6 w-6" />
            </button>
            <button
            onClick={() => setCurrentIndex(1)}
            className="absolute right-8 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-black/40 p-3 text-white backdrop-blur transition-all hover:bg-black/60 disabled:opacity-30 disabled:hover:bg-black/40"
            disabled={currentIndex === 1}
            >
            <ChevronRight className="h-6 w-6" />
            </button>
        </div>

        {/* Footer Controls Floating Component */}
        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-4 rounded-full bg-[#1A1918]/80 px-4 py-3 backdrop-blur-md border border-white/5">
          {/* Zoom Controls */}
          <div className="flex items-center gap-3">
            <button 
                onClick={handleZoomOut}
                className="text-white/60 hover:text-white transition-colors disabled:opacity-50"
                disabled={zoom <= 50}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-10 text-center text-xs font-semibold text-white/90">
              {zoom}%
            </span>
            <button 
                onClick={handleZoomIn}
                className="text-white/60 hover:text-white transition-colors disabled:opacity-50"
                disabled={zoom >= 200}    
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="mx-2 h-4 w-px bg-white/10" />

          {/* Current Page */}
          <span className="rounded bg-white/10 px-2 py-1 text-xs font-medium text-white/90">
            {currentIndex + 1} / 2
          </span>

          <div className="mx-2 h-4 w-px bg-white/10" />

          {/* Actions */}
          <button className="flex items-center gap-1.5 rounded-full border border-white/20 bg-transparent px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/10">
            <Download className="h-3.5 w-3.5" />
            Tải về
          </button>
          <button className="flex items-center gap-1.5 rounded-full bg-accent-500 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-600 shadow-lg shadow-accent-500/20">
            <CheckCircle className="h-3.5 w-3.5" />
            Xác thực
          </button>
        </div>

      </div>
    </div>
  );
}
