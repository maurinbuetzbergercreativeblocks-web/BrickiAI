import React from 'react';

interface ProgressBarProps {
    progress: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
    const clampedProgress = Math.min(100, Math.max(0, progress));

    return (
        <div className="w-full bg-[#0B1220] rounded-full h-4 mt-4 border border-white/10">
            <div
                className="bg-gradient-to-r from-[#FF9E4A] to-[#FF7A00] h-full rounded-full transition-all duration-500 ease-out flex items-center justify-center text-xs font-bold text-black"
                style={{ width: `${clampedProgress}%` }}
            >
               {clampedProgress > 10 && `${Math.round(clampedProgress)}%`}
            </div>
        </div>
    );
};
