// Shared types for CLI components

export type CommandDefinition = {
  id: string;
  label: string;
  description: string;
  command: string[];
  category: string;
};
