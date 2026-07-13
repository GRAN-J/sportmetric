// =============================================================================
// DTOs de Protocolo para respuestas API
// =============================================================================
// Define la estructura de los datos de protocolo que enviamos al frontend
// =============================================================================

export interface MaterialDTO {
  id?: string;
  name: string;
  imageUrl?: string | null;
  order: number;
}

export interface ChecklistItemDTO {
  id?: string;
  text: string;
  order: number;
}

export interface StepDTO {
  id?: string;
  stepNumber: number;
  title: string;
  description: string;
  videoUrl?: string | null;
  order: number;
}

export interface InterruptionCriterionDTO {
  id?: string;
  text: string;
  order: number;
}

export interface DataRegistryDTO {
  id?: string;
  title: string;
  description: string;
  unit?: string | null;
}

export interface ProtocolDTO {
  id: string;
  categoryId: string;
  order: number;
  title: string;
  objective: string;
  description: string;
  materials: MaterialDTO[];
  checklistItems: ChecklistItemDTO[];
  steps: StepDTO[];
  interruptionCrit: InterruptionCriterionDTO[];
  dataRegistry?: DataRegistryDTO | null;
}

// DTO para la lista de protocolos (solo datos básicos
export interface ProtocolListItemDTO {
  id: string;
  categoryId: string;
  order: number;
  title: string;
  objective: string;
  description: string;
}
