import { GoogleGenAI, Type } from "@google/genai";
import { type GenerationOptions, type LegoSet } from '../types.ts';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
const model = 'gemini-2.5-pro';

/**
 * Generates a complete LEGO build instruction set from a user prompt.
 */
export async function generateLegoInstructions(options: GenerationOptions): Promise<LegoSet> {
    const { prompt, minParts, maxParts } = options;

    const systemPrompt = `
      Du bist ein Experte für das Design von LEGO-Modellen und arbeitest wie ein präziser, fehlervermeidender Bau-Algorithmus.
      Deine Hauptaufgabe ist es, aus einem Text-Prompt ein komplettes, kreatives und **physisch 100% korrekt baubares** LEGO-3D-Modell zu entwerfen.
      Das wichtigste Ergebnis deiner Arbeit ist die exakte 3D-Platzierung jedes einzelnen Teils ('placed_parts'), um eine LDraw (.ldr) Datei zu erstellen. Ein fehlerhaftes 3D-Modell ist eine komplett falsche Antwort.

      **Wissensbasis:**
      - Dein Wissen über LEGO-Teile basiert auf der offiziellen LDraw-Teilebibliothek (library.ldraw.org). Verwende korrekte Dateinamen wie '3001.dat'.
      - Deine Fähigkeit, Modelle zu bauen, wurde durch die Analyse tausender offizieller LEGO-Sets trainiert (Beispiele unter seymouria.pl). Halte dich an bewährte Bautechniken.

      **PHYSIKALISCHE REGELN (ABSOLUT UNVERLETZBAR - KRITISCHES FEHLERKriterium):**
      1.  **KEINE SCHWEBENDEN TEILE:** Jedes Teil (außer der Grundplatte) MUSS physisch von mindestens einem anderen Teil getragen werden. Es muss eine durchgehende, stabile Verbindung zur Grundplatte geben. Überprüfe bei jedem Stein, ob seine Unterseite Kontakt mit einer Noppe (stud) oder einer anderen legalen Verbindungsfläche eines darunterliegenden Steins hat.
      2.  **KEINE KOLLISIONEN/ÜBERLAPPUNGEN:** Kein Teil darf den Raum eines anderen Teils auch nur minimal durchdringen. Die Volumina der Teile dürfen sich niemals überschneiden. Behandle jeden Stein als festes, undurchdringbares Objekt.

      **Deine neue Vorgehensweise (Stein-für-Stein-Methode mit doppelter Prüfung):**
      Du MUSST diesem Prozess exakt und rigoros folgen:

      1.  **Grundplattenerstellung:** Wähle als ALLERERSTEN Schritt eine passende Grundplatte in einer passenden Größe und Farbe für das Modell. Alle weiteren Teile werden auf dieser Platte aufgebaut. Die Grundplatte liegt auf Y=0.

      2.  **Iterativer Aufbau:** Baue das Modell Stein für Stein auf. Für jeden neuen Stein, den du hinzufügst, folge diesem Denkprozess:
          a. **Teileauswahl & Farbwahl:** Wähle den nächsten logischen Stein und die beste Farbe.
          b. **Positions-Analyse:** Evaluiere alle möglichen, legalen Positionen für diesen Stein auf dem bisherigen Modell.
          c. **PRÜFUNG 1 (Vor-Platzierung):** Überprüfe die gewählte Position GEGEN DIE PHYSIKALISCHEN REGELN. Schwebt das Teil? Kollidiert es? Wenn ja, ist die Position UNGÜLTIG. Finde eine andere Position oder ein anderes Teil. Wiederhole dies, bis eine gültige Position gefunden ist.
          d. **Platzierung:** Wenn die Prüfung erfolgreich ist, füge den Stein mit seiner Position und Rotation zu deiner internen 3D-Modell-Liste hinzu.

      3.  **FINALE VERIFIZIERUNG (OBLIGATORISCH):**
          Nachdem ALLE Steine platziert sind, führe einen kompletten Verifizierungslauf durch. Gehe durch JEDEN EINZELNEN STEIN deines fertigen Modells (außer der Grundplatte) und überprüfe ihn erneut auf die Einhaltung der PHYSIKALISCHEN REGELN.
          - **Prüfung A:** Hat dieser Stein eine gültige Verbindung nach unten?
          - **Prüfung B:** Kollidiert dieser Stein mit irgendeinem anderen Stein im gesamten Modell?
          Wenn du auch nur EINE EINZIGE Verletzung findest, MUSST du das Modell an dieser Stelle korrigieren, bevor du die Ausgabe erstellst.

      4.  **Daten-Generierung:** ERST NACHDEM die finale Verifizierung erfolgreich und ohne Fehler abgeschlossen wurde, erstelle das JSON-Objekt.

      **Zusätzliche Einschränkungen:**
      - Wenn eine minimale oder maximale Teileanzahl vorgegeben ist, MUSST du diese exakt einhalten.

      Deine Ausgabe MUSS ein einziges, valides JSON-Objekt sein, das dem vorgegebenen Schema entspricht und ein fehlerfreies Modell repräsentiert.
    `;
    
    let userPrompt = `Erstelle ein LEGO-Set für das folgende Konzept: "${prompt}"`;

    if (minParts || maxParts) {
        let constraint = "";
        if (minParts && maxParts) {
            constraint = `mit einer Gesamtteileanzahl zwischen ${minParts} und ${maxParts} Teilen`;
        } else if (minParts) {
            constraint = `mit mindestens ${minParts} Teilen`;
        } else { // maxParts must be defined here
            constraint = `mit maximal ${maxParts} Teilen`;
        }
        userPrompt += `. Das Modell soll ${constraint}.`;
    }
    
    const positionSchema = {
        type: Type.OBJECT,
        properties: {
            x: { type: Type.NUMBER },
            y: { type: Type.NUMBER },
            z: { type: Type.NUMBER }
        },
        required: ["x", "y", "z"]
    };

    const placedPartSchema = {
        type: Type.OBJECT,
        properties: {
            part_file: { type: Type.STRING, description: "Der LDraw-Dateiname des Teils, z.B. '3001.dat'" },
            color_id: { type: Type.INTEGER },
            position: positionSchema,
            matrix: { type: Type.ARRAY, items: { type: Type.NUMBER }, description: "Eine 9-elementige Rotationsmatrix." }
        },
        required: ["part_file", "color_id", "position", "matrix"]
    };

    const buildStepSchema = {
        type: Type.OBJECT,
        properties: {
            step: { type: Type.INTEGER },
            instructions: { type: Type.STRING },
            image_prompt: { type: Type.STRING, description: "Ein detaillierter Prompt für eine Bild-KI, um diesen Bauschritt zu visualisieren." }
        },
        required: ["step", "instructions", "image_prompt"]
    };

    const partSchema = {
        type: Type.OBJECT,
        properties: {
            part_num: { type: Type.STRING },
            part_name: { type: Type.STRING },
            color_id: { type: Type.INTEGER },
            color_name: { type: Type.STRING },
            quantity: { type: Type.INTEGER }
        },
        required: ["part_num", "part_name", "color_id", "color_name", "quantity"]
    };

    const legoSetSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            parts_count: { type: Type.INTEGER, description: "Die Anzahl der einzigartigen Teile-Typen." },
            parts: { type: Type.ARRAY, items: partSchema },
            placed_parts: { type: Type.ARRAY, items: placedPartSchema, description: "3D-Platzierung für jeden einzelnen Stein zur LDR-Generierung." },
            build_steps: { type: Type.ARRAY, items: buildStepSchema }
        },
        required: ["title", "description", "parts_count", "parts", "placed_parts", "build_steps"]
    };
    
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: userPrompt,
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: 'application/json',
                responseSchema: legoSetSchema,
                thinkingConfig: { thinkingBudget: 32768 }
            },
        });
        const responseText = response.text.trim();
        if (!responseText) {
            throw new Error("Leere JSON-Antwort vom Modell erhalten.");
        }
        return JSON.parse(responseText);
    } catch (error) {
        console.error("Fehler bei der Kommunikation mit der Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`Fehler bei der Kommunikation mit der Gemini API: ${error.message}`);
        }
        throw new Error("Ein unbekannter API-Fehler ist aufgetreten.");
    }
}
