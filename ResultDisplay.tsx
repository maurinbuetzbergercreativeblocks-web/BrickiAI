
import React from 'react';
import { type LegoSet } from '../types.ts';
import { CameraIcon } from './icons/CameraIcon.tsx';
import { DownloadIcon } from './icons/DownloadIcon.tsx';

interface ResultDisplayProps {
  legoSet: LegoSet;
  ldrFileContent: string | null;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ legoSet, ldrFileContent }) => {
  const totalParts = (legoSet.parts || []).reduce((sum, p) => sum + p.quantity, 0);

  const handleDownload = () => {
    if (!ldrFileContent) return;

    const blob = new Blob([ldrFileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeFilename = legoSet.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    a.download = `${safeFilename || 'bricki_ai_model'}.ldr`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  return (
    <div className="mt-8 space-y-6">
      <div className="card bg-white dark:bg-[#111827]/80 border border-gray-200 dark:border-white/10 p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-2xl font-bold text-orange-500 dark:text-[#FF9E4A] glow-orange">{legoSet.title}</h2>
                <p className="text-gray-600 dark:text-gray-300 mt-1">{legoSet.description}</p>
            </div>
            <button
                onClick={handleDownload}
                disabled={!ldrFileContent}
                className="ml-4 flex-shrink-0 flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white dark:text-[#081018] py-2 px-4 rounded-lg shadow-md hover:shadow-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <DownloadIcon />
                <span className="font-semibold">Download .LDR</span>
            </button>
        </div>
        <div className="grid grid-cols-2 gap-4 text-center mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
          <div className="bg-gray-100 dark:bg-[#0B1220]/70 p-3 rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-400">Teile-Typen</div>
            <div className="text-2xl font-bold">{legoSet.parts_count}</div>
          </div>
          <div className="bg-gray-100 dark:bg-[#0B1220]/70 p-3 rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-400">Gesamtteile</div>
            <div className="text-2xl font-bold">{totalParts}</div>
          </div>
        </div>
        {legoSet.rebrickable_validation && (
             <div className="bg-gray-100 dark:bg-[#0B1220]/70 p-3 rounded-lg mt-4">
                <div className="text-sm text-gray-500 dark:text-gray-400 text-center">Rebrickable-Verifizierung</div>
                <div className={`text-base font-semibold pt-1 text-center ${legoSet.rebrickable_validation.verified_count === legoSet.rebrickable_validation.total_count ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                    {legoSet.rebrickable_validation.verified_count} / {legoSet.rebrickable_validation.total_count} Teile-Typen verifiziert
                </div>
            </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Parts List */}
        <div className="lg:col-span-1 card bg-white dark:bg-[#111827]/80 border border-gray-200 dark:border-white/10 p-4 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-3 text-orange-500 dark:text-[#FF9E4A]">Stückliste</h3>
          <div className="h-96 overflow-auto pr-2">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-[#0B1220] sticky top-0">
                <tr>
                  <th scope="col" className="px-2 py-2">Menge</th>
                  <th scope="col" className="px-2 py-2">Name</th>
                  <th scope="col" className="px-2 py-2">Teil-Nr.</th>
                </tr>
              </thead>
              <tbody>
                {legoSet.parts.map((part, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-white/10">
                    <td className="px-2 py-2 font-medium">{part.quantity}x</td>
                    <td className="px-2 py-2">{part.part_name}</td>
                    <td className="px-2 py-2 text-gray-500 dark:text-gray-400 font-mono text-xs">{part.part_num.replace('.dat', '')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Build Instructions */}
        <div className="lg:col-span-2 card bg-white dark:bg-[#111827]/80 border border-gray-200 dark:border-white/10 p-4 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-3 text-orange-500 dark:text-[#FF9E4A]">Bauanleitung</h3>
          <div className="space-y-4 h-96 overflow-auto pr-2">
            {legoSet.build_steps.map((step) => (
              <div key={step.step} className="p-4 rounded-lg bg-gray-50 dark:bg-[#0B1220]/70 border border-gray-200 dark:border-white/10">
                <p className="font-bold text-orange-500 dark:text-orange-400">Schritt {step.step}</p>
                <p className="mt-1 text-gray-700 dark:text-gray-300">{step.instructions}</p>
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-white/10">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <CameraIcon />
                        VISUALISIERUNGS-PROMPT
                    </p>
                    <p className="text-xs font-mono text-gray-500 dark:text-gray-500 mt-1">{step.image_prompt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
