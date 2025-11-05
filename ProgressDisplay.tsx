import React from 'react';
import { ProgressBar } from './ProgressBar';

interface ProgressDisplayProps {
    progress: number;
    message: string;
    elapsedTime: number;
    estimatedTime: number;
}

export const ProgressDisplay: React.FC<ProgressDisplayProps> = ({ progress, message, elapsedTime, estimatedTime }) => {
    const remainingTime = Math.max(0, estimatedTime - elapsedTime);
    const formattedRemainingTime = remainingTime > 0 ? `~${Math.round(remainingTime)}s verbleibend` : 'Finalisiere...';

    return (
        <div className="mt-8 flex flex-col items-center justify-center p-6 bg-white dark:bg-[#111827]/50 border border-gray-200 dark:border-white/10 rounded-xl shadow-md">
            <p className="text-lg font-semibold text-orange-500 dark:text-[#FF9E4A] glow-orange">{message}</p>
            <ProgressBar progress={progress} />
            <div className="w-full flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                <span>Fortschritt</span>
                <span>{formattedRemainingTime}</span>
            </div>
        </div>
    );
};
