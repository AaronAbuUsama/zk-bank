// Shared types for CLI components

export interface CommandDefinition {
  id: string;
  label: string;
  description: string;
  command: string[];
  category: string;
}
