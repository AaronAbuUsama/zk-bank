// Central command registry - single source of truth for all commands
// Used by both Commander (CLI mode) and Ink (interactive mode)

import type { CommandDefinition } from "../ui/components/types";

export const commands: CommandDefinition[] = [
  // Build commands
  {
    id: "init",
    label: "Init",
    description: "Check dependencies and build the project",
    command: ["bun", "cli", "init"],
    category: "Build",
  },
  {
    id: "clean",
    label: "Clean",
    description: "Clean build artifacts",
    command: ["bun", "cli", "clean"],
    category: "Build",
  },

  // Test commands
  {
    id: "test",
    label: "Test",
    description: "Run unit tests",
    command: ["bun", "cli", "test"],
    category: "Test",
  },
  {
    id: "test-fork",
    label: "Test (Fork)",
    description: "Run fork tests using RPC_URL",
    command: ["bun", "cli", "test", "--fork"],
    category: "Test",
  },
  {
    id: "test-coverage",
    label: "Test Coverage",
    description: "Generate test coverage report",
    command: ["bun", "cli", "test", "--coverage"],
    category: "Test",
  },

  // Test tree commands
  {
    id: "test-tree-sync",
    label: "Sync Test Trees",
    description: "Scaffold or sync test definitions into Solidity tests",
    command: ["bun", "cli", "test-tree", "sync"],
    category: "Test Tree",
  },
  {
    id: "test-tree-check",
    label: "Check Test Trees",
    description: "Verify Solidity tests match definitions",
    command: ["bun", "cli", "test-tree", "check"],
    category: "Test Tree",
  },
  {
    id: "test-tree-generate",
    label: "Generate Test Markdown",
    description: "Generate markdown summary of test definitions",
    command: ["bun", "cli", "test-tree", "generate"],
    category: "Test Tree",
  },

  // Deploy commands
  {
    id: "deploy-dry",
    label: "Deploy (Dry Run)",
    description: "Simulate deployment without broadcasting",
    command: ["bun", "cli", "deploy", "--dry-run"],
    category: "Deploy",
  },
  {
    id: "deploy",
    label: "Deploy",
    description: "Deploy contracts to network",
    command: ["bun", "cli", "deploy"],
    category: "Deploy",
  },
  {
    id: "deploy-resume",
    label: "Resume Deploy",
    description: "Resume a failed deployment",
    command: ["bun", "cli", "deploy", "--resume"],
    category: "Deploy",
  },

  // Verify commands
  {
    id: "verify",
    label: "Verify",
    description: "Verify deployed contracts on block explorers",
    command: ["bun", "cli", "verify"],
    category: "Verify",
  },
  {
    id: "verify-etherscan",
    label: "Verify (Etherscan)",
    description: "Verify contracts on Etherscan",
    command: ["bun", "cli", "verify:etherscan"],
    category: "Verify",
  },
  {
    id: "verify-blockscout",
    label: "Verify (Blockscout)",
    description: "Verify contracts on Blockscout",
    command: ["bun", "cli", "verify:blockscout"],
    category: "Verify",
  },
  {
    id: "verify-sourcify",
    label: "Verify (Sourcify)",
    description: "Verify contracts on Sourcify",
    command: ["bun", "cli", "verify:sourcify"],
    category: "Verify",
  },

  // Chain control commands
  {
    id: "chain-status",
    label: "Chain Status",
    description: "Show current chain status (block, timestamp, gas)",
    command: ["bun", "cli", "chain", "status"],
    category: "Chain",
  },
  {
    id: "chain-mine-1",
    label: "Mine 1 Block",
    description: "Mine a single block",
    command: ["bun", "cli", "chain", "mine", "1"],
    category: "Chain",
  },
  {
    id: "chain-mine-10",
    label: "Mine 10 Blocks",
    description: "Mine 10 blocks",
    command: ["bun", "cli", "chain", "mine", "10"],
    category: "Chain",
  },
  {
    id: "chain-warp-1h",
    label: "Warp +1 Hour",
    description: "Advance chain time by 1 hour",
    command: ["bun", "cli", "chain", "warp", "+3600"],
    category: "Chain",
  },
  {
    id: "chain-warp-1d",
    label: "Warp +1 Day",
    description: "Advance chain time by 1 day",
    command: ["bun", "cli", "chain", "warp", "+86400"],
    category: "Chain",
  },
  {
    id: "chain-snapshot",
    label: "Create Snapshot",
    description: "Save current chain state",
    command: ["bun", "cli", "chain", "snapshot"],
    category: "Chain",
  },
  {
    id: "chain-reset",
    label: "Reset Chain",
    description: "Reset to initial fork state",
    command: ["bun", "cli", "chain", "reset"],
    category: "Chain",
  },
];
