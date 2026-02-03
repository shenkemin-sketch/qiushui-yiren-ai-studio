
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useState } from 'react';
import { XCircleIcon, MagicWandIcon } from './icons';
import Spinner from './Spinner';

interface ResultRefinerProps {
    imageUrl: string;
    onClose: () => void;
    onApplyRefinement: (mask: File, prompt: string) => Promise<void>;
}

const ResultRefiner: React.FC<ResultRefinerProps> = ({ imageUrl, onClose, onApplyRefinement }) => {
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const [prompt, setPrompt] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Box Selection State
    const [isDragging, setIsDragging] = useState(false);
    const [startPoint, setStartPoint] = useState<{ x: number, y: number } | null>(null);
    const [selectionBox, setSelectionBox] = useState<{ x: number, y: number, width: number, height: number } | null>(null);

    const getRelativeCoords = (e: React.MouseEvent | React.TouchEvent) => {
        if (!imageContainerRef.current) return { x: 0, y: 0 };
        const rect = imageContainerRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        if (isProcessing) return;
        setIsDragging(true);
        const coords = getRelativeCoords(e);
        setStartPoint(coords);
        setSelectionBox(null); // Clear previous selection on new drag
    };

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging || !startPoint || isProcessing) return;
        const current = getRelativeCoords(e);

        // Constrain to container bounds
        const container = imageContainerRef.current;
        if (!container) return;

        const xRaw = Math.min(startPoint.x, current.x);
        const yRaw = Math.min(startPoint.y, current.y);
        const widthRaw = Math.abs(current.x - startPoint.x);
        const heightRaw = Math.abs(current.y - startPoint.y);

        // Clamp to image area (optional, but good for UX)
        const x = Math.max(0, xRaw);
        const y = Math.max(0, yRaw);
        const width = Math.min(container.clientWidth - x, widthRaw);
        const height = Math.min(container.clientHeight - y, heightRaw);

        setSelectionBox({ x, y, width, height });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setStartPoint(null);
    };

    const handleApply = async () => {
        if (!prompt.trim()) return;

        setIsProcessing(true);
        try {
            const img = imageRef.current;

            // Create canvas for mask
            const maskCanvas = document.createElement('canvas');
            // If image is loaded, use its natural size
            maskCanvas.width = img?.naturalWidth || 1000;
            maskCanvas.height = img?.naturalHeight || 1000;

            const ctx = maskCanvas.getContext('2d');
            if (!ctx || !img) return;

            // 1. Fill Black (Protected/Unchanged)
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

            // 2. Fill White (Target/Changed)
            if (selectionBox) {
                // Calculate scale between displayed size and natural size
                const displayWidth = img.width;
                const displayHeight = img.height;
                const naturalWidth = img.naturalWidth;
                const naturalHeight = img.naturalHeight;

                const scaleX = naturalWidth / displayWidth;
                const scaleY = naturalHeight / displayHeight;

                const rectX = selectionBox.x * scaleX;
                const rectY = selectionBox.y * scaleY;
                const rectW = selectionBox.width * scaleX;
                const rectH = selectionBox.height * scaleY;

                // FEATHERING: Apply blur to soften edges
                ctx.filter = 'blur(12px)';
                ctx.fillStyle = 'white';
                ctx.fillRect(rectX, rectY, rectW, rectH);
                ctx.filter = 'none'; // Reset
            } else {
                // If no box selected but prompt exists, assume Global Edit (Full White Mask)
                // or user forgot to select. The prompt says "拖拽画框...不画框则进行全图风格化重绘".
                // So if no box, fill white completely.
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
            }

            const blob = await new Promise<Blob | null>(r => maskCanvas.toBlob(r, 'image/png'));
            if (blob) {
                const file = new File([blob], "refinement_mask.png", { type: "image/png" });
                await onApplyRefinement(file, prompt);
            }

        } catch (e) {
            console.error(e);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 animate-fade-in">
            {/* Canvas / Image Area */}
            <div className="relative w-full max-w-4xl max-h-[75vh] flex items-center justify-center bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
                <div
                    ref={imageContainerRef}
                    className="relative cursor-crosshair touch-none"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleMouseDown}
                    onTouchMove={handleMouseMove}
                    onTouchEnd={handleMouseUp}
                >
                    <img
                        ref={imageRef}
                        src={imageUrl}
                        alt="Base"
                        className="max-w-full max-h-[75vh] object-contain block pointer-events-none select-none"
                        draggable={false}
                    />

                    {selectionBox && (
                        <div
                            className="absolute border-2 border-[var(--brand-accent-color)] bg-[var(--brand-accent-color)]/20"
                            style={{
                                left: selectionBox.x,
                                top: selectionBox.y,
                                width: selectionBox.width,
                                height: selectionBox.height,
                                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)' // Dim outside
                            }}
                        />
                    )}
                </div>
            </div>

            <div className="mt-4 w-full max-w-xl bg-white rounded-xl p-3 flex flex-col gap-3 shadow-2xl">
                <div className="flex items-center gap-3">
                    <div className="flex-1">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="告诉 AI 怎么改 (如: 把红色改成蓝色，去除褶皱)"
                            className="w-full text-sm border border-gray-300 focus:border-[var(--brand-accent-color)] focus:ring-1 focus:ring-[var(--brand-accent-color)] px-3 py-2 text-gray-900 bg-white placeholder:text-gray-400 rounded-md"
                            disabled={isProcessing}
                            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                        />
                    </div>
                    <div className="h-6 w-px bg-gray-200"></div>
                    {selectionBox && (
                        <button
                            onClick={() => setSelectionBox(null)}
                            className="text-xs text-gray-500 hover:text-red-500 font-medium whitespace-nowrap"
                            disabled={isProcessing}
                        >
                            清除选区
                        </button>
                    )}
                    <button
                        onClick={handleApply}
                        disabled={!prompt || isProcessing}
                        className="btn btn-primary py-2 px-4 text-sm flex items-center gap-2 whitespace-nowrap"
                    >
                        {isProcessing ? <Spinner className="w-4 h-4" /> : <MagicWandIcon className="w-4 h-4" />}
                        开始修图
                    </button>
                </div>
            </div>

            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
                <XCircleIcon className="w-8 h-8" />
            </button>

            <div className="absolute top-4 left-4 text-white/90 text-xs bg-black/60 px-4 py-3 rounded-lg pointer-events-none backdrop-blur-md shadow-lg border border-white/10">
                <p className="font-bold text-[var(--brand-accent-color)] mb-1">💡 摄影师提示：</p>
                <ul className="list-disc pl-4 space-y-1">
                    <li>在主图模特上拖拽画框，可指定 AI 仅修改该区域（如换衣服）。</li>
                    <li>不画框则进行全图风格化重绘（保持模特身份）。</li>
                </ul>
            </div>
        </div>
    );
};

export default ResultRefiner;
