'use client';

import { useState, useRef, MouseEvent } from 'react';

interface ProductZoomProps {
  src: string;
  alt: string;
}

export default function ProductZoom({ src, alt }: ProductZoomProps) {
  const [zoomStyle, setZoomStyle] = useState({
    backgroundImage: `url(${src})`,
    backgroundPosition: '0% 0%',
    display: 'none',
  });
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    // Calculate mouse position in percentage (0 to 100)
    const xPercent = (x / width) * 100;
    const yPercent = (y / height) * 100;

    setZoomStyle({
      backgroundImage: `url(${src})`,
      backgroundPosition: `${xPercent}% ${yPercent}%`,
      display: 'block',
    });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setZoomStyle(prev => ({ ...prev, display: 'none' }));
  };

  return (
    <div className="relative w-full aspect-square bg-[#F5F5F0] rounded-xl overflow-hidden shadow-sm border border-neutral-100 group">
      {/* Container Element */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="w-full h-full cursor-zoom-in relative"
        id="amazon-style-zoom-container"
      >
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isHovering ? 'opacity-30' : 'opacity-100'}`}
          referrerPolicy="no-referrer"
        />

        {/* Dynamic Zoomed-In Overlay */}
        <div
          style={zoomStyle}
          className="absolute inset-0 pointer-events-none bg-no-repeat bg-[length:220%] transition-opacity duration-150"
          id="amazon-style-zoom-overlay"
        />
      </div>

      {/* Floating Instructions Indicator */}
      <div className="absolute bottom-3 left-3 bg-white/85 text-neutral-900 border border-neutral-200 px-2 py-1 rounded text-[10px] font-mono select-none tracking-tight">
        LENTE DE ZOOM +
      </div>
    </div>
  );
}
