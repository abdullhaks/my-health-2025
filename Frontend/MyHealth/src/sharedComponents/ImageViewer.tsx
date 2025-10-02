import React, { useState, useEffect } from 'react';
import { FaTimes, FaExpand, FaCompress, FaFilePdf } from 'react-icons/fa';

interface ImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
  description?: string;
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
  description
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [scale, setScale] = useState(0.5);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Fallback URL for invalid or missing imageUrl
  const fallbackImageUrl = "https://myhealth-app-storage.s3.ap-south-1.amazonaws.com/users/profile-images/avatar.png";
  const validImageUrl = imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '' ? imageUrl : fallbackImageUrl;

  // Check if the file is a PDF
  const isPdf = validImageUrl.toLowerCase().endsWith('.pdf');

  useEffect(() => {
    console.log("image url...is ", validImageUrl);

    if (isOpen) {
      setImageError(false);
      setScale(0.5);
      setPosition({ x: 0, y: 0 });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, validImageUrl]);

  const handleImageError = () => {
    console.error("Failed to load image:", validImageUrl);
    setImageError(true);
  };

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScale(parseFloat(e.target.value));
  };

  const handleResetZoom = () => {
    setScale(0.5);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (scale > 1 && e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && scale > 1 && e.touches.length === 1) {
      e.preventDefault();
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Pinch-to-zoom support
  // const handleTouchPinch = (e: React.TouchEvent) => {
  //   if (e.touches.length === 2) {
  //     e.preventDefault();
  //     const touch1 = e.touches[0];
  //     const touch2 = e.touches[1];
  //     const distance = Math.hypot(
  //       touch1.clientX - touch2.clientX,
  //       touch1.clientY - touch2.clientY
  //     );
  //     // Store initial distance in a ref or state for comparison (simplified here)
  //     // This is a basic implementation; for production, consider using a library like react-zoom-pan-pinch
  //     // For simplicity, we'll adjust scale based on pinch distance changes
  //     // Note: This requires additional state management for robust pinch-to-zoom
  //   }
  // };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" >
      {/* Modal Container */}
      <div className={`relative flex flex-col w-full h-full ${isFullscreen ? 'p-0' : 'max-w-[90vw] max-h-[90vh] sm:max-w-4xl md:max-w-5xl lg:max-w-6xl p-4 sm:p-6 md:p-8'}`}>
        
        {/* Header */}
        <div className="relative z-10 flex items-center justify-between p-4 bg-gray-900/80 backdrop-blur-sm rounded-t-lg mb-2 shadow-lg">
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="text-white text-lg sm:text-xl md:text-2xl font-semibold truncate">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-gray-300 text-sm sm:text-base truncate mt-1">
                {description}
              </p>
            )}
          </div>
          
          {/* Control Buttons */}
          <div className="flex items-center gap-3 sm:gap-4 ml-4">
            <div className="flex items-center gap-2">
              <span className="text-white text-sm sm:text-base hidden sm:inline">Zoom:</span>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.1"
                value={scale}
                onChange={handleZoomChange}
                className="w-20 sm:w-24 md:w-32 accent-blue-600"
                title="Adjust Zoom"
              />
              <span className="text-white text-sm sm:text-base">{Math.round(scale * 100)}%</span>
            </div>
            
            <button
              onClick={handleResetZoom}
              className="px-2 sm:px-3 py-1 text-white bg-gray-700 hover:bg-gray-600 rounded-lg text-sm sm:text-base transition-colors duration-200"
              title="Reset Zoom"
            >
              Reset
            </button>
            
            <div
              onClick={() => setIsFullscreen(!isFullscreen)}
              className=" flex justify-center items-center text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200 min-w-[44px] min-h-[44px]"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <FaCompress size={16} /> : <FaExpand size={16} />}
            </div>
            
            <div
              onClick={onClose}
              className="flex justify-center items-center text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200 min-w-[44px] min-h-[44px]"
              title="Close"
            >
              <FaTimes size={16} />
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div 
          className="flex-1 flex items-center justify-center overflow-hidden rounded-lg bg-gray-900 shadow-lg"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchStart={isPdf ? undefined : handleTouchStart}
        >
          {imageError && !isPdf && (
            <div className="flex flex-col items-center gap-4 text-center p-4 sm:p-6 md:p-8">
              <div className="text-red-400 text-4xl sm:text-5xl md:text-6xl">⚠️</div>
              <p className="text-white text-base sm:text-lg md:text-xl">Failed to load image</p>
              <p className="text-gray-400 text-sm sm:text-base">The image URL might be expired or invalid</p>
              <a
                href={validImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm sm:text-base transition-colors duration-200 min-w-[120px]"
              >
                View Original File
              </a>
            </div>
          )}
          
          {!imageError && !isPdf && (
            <img
              src={validImageUrl}
              alt={title || 'Document'}
              className={`max-w-none transition-transform duration-200 ${isDragging ? 'cursor-grabbing' : scale > 1 ? 'cursor-grab' : 'cursor-default'}`}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                maxHeight: isFullscreen ? '100vh' : 'calc(100vh - 200px)',
                maxWidth: isFullscreen ? '100vw' : 'calc(100vw - 100px)',
                objectFit: 'contain'
              }}
              onError={handleImageError}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              draggable={false}
            />
          )}
          
          {isPdf && (
            <div className="flex flex-col items-center gap-4 text-center p-4 sm:p-6 md:p-8">
              <FaFilePdf className="text-red-600 text-4xl sm:text-5xl md:text-6xl" />
              <p className="text-white text-base sm:text-lg md:text-xl">PDF Document</p>
              <p className="text-gray-400 text-sm sm:text-base">This file is a PDF. Click below to view it.</p>
              <a
                href={validImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm sm:text-base transition-colors duration-200 min-w-[120px]"
              >
                Open PDF
              </a>
            </div>
          )}
        </div>
        
        {/* Extra Close Button */}
        <div className="p-4 sm:p-6 text-center">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm sm:text-base transition-colors duration-200 flex items-center justify-center gap-2 mx-auto min-w-[120px] min-h-[44px]"
          >
            <FaTimes size={16} />
            Close Viewer
          </button>
        </div>

        {/* Mobile Touch Instructions */}
        <div className="sm:hidden text-center p-2">
          <p className="text-gray-400 text-xs sm:text-sm">
            Pinch to zoom • Drag to pan when zoomed
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageViewer;