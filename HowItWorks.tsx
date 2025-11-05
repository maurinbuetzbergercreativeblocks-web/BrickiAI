
import React from 'react';

export const HowItWorks: React.FC = () => {
    return (
        <div className="mt-8 card bg-white/50 dark:bg-transparent border border-gray-200 dark:border-white/5 p-6 rounded-xl">
            <h2 className="text-xl font-bold text-center mb-4 text-orange-500 dark:text-[#FF9E4A] glow-orange">So geht's</h2>
            <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="bg-gray-100 dark:bg-[#111827]/50 p-4 rounded-lg">
                    <div className="text-4xl mb-2 font-bold text-orange-400">1.</div>
                    <h3 className="font-semibold text-lg mb-1">Beschreiben</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Geben Sie eine kreative Idee für ein LEGO-Modell ein.</p>
                </div>
                <div className="bg-gray-100 dark:bg-[#111827]/50 p-4 rounded-lg">
                    <div className="text-4xl mb-2 font-bold text-orange-400">2.</div>
                    <h3 className="font-semibold text-lg mb-1">Modell generieren</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Die KI entwirft ein 3D-Modell und erstellt eine LDraw-Datei (.ldr) zum Download.</p>
                </div>
                <div className="bg-gray-100 dark:bg-[#111827]/50 p-4 rounded-lg">
                    <div className="text-4xl mb-2 font-bold text-orange-400">3.</div>
                    <h3 className="font-semibold text-lg mb-1">Visualisieren & Bauen</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Öffnen Sie die .ldr-Datei in 3D-Software (z.B. Studio 2.0), um das Set anzusehen und nachzubauen.</p>
                </div>
            </div>
        </div>
    );
}