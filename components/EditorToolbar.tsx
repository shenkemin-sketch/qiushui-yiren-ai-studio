import React from 'react';
import { UndoIcon, RedoIcon, DownloadIcon } from './icons';

interface EditorToolbarProps {
    onUndo: () => void;
    onRedo: () => void;
    onRefine: () => void;
    onDownload: () => void;
    canUndo: boolean;
    canRedo: boolean;
    canRefine: boolean;
    canDownload: boolean;
    isLoading: boolean;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
    onUndo,
    onRedo,
    onRefine,
    onDownload,
    canUndo,
    canRedo,
    canRefine,
    canDownload,
    isLoading
}) => {
    return (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-[var(--bg-surface)] backdrop-blur-md shadow-[var(--shadow-custom)] border border-[var(--border-subtle)] py-3 px-8 flex items-center gap-8 transition-all duration-300 z-40 rounded-full">
            <div className="flex items-center gap-6">
                <button
                    onClick={onUndo}
                    disabled={!canUndo || isLoading}
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-20 transition-colors"
                    aria-label="Undo"
                >
                    <UndoIcon className="w-5 h-5" />
                </button>
                <button
                    onClick={onRedo}
                    disabled={!canRedo || isLoading}
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-20 transition-colors"
                    aria-label="Redo"
                >
                    <RedoIcon className="w-5 h-5" />
                </button>

                <div className="w-px h-5 bg-[var(--border-subtle)]"></div>

                <button
                    onClick={onRefine}
                    disabled={!canRefine || isLoading}
                    className="text-[var(--text-primary)] hover:text-[var(--brand-highlight)] disabled:opacity-20 transition-colors font-serif font-medium text-sm tracking-wider flex items-center gap-2"
                    aria-label="Refine"
                >
                    REFINE
                </button>

                <div className="w-px h-5 bg-[var(--border-subtle)]"></div>

                <button
                    onClick={onDownload}
                    disabled={!canDownload || isLoading}
                    className="text-[var(--text-primary)] hover:scale-110 disabled:opacity-20 transition-transform"
                    aria-label="Download"
                >
                    <DownloadIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
