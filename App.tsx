
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { InputForm } from './components/InputForm.tsx';
import { ResultDisplay } from './components/ResultDisplay.tsx';
import { HowItWorks } from './components/HowItWorks.tsx';
import { Status, type LegoSet, type GenerationOptions } from './types.ts';
import { generateLegoInstructions } from './services/geminiService.ts';
import { enrichLegoSetWithRebrickableData } from './services/rebrickableService.ts';
import { assembleLdrFromSet } from './services/ldrawValidator.ts';
import { ProgressDisplay } from './components/ProgressDisplay.tsx';
import Adsense from './components/Adsense.tsx';

const ESTIMATED_GENERATION_TIME_S = 45; // seconds

const PROGRESS_STAGES = [
    { duration: 0.10, message: 'Analysiere den Prompt...' },
    { duration: 0.25, message: 'Entwerfe die Kernstruktur...' },
    { duration: 0.40, message: 'Platziere Details und Verzierungen...' },
    { duration: 0.15, message: 'Führe Physik-Verifizierung durch...' },
    { duration: 0.10, message: 'Generiere die finale LDR-Datei...' },
];

const App: React.FC = () => {
  const [status, setStatus] = useState<Status>(Status.Idle);
  const [resultJson, setResultJson] = useState<LegoSet | null>(null);
  const [ldrFileContent, setLdrFileContent] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  
  // State for progress display
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<number | null>(null);

  // Function to clear timer
  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Effect to clear timer on unmount
  useEffect(() => {
    return () => clearTimer();
  }, []);

  const resetState = () => {
    setStatus(Status.Idle);
    setError('');
    setResultJson(null);
    setLdrFileContent(null);
    // Reset progress state
    clearTimer();
    setProgress(0);
    setProgressMessage('');
    setElapsedTime(0);
  };

  const startProgressSimulation = () => {
    let cumulativeDuration = 0;
    const stageEndPercentages = PROGRESS_STAGES.map(stage => {
        cumulativeDuration += stage.duration;
        return cumulativeDuration * 100;
    });

    setElapsedTime(0);
    setProgress(0);
    setProgressMessage(PROGRESS_STAGES[0].message);

    timerRef.current = window.setInterval(() => {
        setElapsedTime(prevTime => {
            const newTime = prevTime + 1;
            const currentProgress = (newTime / ESTIMATED_GENERATION_TIME_S) * 100;

            let stageIndex = stageEndPercentages.findIndex(endPercentage => currentProgress < endPercentage);
            if (stageIndex === -1) stageIndex = PROGRESS_STAGES.length - 1; // Last stage

            setProgressMessage(PROGRESS_STAGES[stageIndex].message);
            setProgress(Math.min(99, currentProgress)); // Don't let it reach 100% until done

            if (newTime >= ESTIMATED_GENERATION_TIME_S) {
                 // Keep waiting, the API call is the source of truth
            }
            return newTime;
        });
    }, 1000);
  };

  const handleGenerate = useCallback(async (options: GenerationOptions) => {
    resetState();
    setStatus(Status.Loading);
    startProgressSimulation();

    try {
        const initialSet = await generateLegoInstructions(options);
        
        const validatedSet = await enrichLegoSetWithRebrickableData(initialSet);
        setResultJson(validatedSet);

        // Now, assemble the LDR file
        const { ldrContent } = await assembleLdrFromSet(validatedSet);
        setLdrFileContent(ldrContent);
        
        clearTimer();
        setProgress(100);
        setStatus(Status.Success);

    } catch (err) {
      console.error('Fehler bei der Generierung:', err);
      const errorMessage = err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten.';
      setError(errorMessage);
      setStatus(Status.Error);
      clearTimer(); // Stop timer on error
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-b dark:from-[#0B0D0F] dark:to-[#071014] text-gray-800 dark:text-[#E6EEF6] transition-colors duration-300">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <InputForm onGenerate={handleGenerate} isLoading={status === Status.Loading} />
          <HowItWorks />

          <Adsense />
          
          {status === Status.Loading && (
            <ProgressDisplay 
                progress={progress}
                message={progressMessage}
                elapsedTime={elapsedTime}
                estimatedTime={ESTIMATED_GENERATION_TIME_S}
            />
          )}

          {status === Status.Error && (
            <div className="mt-8 p-6 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 rounded-xl text-red-700 dark:text-red-300">
              <h3 className="font-bold text-lg">Generierung fehlgeschlagen</h3>
              <p>{error}</p>
            </div>
          )}

          {status === Status.Success && resultJson && (
            <ResultDisplay 
              legoSet={resultJson}
              ldrFileContent={ldrFileContent}
            />
          )}

        </div>
      </main>
    </div>
  );
};
