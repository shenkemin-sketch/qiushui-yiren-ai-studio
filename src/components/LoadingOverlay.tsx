import React, { useState, useEffect } from 'react';
import { WorkflowModule } from '../types';

interface LoadingOverlayProps {
    module: WorkflowModule;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ module }) => {
    const messages = React.useMemo(() => {
        const baseMessages = [
            "CASTING MODELS...",
            "SETTING UP STUDIO LIGHTS...",
            "CALIBRATING TEXTURES...",
            "APPLYING COLOR GRADE...",
            "RENDERING FINAL SHOT..."
        ];

        if (module === 'still_life') {
            baseMessages[2] = "MACRO LENS FOCUSING...";
            baseMessages[3] = "ENHANCING MATERIAL PHYSICS...";
        }

        return baseMessages;
    }, [module]);

    const [msgIndex, setMsgIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMsgIndex((prev) => (prev + 1) % messages.length);
        }, 2000);
        return () => clearInterval(interval);
    }, [messages]);

    return (
        <div className="absolute inset-0 bg-white z-50 flex flex-col items-center justify-center animate-fade-in">
            <div className="flex flex-col items-center gap-8">
                <div className="w-20 h-20 border border-gray-900 flex items-center justify-center rounded-full animate-spin-slow">
                    <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                </div>

                <div className="flex flex-col items-center gap-3 text-center">
                    <p key={msgIndex} className="text-[11px] font-mono uppercase tracking-[0.25em] animate-fade-in text-gray-900">
                        {messages[msgIndex]}
                    </p>
                    <div className="h-px w-16 bg-gray-200 mt-4 overflow-hidden relative">
                        <div className="absolute inset-y-0 left-0 bg-gray-900 w-full animate-[shimmer_1.5s_infinite]"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
