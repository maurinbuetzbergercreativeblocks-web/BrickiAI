
import React, { useState } from 'react';
import { type GenerationOptions } from '../types.ts';

interface InputFormProps {
  onGenerate: (options: GenerationOptions) => void;
  isLoading: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onGenerate, isLoading }) => {
  const [prompt, setPrompt] = useState('Zytglogge');
  const [minParts, setMinParts] = useState('');
  const [maxParts, setMaxParts] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      const options: GenerationOptions = { prompt };
      const min = parseInt(minParts, 10);
      const max = parseInt(maxParts, 10);
      if (!isNaN(min) && min > 0) {
        options.minParts = min;
      }
      if (!isNaN(max) && max > 0) {
        options.maxParts = max;
      }
      onGenerate(options);
    }
  };
  
  return (
    <div className="card bg-white dark:bg-[#111827]/80 border border-gray-200 dark:border-white/10 p-6 rounded-xl shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
            Deine LEGO-Idee
          </label>
          <textarea
            id="prompt"
            rows={3}
            className="w-full bg-gray-50 dark:bg-[#0B1220] border border-gray-300 dark:border-[#FF9E4A]/20 rounded-lg p-3 text-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500 dark:focus:ring-[#FF7A00] focus:border-orange-500 dark:focus:border-[#FF7A00] transition-all"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="z.B. Ein klassischer roter Sportwagen, eine mittelalterliche Burg, ein futuristisches Raumschiff..."
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="min-parts" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Min. Teile (optional)
            </label>
            <input
              id="min-parts"
              type="number"
              className="w-full bg-gray-50 dark:bg-[#0B1220] border border-gray-300 dark:border-[#FF9E4A]/20 rounded-lg p-3 text-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500 dark:focus:ring-[#FF7A00] focus:border-orange-500 dark:focus:border-[#FF7A00] transition-all"
              value={minParts}
              onChange={(e) => setMinParts(e.target.value)}
              placeholder="z.B. 100"
              min="1"
            />
          </div>
          <div>
            <label htmlFor="max-parts" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Max. Teile (optional)
            </label>
            <input
              id="max-parts"
              type="number"
              className="w-full bg-gray-50 dark:bg-[#0B1220] border border-gray-300 dark:border-[#FF9E4A]/20 rounded-lg p-3 text-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500 dark:focus:ring-[#FF7A00] focus:border-orange-500 dark:focus:border-[#FF7A00] transition-all"
              value={maxParts}
              onChange={(e) => setMaxParts(e.target.value)}
              placeholder="z.B. 500"
              min={minParts ? parseInt(minParts, 10) + 1 : "2"}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-primary font-bold text-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white dark:text-[#081018] py-3 px-6 rounded-lg shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? 'Erstelle Set...' : 'LEGO-Set generieren'}
        </button>
      </form>
    </div>
  );
};
