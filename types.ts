
export interface Part {
  part_num: string;
  part_name: string;
  color_id: number;
  color_name: string;
  quantity: number;
}

export interface PlacedPart {
    part_file: string; // z.B. "3001.dat"
    color_id: number;
    position: {
        x: number;
        y: number;
        z: number;
    };
    matrix: number[]; // Array mit 9 Zahlen für die Rotationsmatrix
}

export interface BuildStep {
  step: number;
  instructions: string;
  image_prompt: string;
}

export interface LegoSet {
  title: string;
  description: string;
  parts_count: number;
  parts: Part[];
  placed_parts: PlacedPart[]; // Entscheidend für die LDR-Generierung
  build_steps: BuildStep[];
  rebrickable_validation?: {
    verified_count: number;
    total_count: number;
    error?: string;
  };
}

export enum Status {
    Idle = 'idle',
    Loading = 'loading',
    Success = 'success',
    Error = 'error',
}

export interface GenerationOptions {
    prompt: string;
    minParts?: number;
    maxParts?: number;
}
