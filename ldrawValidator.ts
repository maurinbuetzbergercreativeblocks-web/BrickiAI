
import { type LegoSet, type PlacedPart } from '../types.ts';

async function calculateSha256(str: string): Promise<string> {
    try {
        const textAsBuffer = new TextEncoder().encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', textAsBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    } catch (e) {
        console.error("SHA-256 calculation failed:", e);
        return "sha256-calculation-failed";
    }
}


export async function assembleLdrFromSet(legoSet: LegoSet): Promise<{ ldrContent: string, sha256: string }> {

    if (!legoSet || !legoSet.placed_parts || legoSet.placed_parts.length === 0) {
        console.error("LDR Assembler received invalid LegoSet object or empty placed_parts.");
        return { ldrContent: "0 ERROR: Invalid data or no placed parts received by LDR assembler.", sha256: "" };
    }
    
    const ldrFilename = legoSet.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.ldr';

    const header = [
        `0 ${legoSet.title || 'Untitled Model'}`,
        `0 Name: ${ldrFilename}`,
        `0 Author: BrickiAI`,
        `0 Unofficial Model`,
        `0`,
        `0 Total Parts: ${legoSet.parts.reduce((sum, p) => sum + p.quantity, 0)}`,
        `0 Unique Parts: ${legoSet.parts_count}`,
        `0`,
    ].join('\r\n');

    const body = legoSet.placed_parts.map((p: PlacedPart) => {
        // LDraw format: 1 <colour> <x> <y> <z> <a b c d e f g h i> <file>
        const pos = p.position;
        // Ensure matrix has exactly 9 numbers
        const matrix = (p.matrix && p.matrix.length === 9) 
            ? p.matrix.join(' ') 
            : '1 0 0 0 1 0 0 0 1'; // Default to identity matrix if invalid

        return `1 ${p.color_id} ${pos.x} ${pos.y} ${pos.z} ${matrix} ${p.part_file}`;
    }).join('\r\n');

    const ldrContent = `${header}\r\n${body}\r\n0`;
    const sha256 = await calculateSha256(ldrContent);
    
    return { ldrContent, sha256 };
}
