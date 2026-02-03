
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect } from 'react';

interface EditorCanvasProps {
    imageUrl: string | null;
    isLoading?: boolean;
    onUploadClick?: () => void;
}

const EditorCanvas: React.FC<EditorCanvasProps> = ({ imageUrl, isLoading, onUploadClick }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });

    // Reset view when image changes
    useEffect(() => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    }, [imageUrl]);

    const handleWheel = (e: React.WheelEvent) => {
        if (!imageUrl) return;
        e.preventDefault();
        const scaleAmount = -e.deltaY * 0.001;
        const newScale = Math.min(Math.max(0.1, scale + scaleAmount), 5);

        // Simple center zoom for now to keep it robust
        setScale(newScale);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!imageUrl) return;
        setIsDragging(true);
        setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !imageUrl) return;
        setPosition({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleReset = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    return (
        <div className="relative w-full h-full bg-[#1A1A1A] overflow-hidden flex items-center justify-center select-none shadow-inner group">
            {/* Background Grid Pattern (Viewfinder effect) */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
            }}></div>

            {imageUrl ? (
                <div
                    ref={containerRef}
                    className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing relative z-10"
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    <img
                        src={imageUrl}
                        alt="Canvas"
                        style={{
                            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                        }}
                        className="max-w-[90%] max-h-[90%] object-contain shadow-2xl pointer-events-none"
                        draggable={false}
                    />

                    {/* Viewfinder Overlay Info */}
                    <div className="absolute bottom-4 right-4 bg-black/70 text-white/80 px-2 py-1 text-[11px] font-mono rounded backdrop-blur-md pointer-events-none flex gap-3">
                        <span>ZOOM: {Math.round(scale * 100)}%</span>
                        <span>POS: {Math.round(position.x)}, {Math.round(position.y)}</span>
                    </div>

                    {/* Reset Button */}
                    <button
                        onClick={handleReset}
                        className="absolute bottom-4 left-4 bg-white/10 hover:bg-white/20 text-white px-3 py-1 text-[11px] uppercase tracking-wider rounded backdrop-blur-md transition-colors"
                    >
                        Reset View
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-gray-500 z-10 gap-6">
                    <div className="w-32 h-32 border border-gray-700 flex items-center justify-center rounded-sm">
                        <span className="text-5xl font-serif text-gray-700 italic opacity-50">Ai</span>
                    </div>
                    <div className="text-center">
                        <p className="text-xs uppercase tracking-[0.2em] font-light text-gray-400 mb-2">Workspace Ready</p>
                        <p className="text-[11px] text-gray-600 font-mono">Upload content to begin session</p>
                    </div>
                    {onUploadClick && (
                        <button
                            onClick={onUploadClick}
                            className="text-xs border-b border-gray-600 text-gray-400 hover:text-gray-200 hover:border-gray-400 pb-1 transition-all"
                        >
                            Select Source Material
                        </button>
                    )}
                </div>
            )}

            {/* Loading Overlay built-in support */}
            {isLoading && (
                <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="animate-spin w-8 h-8 border-2 border-[var(--brand-accent-color)] border-t-transparent rounded-full"></div>
                </div>
            )}
        </div>
    );
};

export default EditorCanvas;
