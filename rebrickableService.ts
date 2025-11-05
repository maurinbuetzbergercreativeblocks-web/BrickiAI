import { type LegoSet } from '../types';

const REBRICKABLE_API_KEY = '7d8f130303c393a5ccf41d2ca7bee5f8';
const API_BASE_URL = 'https://rebrickable.com/api/v3/lego';

interface RebrickablePart {
    part_num: string;
    name: string;
    part_cat_id: number;
}

export async function enrichLegoSetWithRebrickableData(legoSet: LegoSet): Promise<LegoSet> {
    if (!legoSet.parts || legoSet.parts.length === 0) {
        return { ...legoSet, rebrickable_validation: { verified_count: 0, total_count: 0 } };
    }

    // Filter out parts that are missing a part_num to prevent crashes.
    const validParts = legoSet.parts.filter(p => p && typeof p.part_num === 'string');
    const invalidParts = legoSet.parts.filter(p => !p || typeof p.part_num !== 'string');

    const uniquePartNums = [...new Set(validParts.map(p => p.part_num.replace(/\.dat$/i, '')))];
    if (uniquePartNums.length === 0) {
       return { 
           ...legoSet, 
           parts: invalidParts, // Return original set with only invalid parts if no valid ones exist
           rebrickable_validation: { verified_count: 0, total_count: 0 } 
        };
    }

    const CHUNK_SIZE = 150; // Max part_nums per request seems to be around 200
    const partNumChunks: string[][] = [];
    for (let i = 0; i < uniquePartNums.length; i += CHUNK_SIZE) {
        partNumChunks.push(uniquePartNums.slice(i, i + CHUNK_SIZE));
    }

    const rebrickablePartsMap = new Map<string, RebrickablePart>();

    try {
        for (const chunk of partNumChunks) {
            const partNumsStr = chunk.join(',');
            const response = await fetch(`${API_BASE_URL}/parts/?part_nums=${partNumsStr}`, {
                headers: {
                    'Authorization': `key ${REBRICKABLE_API_KEY}`
                }
            });

            if (!response.ok) {
                console.error(`Rebrickable API request failed: ${response.status} ${response.statusText}`);
                const errorText = await response.text();
                console.error('Rebrickable error body:', errorText);
                continue; 
            }

            const data = await response.json();
            if (data.results) {
                data.results.forEach((part: RebrickablePart) => {
                    rebrickablePartsMap.set(part.part_num, part);
                });
            }
        }

        const enrichedParts = validParts.map(p => {
            const cleanPartNum = p.part_num.replace(/\.dat$/i, '');
            const rebrickablePart = rebrickablePartsMap.get(cleanPartNum);
            if (rebrickablePart) {
                return { ...p, part_name: rebrickablePart.name };
            }
            return p;
        });
        
        const totalUniqueParts = uniquePartNums.length;
        const verifiedUniqueParts = rebrickablePartsMap.size;

        return {
            ...legoSet,
            parts: [...enrichedParts, ...invalidParts], // Combine valid and invalid parts back together
            rebrickable_validation: {
                verified_count: verifiedUniqueParts,
                total_count: totalUniqueParts,
            }
        };

    } catch (error) {
        console.error("Error connecting to Rebrickable API:", error);
        return {
            ...legoSet,
            rebrickable_validation: { verified_count: 0, total_count: uniquePartNums.length, error: "API connection failed" }
        };
    }
}
