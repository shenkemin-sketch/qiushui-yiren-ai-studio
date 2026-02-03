import { useState } from 'react';
import { type ReferenceObject } from '../types';

interface HistoryState {
    image: string;
    references: ReferenceObject[];
}

export const useHistory = () => {
    const [history, setHistory] = useState<HistoryState[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

    const updateHistory = (imageUrl: string, references: ReferenceObject[]) => {
        const newHistoryState: HistoryState = { image: imageUrl, references: [...references] };
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newHistoryState);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        setGeneratedImageUrl(imageUrl);
    };

    const undo = (onRestoreReferences: (refs: ReferenceObject[]) => void) => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setGeneratedImageUrl(history[newIndex].image);
            onRestoreReferences(history[newIndex].references);
        }
    };

    const redo = (onRestoreReferences: (refs: ReferenceObject[]) => void) => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setGeneratedImageUrl(history[newIndex].image);
            onRestoreReferences(history[newIndex].references);
        }
    };

    const resetHistory = (initialImage?: string, initialRefs?: ReferenceObject[]) => {
        if (initialImage && initialRefs) {
            const newState: HistoryState = { image: initialImage, references: initialRefs };
            setHistory([newState]);
            setHistoryIndex(0);
            setGeneratedImageUrl(initialImage);
        } else {
            setHistory([]);
            setHistoryIndex(-1);
            setGeneratedImageUrl(null);
        }
    };

    return {
        history,
        historyIndex,
        generatedImageUrl,
        setGeneratedImageUrl,
        updateHistory,
        undo,
        redo,
        resetHistory
    };
};
