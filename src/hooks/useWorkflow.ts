import { useState } from 'react';
import { WorkflowModule, ModelStats, DEFAULT_MODEL_STATS, AppState, ReferenceObject } from '../types';

export const useWorkflow = () => {
    const [appState, setAppState] = useState<AppState>('start');
    const [currentModule, setCurrentModule] = useState<WorkflowModule>('lookbook');
    const [referenceObjects, setReferenceObjects] = useState<ReferenceObject[]>([]);
    const [modelStats, setModelStats] = useState<ModelStats>(DEFAULT_MODEL_STATS);
    const [stylePrompt, setStylePrompt] = useState('');
    const [outputAspectRatio, setOutputAspectRatio] = useState<string>('auto');

    const resetWorkflow = () => {
        setAppState('start');
        setReferenceObjects([]);
        setModelStats(DEFAULT_MODEL_STATS);
        setStylePrompt('');
        setOutputAspectRatio('auto');
    };

    const enterEditor = (module: WorkflowModule, files: FileList | null, onInitialImageLoad: (url: string, ref: ReferenceObject) => void) => {
        setCurrentModule(module);

        if (files && files[0]) {
            const file = files[0];
            const newRef: ReferenceObject = {
                file,
                description: '',
                id: Date.now().toString(),
                purpose: 'baseModel',
            };
            setReferenceObjects([newRef]);

            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target?.result as string;
                onInitialImageLoad(imageUrl, newRef);
            };
            reader.readAsDataURL(file);
            setAppState('editor');
        } else {
            setReferenceObjects([]);
            setAppState('editor');
        }
    };

    return {
        appState,
        setAppState,
        currentModule,
        setCurrentModule,
        referenceObjects,
        setReferenceObjects,
        modelStats,
        setModelStats,
        stylePrompt,
        setStylePrompt,
        outputAspectRatio,
        setOutputAspectRatio,
        resetWorkflow,
        enterEditor
    };
};
